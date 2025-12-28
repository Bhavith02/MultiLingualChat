import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { userAPI, chatAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';

interface ConnectByUsernameProps {
  open: boolean;
  onClose: () => void;
}

export default function ConnectByUsername({ open, onClose }: ConnectByUsernameProps) {
  const navigate = useNavigate();
  const { setChatRooms } = useStore();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleConnect = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // First, search for the user by username
      const searchResponse = await userAPI.searchByUsername(username.trim());
      
      console.log('Search response:', searchResponse);
      
      if (!searchResponse.success || !searchResponse.data.users || searchResponse.data.users.length === 0) {
        setError('User not found. Make sure you are not searching for yourself.');
        setLoading(false);
        return;
      }

      // Find exact match (case-insensitive)
      const targetUser = searchResponse.data.users.find(
        (u: { username: string }) => u.username.toLowerCase() === username.trim().toLowerCase()
      );

      if (!targetUser) {
        // If no exact match, use the first result
        if (searchResponse.data.users.length === 1) {
          setError(`Did you mean "${searchResponse.data.users[0].username}"?`);
        } else {
          setError(`No exact match. Found ${searchResponse.data.users.length} similar users. Try the exact username.`);
        }
        setLoading(false);
        return;
      }

      console.log('Connecting to user:', targetUser);

      // Then connect with the user
      const connectResponse = await userAPI.quickConnect(targetUser.id);
      
      console.log('Connect response:', connectResponse);

      if (connectResponse.success && connectResponse.data.room) {
        setSuccess(true);
        
        // Refresh chat rooms list
        const roomsResponse = await chatAPI.getRooms();
        if (roomsResponse.success && roomsResponse.data.rooms) {
          setChatRooms(roomsResponse.data.rooms);
        }
        
        setTimeout(() => {
          // Reset form before closing
          setUsername('');
          setError('');
          setSuccess(false);
          setLoading(false);
          onClose();
          navigate(`/dashboard/${connectResponse.data.room.id}`);
        }, 1000);
      } else {
        setError(connectResponse.error?.message || 'Failed to connect');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string }; message?: string } }; message?: string };
      const errorMessage = 
        error.response?.data?.error?.message || 
        error.response?.data?.message || 
        error.message || 
        'Connection failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setUsername('');
      setError('');
      setSuccess(false);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <PersonAddIcon color="primary" />
          <Typography variant="h6">Connect by Username</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter the username of the person you want to connect with. A direct message chat will be created.
          </Typography>

          <TextField
            autoFocus
            fullWidth
            label="Username"
            placeholder="e.g., john_doe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !loading) {
                handleConnect();
              }
            }}
            disabled={loading || success}
            error={!!error}
            sx={{ mb: 2 }}
          />

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Connected! Redirecting to chat...
            </Alert>
          )}

          <Typography variant="caption" color="text.secondary">
            Tip: You can also scan a QR code to connect instantly!
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleConnect}
          variant="contained"
          disabled={loading || success || !username.trim()}
          startIcon={loading ? <CircularProgress size={20} /> : <PersonAddIcon />}
        >
          {loading ? 'Connecting...' : 'Connect'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
