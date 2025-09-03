import React, { useEffect, useRef, useState } from 'react';
import io from "socket.io-client";
import { 
  Badge, 
  IconButton, 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Card, 
  AppBar,
  Toolbar,
  Drawer,
  Divider,
  Chip,
  Paper
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { deepPurple, orange } from '@mui/material/colors';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import CssBaseline from '@mui/material/CssBaseline';
import server from '../environment';

const server_url = server;
var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

const getInitialTheme = () => {
  const saved = localStorage.getItem('themeMode');
  return saved === 'dark' ? 'dark' : 'light';
};

const getTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: deepPurple[500],
      light: deepPurple[300],
      dark: deepPurple[700],
    },
    secondary: {
      main: orange[500],
    },
    background: {
      default: mode === 'dark' ? '#0f0f23' : '#f8f9fa',
      paper: mode === 'dark' ? '#16213e' : '#ffffff',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: mode === 'dark' 
              ? '0 8px 25px rgba(0,0,0,0.3)' 
              : '0 8px 25px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.1)',
          },
        },
      },
    },
  },
});

export default function VideoMeetComponent() {
    var socketRef = useRef();
    let socketIdRef = useRef();
    let localVideoref = useRef();
    const videoRef = useRef([]);

    let [videoAvailable, setVideoAvailable] = useState(true);
    let [audioAvailable, setAudioAvailable] = useState(true);
    let [video, setVideo] = useState([]);
    let [audio, setAudio] = useState();
    let [screen, setScreen] = useState();
    let [showModal, setModal] = useState(true);
    let [screenAvailable, setScreenAvailable] = useState();
    let [messages, setMessages] = useState([]);
    let [message, setMessage] = useState("");
    let [newMessages, setNewMessages] = useState(3);
    let [askForUsername, setAskForUsername] = useState(true);
    let [username, setUsername] = useState("");
    let [videos, setVideos] = useState([]);
    let [themeMode, setThemeMode] = useState(getInitialTheme());
    let [participants, setParticipants] = useState([]);
    let [isConnecting, setIsConnecting] = useState(false);

    useEffect(() => {
        localStorage.setItem('themeMode', themeMode);
    }, [themeMode]);

    useEffect(() => {
        console.log("HELLO");
        getPermissions();
    }, []);

    let getDislayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .then((stream) => { })
                    .catch((e) => console.log(e));
            }
        }
    };

    const getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoPermission) {
                setVideoAvailable(true);
                console.log('Video permission granted');
            } else {
                setVideoAvailable(false);
                console.log('Video permission denied');
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (audioPermission) {
                setAudioAvailable(true);
                console.log('Audio permission granted');
            } else {
                setAudioAvailable(false);
                console.log('Audio permission denied');
            }

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

            if (videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoref.current) {
                        localVideoref.current.srcObject = userMediaStream;
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
            console.log("SET STATE HAS ", video, audio);
        }
    }, [video, audio]);

    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    };

    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop());
        } catch (e) { console.log(e); }

        window.localStream = stream;
        localVideoref.current.srcObject = stream;

        for (let id in connections) {
            if (id === socketIdRef.current) continue;

            connections[id].addStream(window.localStream);

            connections[id].createOffer().then((description) => {
                console.log(description);
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }));
                    })
                    .catch(e => console.log(e));
            });
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoref.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            } catch (e) { console.log(e); }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            localVideoref.current.srcObject = window.localStream;

            for (let id in connections) {
                connections[id].addStream(window.localStream);

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }));
                        })
                        .catch(e => console.log(e));
                });
            }
        });
    };

    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e));
        } else {
            try {
                let tracks = localVideoref.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            } catch (e) { console.log(e); }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            localVideoref.current.srcObject = window.localStream;

            for (let id in connections) {
                connections[id].addStream(window.localStream);

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }));
                        })
                        .catch(e => console.log(e));
                });
            }
        }
    };

    let getDislayMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop());
        } catch (e) { console.log(e); }

        window.localStream = stream;
        localVideoref.current.srcObject = stream;

        for (let id in connections) {
            if (id === socketIdRef.current) continue;

            connections[id].addStream(window.localStream);

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }));
                    })
                    .catch(e => console.log(e));
            });
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false);

            try {
                let tracks = localVideoref.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            } catch (e) { console.log(e); }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            localVideoref.current.srcObject = window.localStream;

            for (let id in connections) {
                connections[id].addStream(window.localStream);

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }));
                        })
                        .catch(e => console.log(e));
                });
            }
        });
    };

    let gotMessageFromServer = (fromId, message) => {
        const messageObj = JSON.parse(message);
        const id = messageObj.socketId ? messageObj.socketId : fromId;

        if (messageObj.sdp) {
            connections[id].setRemoteDescription(new RTCSessionDescription(messageObj.sdp))
                .then(() => {
                    if (messageObj.sdp.type === 'offer') {
                        connections[id].createAnswer()
                            .then((description) => {
                                connections[id].setLocalDescription(description)
                                    .then(() => {
                                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }));
                                    })
                                    .catch(e => console.log(e));
                            })
                            .catch(e => console.log(e));
                    }
                })
                .catch(e => console.log(e));
        } else if (messageObj.ice) {
            connections[id].addIceCandidate(new RTCIceCandidate(messageObj.ice))
                .catch(e => console.log(e));
        }
    };

    let connectToSocketServer = () => {
        socketRef.current = io(server_url);

        socketRef.current.on('connect', () => {
            socketIdRef.current = socketRef.current.id;
            console.log('Connected to server');
            setIsConnecting(false);
        });

        socketRef.current.on('user-joined', (socketId) => {
            console.log('User joined:', socketId);
            const peerConnection = new RTCPeerConnection(peerConfigConnections);
            connections[socketId] = peerConnection;

            peerConnection.ontrack = (event) => {
                console.log('Got remote stream');
                setVideos(prevVideos => [...prevVideos, { socketId: socketId, stream: event.streams[0] }]);
                setParticipants(prev => [...prev, { id: socketId, name: `User ${socketId.slice(-4)}` }]);
            };

            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    socketRef.current.emit('signal', socketId, JSON.stringify({ 'ice': event.candidate }));
                }
            };

            if (window.localStream) {
                window.localStream.getTracks().forEach(track => {
                    peerConnection.addTrack(track, window.localStream);
                });
            }

            peerConnection.createOffer()
                .then((description) => {
                    peerConnection.setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', socketId, JSON.stringify({ 'sdp': peerConnection.localDescription }));
                        })
                        .catch(e => console.log(e));
                })
                .catch(e => console.log(e));
        });

        socketRef.current.on('signal', gotMessageFromServer);

        socketRef.current.on('user-left', (socketId) => {
            console.log('User left:', socketId);
            if (connections[socketId]) {
                connections[socketId].close();
                delete connections[socketId];
            }
            setVideos(prevVideos => prevVideos.filter(video => video.socketId !== socketId));
            setParticipants(prev => prev.filter(p => p.id !== socketId));
        });

        socketRef.current.on('chat-message', (message, sender, socketIdSender) => {
            addMessage(message, sender, socketIdSender);
        });
    };

    let silence = () => {
        let ctx = new AudioContext();
        let oscillator = ctx.createOscillator();
        let dst = oscillator.connect(ctx.createMediaStreamDestination());
        oscillator.start();
        ctx.resume();
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
    };

    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height });
        canvas.getContext('2d').fillRect(0, 0, width, height);
        let stream = canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0], { enabled: false });
    };

    let handleVideo = () => {
        setVideo(!video);
    };

    let handleAudio = () => {
        setAudio(!audio);
    };

    useEffect(() => {
        if (screen !== undefined) {
            getDislayMedia();
        }
    }, [screen]);

    let handleScreen = () => {
        setScreen(!screen);
    };

    let handleEndCall = () => {
        try {
            let tracks = localVideoref.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        } catch (e) { }
        window.location.href = "/";
    };

    let openChat = () => {
        setModal(true);
        setNewMessages(0);
    };

    let closeChat = () => {
        setModal(false);
    };

    let handleMessage = (e) => {
        setMessage(e.target.value);
    };

    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    };

    let sendMessage = () => {
        if (message.trim()) {
            socketRef.current.emit('chat-message', message, username);
            setMessage("");
        }
    };

    let connect = () => {
        if (username.trim()) {
            setAskForUsername(false);
            setIsConnecting(true);
            getMedia();
        }
    };

    const theme = getTheme(themeMode);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            
            {askForUsername ? (
                <Container maxWidth="sm" sx={{ py: 8 }}>
                    <Card sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
                            Join Meeting
                        </Typography>
                        
                        <TextField 
                            fullWidth
                            label="Enter your name" 
                            value={username} 
                            onChange={e => setUsername(e.target.value)}
                            variant="outlined"
                            sx={{ mb: 3 }}
                            placeholder="Your name"
                        />
                        
                        <Button 
                            variant="contained" 
                            onClick={connect}
                            disabled={!username.trim() || isConnecting}
                            size="large"
                            sx={{ px: 4, py: 1.5 }}
                        >
                            {isConnecting ? 'Connecting...' : 'Join Meeting'}
                        </Button>

                        <Box sx={{ mt: 4 }}>
                            <video 
                                ref={localVideoref} 
                                autoPlay 
                                muted
                                style={{
                                    width: '100%',
                                    maxWidth: '400px',
                                    borderRadius: '8px',
                                    backgroundColor: '#000'
                                }}
                            />
                        </Box>
                    </Card>
                </Container>
            ) : (
                <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <AppBar position="static" elevation={0} sx={{ backgroundColor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Toolbar>
                            <Typography variant="h6" component="h1" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
                                Meeting Room
                            </Typography>
                            <Chip 
                                icon={<GroupIcon />} 
                                label={`${participants.length + 1} participants`} 
                                color="primary" 
                                variant="outlined"
                                sx={{ mr: 2 }}
                            />
                        </Toolbar>
                    </AppBar>

                    {/* Main Content */}
                    <Box sx={{ flex: 1, display: 'flex', position: 'relative' }}>
                        {/* Video Grid */}
                        <Box sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
                            {/* Main Video */}
                            <Box sx={{ flex: 1, position: 'relative', mb: 2 }}>
                                <video 
                                    ref={localVideoref} 
                                    autoPlay 
                                    muted
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        borderRadius: '12px',
                                        backgroundColor: '#000'
                                    }}
                                />
                                <Box sx={{ position: 'absolute', bottom: 16, left: 16 }}>
                                    <Chip 
                                        icon={<PersonIcon />} 
                                        label={username} 
                                        color="primary" 
                                        sx={{ backgroundColor: 'rgba(0,0,0,0.7)', color: 'white' }}
                                    />
                                </Box>
                            </Box>

                            {/* Remote Videos Grid */}
                            {videos.length > 0 && (
                                <Grid container spacing={2}>
                                    {videos.map((video) => (
                                        <Grid item xs={12} sm={6} md={4} key={video.socketId}>
                                            <Box sx={{ position: 'relative' }}>
                                                <video
                                                    data-socket={video.socketId}
                                                    ref={ref => {
                                                        if (ref && video.stream) {
                                                            ref.srcObject = video.stream;
                                                        }
                                                    }}
                                                    autoPlay
                                                    style={{
                                                        width: '100%',
                                                        height: '200px',
                                                        objectFit: 'cover',
                                                        borderRadius: '8px',
                                                        backgroundColor: '#000'
                                                    }}
                                                />
                                                <Box sx={{ position: 'absolute', bottom: 8, left: 8 }}>
                                                    <Chip 
                                                        label={`User ${video.socketId.slice(-4)}`} 
                                                        size="small"
                                                        sx={{ backgroundColor: 'rgba(0,0,0,0.7)', color: 'white' }}
                                                    />
                                                </Box>
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </Box>

                        {/* Chat Drawer */}
                        <Drawer
                            anchor="right"
                            open={showModal}
                            onClose={closeChat}
                            sx={{
                                '& .MuiDrawer-paper': {
                                    width: 320,
                                    backgroundColor: 'background.paper',
                                },
                            }}
                        >
                            <Box sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        Chat
                                    </Typography>
                                    <IconButton onClick={closeChat}>
                                        <CloseIcon />
                                    </IconButton>
                                </Box>
                                
                                <Divider sx={{ mb: 2 }} />
                                
                                {/* Messages */}
                                <Box sx={{ height: 'calc(100vh - 200px)', overflowY: 'auto', mb: 2 }}>
                                    {messages.length > 0 ? (
                                        messages.map((item, index) => (
                                            <Box key={index} sx={{ mb: 2 }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                                    {item.sender}
                                                </Typography>
                                                <Typography variant="body2" sx={{ backgroundColor: 'background.paper', p: 1, borderRadius: 1 }}>
                                                    {item.data}
                                                </Typography>
                                            </Box>
                                        ))
                                    ) : (
                                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                                            No messages yet
                                        </Typography>
                                    )}
                                </Box>
                                
                                {/* Message Input */}
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <TextField
                                        fullWidth
                                        value={message}
                                        onChange={handleMessage}
                                        placeholder="Type a message..."
                                        variant="outlined"
                                        size="small"
                                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                    />
                                    <IconButton onClick={sendMessage} color="primary">
                                        <SendIcon />
                                    </IconButton>
                                </Box>
                            </Box>
                        </Drawer>
                    </Box>

                    {/* Control Bar */}
                    <Paper 
                        elevation={8} 
                        sx={{ 
                            p: 2, 
                            backgroundColor: 'background.paper',
                            borderTop: '1px solid',
                            borderColor: 'divider'
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                            <IconButton 
                                onClick={handleVideo} 
                                sx={{ 
                                    backgroundColor: video ? 'primary.main' : 'error.main',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: video ? 'primary.dark' : 'error.dark',
                                    }
                                }}
                            >
                                {video ? <VideocamIcon /> : <VideocamOffIcon />}
                            </IconButton>
                            
                            <IconButton 
                                onClick={handleEndCall} 
                                sx={{ 
                                    backgroundColor: 'error.main',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: 'error.dark',
                                    }
                                }}
                            >
                                <CallEndIcon />
                            </IconButton>
                            
                            <IconButton 
                                onClick={handleAudio} 
                                sx={{ 
                                    backgroundColor: audio ? 'primary.main' : 'error.main',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: audio ? 'primary.dark' : 'error.dark',
                                    }
                                }}
                            >
                                {audio ? <MicIcon /> : <MicOffIcon />}
                            </IconButton>

                            {screenAvailable && (
                                <IconButton 
                                    onClick={handleScreen} 
                                    sx={{ 
                                        backgroundColor: screen ? 'secondary.main' : 'primary.main',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: screen ? 'secondary.dark' : 'primary.dark',
                                        }
                                    }}
                                >
                                    {screen ? <StopScreenShareIcon /> : <ScreenShareIcon />}
                                </IconButton>
                            )}

                            <Badge badgeContent={newMessages} max={99} color="error">
                                <IconButton 
                                    onClick={openChat} 
                                    sx={{ 
                                        backgroundColor: 'primary.main',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: 'primary.dark',
                                        }
                                    }}
                                >
                                    <ChatIcon />
                                </IconButton>
                            </Badge>
                        </Box>
                    </Paper>
                </Box>
            )}
        </ThemeProvider>
    );
} 