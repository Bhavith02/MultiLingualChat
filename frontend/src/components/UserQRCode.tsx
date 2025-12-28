import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import QRCode from 'qrcode';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useStore } from '../store';

interface UserQRCodeProps {
  open: boolean;
  onClose: () => void;
}

export default function UserQRCode({ open, onClose }: UserQRCodeProps) {
  const { user } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrUrl, setQrUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open && user) {
      // Small delay to ensure canvas is mounted in DOM
      const timer = setTimeout(() => {
        if (canvasRef.current) {
          console.log('Generating QR for user:', user);
          // Generate unique connect URL
          const connectUrl = `${window.location.origin}/connect?u=${btoa(String(user.id))}`;
          setQrUrl(connectUrl);
          console.log('QR URL:', connectUrl);

          // Generate QR code
          QRCode.toCanvas(
            canvasRef.current,
            connectUrl,
            {
              width: 300,
              margin: 2,
              color: {
                dark: '#667eea',
                light: '#ffffff',
              },
            },
            (error) => {
              if (error) {
                console.error('QR Code generation error:', error);
              } else {
                console.log('QR Code generated successfully');
              }
            }
          );
        }
      }, 100);

      return () => clearTimeout(timer);
    } else {
      console.log('QR generation skipped:', { open, user, canvas: canvasRef.current });
    }
  }, [open, user]);

  const handleDownload = () => {
    if (canvasRef.current) {
      const url = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${user?.username}-qr-code.png`;
      link.href = url;
      link.click();
    }
  };

  const handleShare = async () => {
    if (navigator.share && canvasRef.current) {
      try {
        const blob = await new Promise<Blob>((resolve) => {
          canvasRef.current!.toBlob((blob) => resolve(blob!));
        });
        const file = new File([blob], `${user?.username}-qr.png`, { type: 'image/png' });
        
        await navigator.share({
          title: 'Connect with me on MultiLingualChat',
          text: `Scan this QR code to chat with me in any language!`,
          files: [file],
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          My QR Code
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Share this code for instant connection
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            py: 2,
          }}
        >
          {/* QR Code Display */}
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            <Box
              sx={{
                p: 2,
                bgcolor: 'white',
                borderRadius: 2,
              }}
            >
              <canvas ref={canvasRef} />
            </Box>
          </Paper>

          {/* User Info */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {user?.displayName || user?.username}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {user?.id}
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              sx={{ borderRadius: 2 }}
            >
              Download
            </Button>
            
            {('share' in navigator) && (
              <Button
                variant="outlined"
                startIcon={<ShareIcon />}
                onClick={handleShare}
                sx={{ borderRadius: 2 }}
              >
                Share
              </Button>
            )}
            
            <Button
              variant="outlined"
              startIcon={<ContentCopyIcon />}
              onClick={handleCopyLink}
              sx={{ borderRadius: 2 }}
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
          </Box>

          {/* Instructions */}
          <Paper
            sx={{
              p: 2,
              bgcolor: 'info.light',
              borderRadius: 2,
              width: '100%',
            }}
          >
            <Typography variant="body2" color="info.dark">
              <strong>How to use:</strong>
              <br />
              1. Show this QR code to someone
              <br />
              2. They scan it with their phone camera or the in-app scanner
              <br />
              3. Instantly start chatting in your preferred languages!
            </Typography>
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
