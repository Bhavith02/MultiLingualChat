import { useEffect, useState } from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem, Tooltip } from '@mui/material';
import { Routes, Route, useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import QrCodeIcon from '@mui/icons-material/QrCode';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import { useStore } from '../store';
import { chatAPI } from '../services/api';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import UserQRCode from '../components/UserQRCode';
import QRScanner from '../components/QRScanner';
import ConnectByUsername from '../components/ConnectByUsername';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, setChatRooms, initializeWebSocket, disconnectWebSocket, isSocketConnected } = useStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);

  useEffect(() => {
    // Initialize WebSocket connection
    if (!isSocketConnected) {
      initializeWebSocket();
    }
    
    // Load chat rooms from API
    chatAPI.getRooms()
      .then((response) => {
        if (response.success && response.data.rooms) {
          setChatRooms(response.data.rooms);
        }
      })
      .catch((error) => {
        console.error('Failed to load chat rooms:', error);
      });
    
    return () => {
      // Cleanup on unmount
      disconnectWebSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleQRScan = async (userId: string) => {
    try {
      // Call quick connect API
      const response = await chatAPI.quickConnect(parseInt(userId, 10));
      if (response.success && response.data.room) {
        // Navigate to the chat room
        navigate(`/dashboard/${response.data.room.id}`);
        // Refresh chat rooms
        const roomsResponse = await chatAPI.getRooms();
        if (roomsResponse.success && roomsResponse.data.rooms) {
          setChatRooms(roomsResponse.data.rooms);
        }
      }
    } catch (error) {
      console.error('Quick connect failed:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#f5f7fa', overflow: 'hidden', width: '100%' }}>
      {/* Top App Bar */}
      <AppBar position="static" sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        width: '100%'
      }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            MultiLingual Chat
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* QR Code Actions */}
            <Tooltip title="My QR Code">
              <IconButton 
                color="inherit" 
                onClick={() => setQrDialogOpen(true)}
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                }}
              >
                <QrCodeIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Scan QR Code">
              <IconButton 
                color="inherit" 
                onClick={() => setScannerOpen(true)}
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                }}
              >
                <QrCodeScannerIcon />
              </IconButton>
            </Tooltip>

            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' }, ml: 1 }}>
              {user?.displayName || user?.username}
            </Typography>
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <Avatar sx={{
                width: 36,
                height: 36,
                bgcolor: 'rgba(255,255,255,0.2)',
                border: '2px solid rgba(255,255,255,0.3)',
                fontWeight: 'bold'
              }}>
                {user?.displayName?.[0] || user?.username?.[0] || 'U'}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleMenuClose}>
                <SettingsIcon sx={{ mr: 1 }} /> Settings
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1 }} /> Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden', width: '100%' }}>
        {/* Chat List Sidebar */}
        <Box
          sx={{
            width: { xs: '100%', md: 340 },
            display: { xs: 'none', md: 'block' },
            borderRight: 1,
            borderColor: 'rgba(0,0,0,0.08)',
            bgcolor: 'white',
            overflow: 'auto',
            boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
            flexShrink: 0
          }}
        >
          <ChatList onConnectClick={() => setConnectDialogOpen(true)} />
        </Box>

        {/* Chat Window */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', bgcolor: '#f5f7fa' }}>
          <Routes>
            <Route path="/" element={<EmptyState />} />
            <Route path="/:roomId" element={<ChatWindow />} />
          </Routes>
        </Box>
      </Box>

      {/* QR Code Dialog */}
      <UserQRCode open={qrDialogOpen} onClose={() => setQrDialogOpen(false)} />
      
      {/* QR Scanner Dialog */}
      <QRScanner open={scannerOpen} onClose={() => setScannerOpen(false)} onScan={handleQRScan} />
      
      {/* Connect by Username Dialog */}
      <ConnectByUsername open={connectDialogOpen} onClose={() => setConnectDialogOpen(false)} />
    </Box>
  );
}

function EmptyState() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        flexDirection: 'column',
        color: 'text.secondary',
        px: 3,
      }}
    >
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#2d3748' }}>
        Select a conversation
      </Typography>
      <Typography variant="body2">
        Choose a chat from the list to start messaging
      </Typography>
    </Box>
  );
}
