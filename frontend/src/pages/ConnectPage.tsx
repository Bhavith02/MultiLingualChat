import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Avatar,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { chatAPI } from '../services/api';
import { useStore } from '../store';

export default function ConnectPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [targetUser, setTargetUser] = useState<any>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const encodedId = searchParams.get('u');
    
    if (!encodedId) {
      setError('Invalid QR code');
      setLoading(false);
      return;
    }

    // Check if user is logged in
    if (!user) {
      // Store the connect URL for after login
      sessionStorage.setItem('pendingConnect', encodedId);
      navigate('/login');
      return;
    }

    // Decode QR and fetch user info
    chatAPI.decodeQR(encodedId)
      .then((response) => {
        if (response.success && response.data.user) {
          setTargetUser(response.data.user);
        } else {
          setError('User not found');
        }
      })
      .catch((err) => {
        console.error('Decode error:', err);
        setError('Failed to decode QR code');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [searchParams, user, navigate]);

  const handleConnect = async () => {
    if (!targetUser) return;

    setLoading(true);
    try {
      const response = await chatAPI.quickConnect(targetUser.id);
      if (response.success && response.data.room) {
        setConnected(true);
        // Navigate to chat after 1.5 seconds
        setTimeout(() => {
          navigate(`/dashboard/${response.data.room.id}`);
        }, 1500);
      }
    } catch (err: any) {
      console.error('Connect error:', err);
      setError(err.response?.data?.error || 'Failed to connect');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <CircularProgress size={60} sx={{ color: 'white' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          p: 3,
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={8}
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 3,
            }}
          >
            <ErrorIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Connection Failed
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {error}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/')}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                px: 4,
                py: 1.5,
              }}
            >
              Go to Home
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  if (connected) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          p: 3,
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={8}
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 3,
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Connected Successfully!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Redirecting to chat...
            </Typography>
            <CircularProgress size={40} />
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 3,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={8}
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 3,
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Connect with
          </Typography>

          {targetUser && (
            <Box sx={{ mb: 4 }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  mx: 'auto',
                  mb: 2,
                  fontSize: 40,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                {targetUser.displayName?.[0] || targetUser.username?.[0] || '?'}
              </Avatar>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                {targetUser.displayName || targetUser.username}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                @{targetUser.username}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                Preferred Language: {targetUser.preferredLanguage || 'English'}
              </Typography>
            </Box>
          )}

          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleConnect}
            disabled={loading}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              mb: 2,
            }}
          >
            {loading ? 'Connecting...' : 'Start Chatting'}
          </Button>

          <Button
            variant="outlined"
            fullWidth
            onClick={() => navigate('/')}
            sx={{
              borderColor: 'primary.main',
              color: 'primary.main',
            }}
          >
            Cancel
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}
