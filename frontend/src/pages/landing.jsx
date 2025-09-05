<<<<<<< HEAD
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}import React, { useState, useEffect } from 'react';
=======
import React, { useState, useEffect } from 'react';
>>>>>>> 0d5305f7febe8faf553ea853a2d0d2b9dc86e5d4
import { Link, useNavigate } from 'react-router-dom';
import { 
  Button, 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Chip,
  Avatar,
  Divider
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { deepPurple, grey, orange } from '@mui/material/colors';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import GroupIcon from '@mui/icons-material/Group';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import SchoolIcon from '@mui/icons-material/School';
import BusinessIcon from '@mui/icons-material/Business';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import CssBaseline from '@mui/material/CssBaseline';

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
        opacity: 0.15,
      }}
    >
      {[...Array(25)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: themeMode === 'dark' ? '3px' : '5px',
            height: themeMode === 'dark' ? '3px' : '5px',
            borderRadius: '50%',
            backgroundColor: themeMode === 'dark' 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(103, 58, 183, 0.1)',
            animation: `float ${4 + i % 5}s ease-in-out infinite`,
            animationDelay: `${i * 0.15}s`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            '@keyframes float': {
              '0%, 100%': {
                transform: 'translateY(0px) translateX(0px)',
                opacity: 0.2,
              },
              '50%': {
                transform: 'translateY(-30px) translateX(20px)',
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

// Use case card component
const UseCaseCard = ({ icon: Icon, title, description, users, delay }) => (
  <Card
    sx={{
      height: '100%',
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
    <CardContent sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Icon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
        <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {description}
      </Typography>
      <Chip label={users} size="small" color="primary" variant="outlined" />
    </CardContent>
  </Card>
);

export default function LandingPage() {
  const router = useNavigate();
  const [themeMode, setThemeMode] = useState(getInitialTheme());

  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  const handleThemeToggle = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
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
            <VideoCallIcon sx={{ color: 'primary.main', fontSize: 28 }} />
            <Typography variant="h6" component="h1" sx={{ fontWeight: 'bold' }}>
<<<<<<< HEAD
              Video Call
=======
              Apna Video Call
>>>>>>> 0d5305f7febe8faf553ea853a2d0d2b9dc86e5d4
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button 
              onClick={() => router("/aljk23")}
              variant="outlined"
              size="small"
            >
              Join as Guest
            </Button>
            
            <Button 
              onClick={() => router("/auth")}
              variant="outlined"
              size="small"
            >
              Register
            </Button>
            
            <Button 
              onClick={() => router("/auth")}
              variant="contained"
              size="small"
            >
              Login
            </Button>
            
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
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Hero Section */}
        <Box sx={{ 
          textAlign: 'center', 
          mb: 12,
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
            variant="h1" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              fontSize: { xs: '2.5rem', md: '4rem' },
              mb: 3,
            }}
          >
            <span style={{ color: orange[500] }}>See</span> the people who matter most
          </Typography>
          
          <Typography 
            variant="h5" 
            color="text.secondary" 
            sx={{ 
              mb: 6, 
              maxWidth: 700, 
              mx: 'auto',
              fontWeight: 300,
            }}
          >
            Transform distance into intimacy with crystal-clear video calls. 
            Every smile, every laugh, every moment shared as if you're sitting right next to each other.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              component={Link}
              to="/auth"
              variant="contained"
              size="large"
              startIcon={<VideoCallIcon />}
              sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
            >
              Get Started
            </Button>
            <Button
              onClick={() => router("/aljk23")}
              variant="outlined"
              size="large"
              sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
            >
              Try as Guest
            </Button>
          </Box>
        </Box>

        {/* Features Section */}
        <Box sx={{ mb: 12 }}>
          <Typography 
            variant="h3" 
            component="h2" 
            sx={{ 
              textAlign: 'center', 
              mb: 8,
              fontWeight: 'bold',
            }}
          >
<<<<<<< HEAD
            Why Choose Video Call?
=======
            Why Choose Apna Video Call?
>>>>>>> 0d5305f7febe8faf553ea853a2d0d2b9dc86e5d4
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard
                icon={VideoCallIcon}
                title="HD Video Quality"
                description="Experience crystal-clear video calls with adaptive quality that adjusts to your connection"
                delay={0.1}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard
                icon={GroupIcon}
                title="Group Meetings"
                description="Host meetings with multiple participants. Perfect for family gatherings and team collaborations"
                delay={0.2}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard
                icon={SecurityIcon}
                title="Secure & Private"
                description="Your conversations are protected with end-to-end encryption. Privacy is our priority"
                delay={0.3}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard
                icon={SpeedIcon}
                title="Lightning Fast"
                description="Optimized for low latency and smooth performance, even on slower connections"
                delay={0.4}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Use Cases Section */}
        <Box sx={{ mb: 12 }}>
          <Typography 
            variant="h3" 
            component="h2" 
            sx={{ 
              textAlign: 'center', 
              mb: 8,
              fontWeight: 'bold',
            }}
          >
            Perfect for Every Need
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={4}>
              <UseCaseCard
                icon={FamilyRestroomIcon}
                title="Family Connections"
                description="Stay connected with family members across the globe. Share moments, celebrate together, and maintain strong bonds."
                users="Families"
                delay={0.1}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <UseCaseCard
                icon={SchoolIcon}
                title="Online Education"
                description="Perfect for virtual classrooms, tutoring sessions, and educational meetings with crystal-clear audio and video."
                users="Students & Teachers"
                delay={0.2}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <UseCaseCard
                icon={BusinessIcon}
                title="Business Meetings"
                description="Professional video conferencing for remote teams, client meetings, and business presentations."
                users="Professionals"
                delay={0.3}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Stats Section */}
        <Box sx={{ 
          textAlign: 'center', 
          mb: 12,
          py: 6,
          backgroundColor: 'background.paper',
          borderRadius: 3,
          boxShadow: themeMode === 'dark' 
            ? '0 4px 20px rgba(0,0,0,0.3)' 
            : '0 4px 20px rgba(0,0,0,0.1)',
        }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
            Trusted by Millions
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={4}>
              <Typography variant="h3" component="div" sx={{ color: 'primary.main', fontWeight: 'bold', mb: 1 }}>
                10M+
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Active Users
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="h3" component="div" sx={{ color: 'primary.main', fontWeight: 'bold', mb: 1 }}>
                50M+
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Meetings Hosted
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="h3" component="div" sx={{ color: 'primary.main', fontWeight: 'bold', mb: 1 }}>
                99.9%
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Uptime
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* CTA Section */}
        <Box sx={{ 
          textAlign: 'center', 
          py: 8,
          backgroundColor: 'primary.main',
          borderRadius: 3,
          color: 'white',
        }}>
          <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Ready to Connect?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
<<<<<<< HEAD
            Join millions of users who trust Video Call for their communication needs
=======
            Join millions of users who trust Apna Video Call for their communication needs
>>>>>>> 0d5305f7febe8faf553ea853a2d0d2b9dc86e5d4
          </Typography>
          <Button
            component={Link}
            to="/auth"
            variant="contained"
            size="large"
            startIcon={<VideoCallIcon />}
            sx={{ 
              px: 6, 
              py: 2, 
              fontSize: '1.2rem',
              backgroundColor: 'white',
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'grey.100',
              },
            }}
          >
            Start Your First Call
          </Button>
        </Box>
      </Container>
    </ThemeProvider>
  );
<<<<<<< HEAD
}
=======
} 
>>>>>>> 0d5305f7febe8faf553ea853a2d0d2b9dc86e5d4
