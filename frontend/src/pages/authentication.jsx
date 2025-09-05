import React, { useState, useContext, useEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import CssBaseline from '@mui/material/CssBaseline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { deepPurple, grey } from '@mui/material/colors';
import Snackbar from '@mui/material/Snackbar';
import { AuthContext } from '../contexts/AuthContext';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

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
      default: mode === 'dark' ? '#1a1a2e' : '#f0f2f5',
      paper: mode === 'dark' ? '#16213e' : '#ffffff',
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: mode === 'dark' ? grey[700] : grey[400],
              transition: 'border-color 0.3s ease',
            },
            '&:hover fieldset': {
              borderColor: mode === 'dark' ? grey[500] : grey[600],
            },
            '&.Mui-focused fieldset': {
              borderColor: deepPurple[500],
            },
          },
          '& .MuiInputLabel-root': {
            color: mode === 'dark' ? grey[400] : grey[700],
            transition: 'color 0.3s ease',
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: deepPurple[500],
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          backgroundColor: deepPurple[600],
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: deepPurple[700],
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          },
        },
        outlined: {
          color: deepPurple[500],
          borderColor: deepPurple[500],
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: deepPurple[50],
            borderColor: deepPurple[700],
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'dark' ? '#16213e' : '#ffffff',
          transition: 'background-color 0.5s ease',
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
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: 0,
      }}
    >
      {/* Floating particles */}
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
            animation: `float ${3 + i % 3}s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            '@keyframes float': {
              '0%, 100%': {
                transform: 'translateY(0px) translateX(0px)',
                opacity: 0.3,
              },
              '50%': {
                transform: 'translateY(-20px) translateX(10px)',
                opacity: 0.8,
              },
            },
          }}
        />
      ))}
      
      {/* Geometric shapes */}
      {[...Array(8)].map((_, i) => (
        <Box
          key={`shape-${i}`}
          sx={{
            position: 'absolute',
            width: themeMode === 'dark' ? '60px' : '80px',
            height: themeMode === 'dark' ? '60px' : '80px',
            border: `2px solid ${themeMode === 'dark' 
              ? 'rgba(255, 255, 255, 0.05)' 
              : 'rgba(103, 58, 183, 0.05)'}`,
            borderRadius: i % 2 === 0 ? '50%' : '0%',
            animation: `rotate ${8 + i % 4}s linear infinite`,
            animationDelay: `${i * 0.5}s`,
            left: `${10 + (i * 12) % 80}%`,
            top: `${15 + (i * 8) % 70}%`,
            '@keyframes rotate': {
              '0%': {
                transform: 'rotate(0deg) scale(1)',
                opacity: 0.1,
              },
              '50%': {
                transform: 'rotate(180deg) scale(1.2)',
                opacity: 0.3,
              },
              '100%': {
                transform: 'rotate(360deg) scale(1)',
                opacity: 0.1,
              },
            },
          }}
        />
      ))}
    </Box>
  );
};

export default function Authentication() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [formState, setFormState] = useState(0);
  const [open, setOpen] = useState(false);
  const [themeMode, setThemeMode] = useState(getInitialTheme());

  const { handleRegister, handleLogin } = useContext(AuthContext);

  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  const handleThemeToggle = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleAuth = async () => {
    try {
      setError('');
      setMessage('');
      
      if (formState === 0) {
        await handleLogin(username, password);
      } else {
        const result = await handleRegister(name, username, password);
        setMessage(result);
        setOpen(true);
        setUsername('');
        setPassword('');
        setName('');
        setFormState(0);
      }
    } catch (err) {
      let errorMessage = 'An unexpected error occurred.';
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      setOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpen(false);
    setMessage('');
    setError('');
  };

  const theme = getTheme(themeMode);

  return (
    <ThemeProvider theme={theme}>
      <Grid container component="main" sx={{ height: '100vh' }}>
        <CssBaseline />
        {/* Animated Background */}
        <AnimatedBackground themeMode={themeMode} />
        
        {/* Theme toggle button */}
        <Box sx={{ position: 'absolute', top: 16, right: 24, zIndex: 10 }}>
          <Button 
            onClick={handleThemeToggle} 
            startIcon={themeMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />} 
            variant="outlined"
            size="small"
            sx={{
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'rotate(180deg)',
              },
            }}
          >
            {themeMode === 'dark' ? 'Light' : 'Dark'} Mode
          </Button>
        </Box>

        <Grid 
          item 
          xs={12} 
          component={Paper} 
          elevation={6} 
          square
          sx={{
            backgroundColor: themeMode === 'dark' ? '#0f0f23' : '#e3f2fd',
            background: themeMode === 'dark' 
              ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
              : 'linear-gradient(135deg, #e3f2fd 0%, #f0f2f5 50%, #ffffff 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.5s ease',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              maxWidth: '400px',
              width: '100%',
              mx: 2,
              position: 'relative',
              zIndex: 2,
              animation: 'fadeInUp 0.8s ease-out',
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
            <Avatar 
              sx={{ 
                m: 1, 
                bgcolor: 'secondary.main',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                },
              }}
            >
              <LockOutlinedIcon />
            </Avatar>
            <Typography 
              component="h1" 
              variant="h5" 
              sx={{ 
                mb: 2,
                transition: 'color 0.3s ease',
              }}
            >
              {formState === 0 ? "Sign In" : "Sign Up"}
            </Typography>
            <div style={{ marginBottom: '24px' }}>
              <Button 
                variant={formState === 0 ? "contained" : "outlined"} 
                onClick={() => setFormState(0)}
                sx={{ mr: 1 }}
              >
                Sign In
              </Button>
              <Button 
                variant={formState === 1 ? "contained" : "outlined"} 
                onClick={() => setFormState(1)}
              >
                Sign Up
              </Button>
            </div>
            <Box component="form" noValidate sx={{ mt: 1, width: '100%' }}>
              {formState === 1 && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="fullName"
                  label="Full Name"
                  name="fullName"
                  value={name}
                  autoFocus
                  onChange={(e) => setName(e.target.value)}
                />
              )}
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                value={username}
                autoFocus={formState === 0}
                onChange={(e) => setUsername(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                value={password}
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                id="password"
              />
              <Button
                type="button"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={handleAuth}
              >
                {formState === 0 ? "Login" : "Register"}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        message={message || error}
        sx={{
          '& .MuiSnackbarContent-root': {
            backgroundColor: error ? '#f44336' : '#4caf50',
          },
        }}
      />
    </ThemeProvider>
  );
} 