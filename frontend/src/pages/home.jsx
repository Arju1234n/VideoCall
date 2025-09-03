import React, { useContext, useState, useEffect } from 'react';
import withAuth from '../utils/withAuth';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  IconButton, 
  TextField, 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardContent,
  AppBar,
  Toolbar,
  Avatar,
  Chip,
  CircularProgress,
  Snackbar
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { deepPurple, grey } from '@mui/material/colors';
import RestoreIcon from '@mui/icons-material/Restore';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import GroupIcon from '@mui/icons-material/Group';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthContext } from '../contexts/AuthContext';

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
      main: grey[500],
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
            transform: 'translateY(-4px)',
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
        outlined: {
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            transition: 'all 0.3s ease',
            '&:hover fieldset': {
              borderColor: deepPurple[300],
            },
            '&.Mui-focused fieldset': {
              borderColor: deepPurple[500],
            },
          },
        },
      },
    },
  },
});

// Animated background component
const AnimatedBackground = ({ themeMode }) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: -1,
        opacity: 0.2,
      }}
    >
      {[...Array(20)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: themeMode === 'dark' ? '4px' : '6px',
            height: themeMode === 'dark' ? '4px' : '6px',
            borderRadius: '50%',
            backgroundColor: themeMode === 'dark' 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(103, 58, 183, 0.1)',
            animation: `float ${3 + i % 4}s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            '@keyframes float': {
              '0%, 100%': {
                transform: 'translateY(0px) translateX(0px)',
                opacity: 0.3,
              },
              '50%': {
                transform: 'translateY(-25px) translateX(15px)',
                opacity: 0.8,
              },
            },
          }}
        />
      ))}
    </Box>
  );
};

// Feature card component
const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <Card
    sx={{
      height: '100%',
      textAlign: 'center',
      animation: `fadeInUp 0.8s ease-out ${delay}s both`,
      '@keyframes fadeInUp': {
        '0%': {
          opacity: 0,
          transform: 'translateY(30px)',
        },
        '100%': {
          opacity: 1,
          transform: 'translateY(0)',
        },
      },
    }}
  >
    <CardContent sx={{ py: 4 }}>
      <Icon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
      <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </CardContent>
  </Card>
);

function HomeComponent() {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [themeMode, setThemeMode] = useState(getInitialTheme());
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const { addToUserHistory } = useContext(AuthContext);

  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  const handleThemeToggle = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleJoinVideoCall = async () => {
    if (!meetingCode.trim()) {
      setError("Please enter a meeting code");
      setOpenSnackbar(true);
      return;
    }

    try {
      setLoading(true);
      await addToUserHistory(meetingCode);
      navigate(`/${meetingCode}`);
    } catch (err) {
      setError("Failed to join meeting");
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = () => {
    const newMeetingCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    setMeetingCode(newMeetingCode);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth");
  };

  const theme = getTheme(themeMode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AnimatedBackground themeMode={themeMode} />
      
      {/* App Bar */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          backgroundColor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
            <HomeIcon sx={{ color: 'primary.main', fontSize: 28 }} />
            <Typography variant="h6" component="h1" sx={{ fontWeight: 'bold' }}>
              Apna Video Call
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton 
              onClick={() => navigate("/history")}
              sx={{ 
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
            >
              <RestoreIcon />
            </IconButton>
            
            <IconButton 
              onClick={handleThemeToggle}
              sx={{
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  transform: 'rotate(180deg)',
                },
              }}
            >
              {themeMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
            
            <Button 
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              variant="outlined"
              size="small"
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Hero Section */}
        <Box sx={{ 
          textAlign: 'center', 
          mb: 8,
          animation: 'fadeInDown 1s ease-out',
          '@keyframes fadeInDown': {
            '0%': {
              opacity: 0,
              transform: 'translateY(-30px)',
            },
            '100%': {
              opacity: 1,
              transform: 'translateY(0)',
            },
          },
        }}>
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #673ab7, #9c27b0)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 3,
            }}
          >
            Quality Video Calls for Quality Education
          </Typography>
          
          <Typography variant="h6" color="text.secondary" sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}>
            Experience seamless video conferencing with crystal-clear audio, high-definition video, and advanced features designed for educational excellence.
          </Typography>

          {/* Meeting Code Input */}
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            justifyContent: 'center', 
            alignItems: 'center',
            flexWrap: 'wrap',
            mb: 4,
          }}>
            <TextField
              value={meetingCode}
              onChange={(e) => setMeetingCode(e.target.value)}
              label="Meeting Code"
              variant="outlined"
              size="large"
              sx={{ minWidth: 250 }}
              placeholder="Enter meeting code"
            />
            <Button
              onClick={handleJoinVideoCall}
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <VideoCallIcon />}
              sx={{ px: 4, py: 1.5 }}
            >
              {loading ? 'Joining...' : 'Join Meeting'}
            </Button>
            <Button
              onClick={handleCreateMeeting}
              variant="outlined"
              size="large"
              sx={{ px: 4, py: 1.5 }}
            >
              Create New
            </Button>
          </Box>

          {meetingCode && (
            <Chip 
              label={`Meeting Code: ${meetingCode}`}
              color="primary"
              variant="outlined"
              sx={{ mt: 2 }}
            />
          )}
        </Box>

        {/* Features Section */}
        <Box sx={{ mb: 8 }}>
          <Typography 
            variant="h4" 
            component="h2" 
            sx={{ 
              textAlign: 'center', 
              mb: 6,
              fontWeight: 'bold',
            }}
          >
            Why Choose Our Platform?
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard
                icon={VideoCallIcon}
                title="HD Video Quality"
                description="Crystal clear video with adaptive quality for the best experience"
                delay={0.1}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard
                icon={GroupIcon}
                title="Group Meetings"
                description="Host meetings with multiple participants seamlessly"
                delay={0.2}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard
                icon={SecurityIcon}
                title="Secure & Private"
                description="End-to-end encryption ensures your meetings stay private"
                delay={0.3}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard
                icon={SpeedIcon}
                title="Lightning Fast"
                description="Optimized for low latency and smooth performance"
                delay={0.4}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Quick Actions */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              onClick={() => navigate("/history")}
              variant="outlined"
              startIcon={<RestoreIcon />}
              size="large"
            >
              View History
            </Button>
            <Button
              onClick={handleCreateMeeting}
              variant="contained"
              startIcon={<VideoCallIcon />}
              size="large"
            >
              Start New Meeting
            </Button>
          </Box>
        </Box>
      </Container>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={() => setOpenSnackbar(false)}
        message={error}
        sx={{
          '& .MuiSnackbarContent-root': {
            backgroundColor: '#f44336',
          },
        }}
      />
    </ThemeProvider>
  );
}

export default withAuth(HomeComponent); 