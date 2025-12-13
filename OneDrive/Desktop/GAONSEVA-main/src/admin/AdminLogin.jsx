import React, { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Paper, Alert, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase'; // तुम्हाला firebase.js फाईल तयार करावी लागेल
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const navigate = useNavigate();

  // Debug: Log when component mounts
  React.useEffect(() => {
    console.log('AdminLogin component mounted');
    // Ensure body doesn't have overflow hidden
    document.body.style.overflow = 'auto';
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!username.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, username, password);
      navigate('/admin/panel');
    } catch (error) {
      console.error('Login error:', error);
      switch (error.code) {
        case 'auth/user-not-found':
          setError('No account found with this email address');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address');
          break;
        case 'auth/user-disabled':
          setError('This account has been disabled');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please try again later');
          break;
        default:
          setError('Login failed. Please check your credentials and try again');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail.trim()) {
      setError('Please enter your email address');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSuccess(true);
      setForgotPasswordOpen(false);
      setResetEmail('');
    } catch (error) {
      console.error('Password reset error:', error);
      switch (error.code) {
        case 'auth/user-not-found':
          setError('No account found with this email address');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address');
          break;
        default:
          setError('Failed to send reset email. Please try again');
      }
    }
  };
  
  const handleBack = () => {
    navigate('/'); // वेबसाईटच्या होमपेजवर परत जा
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh', 
        backgroundColor: '#ffffff',
        position: 'relative',
        zIndex: 1,
        width: '100%',
        padding: 2
      }}
    >
      <Container maxWidth="xs" sx={{ width: '100%' }}>
        <Paper 
          elevation={3} 
          sx={{ 
            padding: 4, 
            borderRadius: 3,
            width: '100%',
            maxWidth: '100%',
            backgroundColor: '#ffffff',
            border: '1px solid #e0e0e0'
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom align="center" fontWeight="bold" sx={{ color: '#1976d2', mb: 3 }}>
            Admin Login
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Email Address"
              name="username"
              type="email"
              autoComplete="email"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#1976d2'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1976d2'
                  }
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#1976d2'
                }
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#1976d2'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1976d2'
                  }
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#1976d2'
                }
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 3, 
                mb: 1,
                backgroundColor: '#1976d2',
                color: '#ffffff',
                fontWeight: 600,
                py: 1.5,
                '&:hover': {
                  backgroundColor: '#1565c0'
                }
              }}
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
            
            <Button
              fullWidth
              variant="text"
              onClick={() => setForgotPasswordOpen(true)}
              disabled={loading}
              sx={{ 
                mt: 1, 
                textTransform: 'none',
                color: '#1976d2',
                '&:hover': {
                  backgroundColor: '#e3f2fd'
                }
              }}
            >
              Forgot Password?
            </Button>

            <Divider sx={{ my: 2, borderColor: '#e0e0e0' }} />
            <Button
              fullWidth
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              sx={{
                borderColor: '#1976d2',
                color: '#1976d2',
                '&:hover': {
                  borderColor: '#1565c0',
                  backgroundColor: '#e3f2fd'
                }
              }}
            >
              Back to Website
            </Button>
          </Box>
        </Paper>
      </Container>

      {/* Forgot Password Dialog */}
      <Dialog 
        open={forgotPasswordOpen} 
        onClose={() => setForgotPasswordOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: '#ffffff',
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ color: '#1a1a1a', fontWeight: 600 }}>Reset Password</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
            Enter your email address and we'll send you a link to reset your password.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#1976d2'
                }
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setForgotPasswordOpen(false)}
            sx={{ color: '#666' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleForgotPassword} 
            variant="contained"
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0'
              }
            }}
          >
            Send Reset Email
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={resetSuccess}
        autoHideDuration={6000}
        onClose={() => setResetSuccess(false)}
      >
        <Alert onClose={() => setResetSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Password reset email sent! Please check your inbox.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminLogin;