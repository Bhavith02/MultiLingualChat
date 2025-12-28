import { useState, useEffect } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import { Html5Qrcode } from 'html5-qrcode';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';

interface QRScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (userId: string) => void;
}

export default function QRScanner({ open, onClose, onScan }: QRScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);

  useEffect(() => {
    if (open) {
      // Wait for dialog to render before starting scanner
      const timer = setTimeout(() => {
        startScanner();
      }, 300);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
  }, [open]);

  const startScanner = async () => {
    try {
      setError('');
      setScanning(true);

      // Check if element exists
      const element = document.getElementById('qr-reader');
      if (!element) {
        throw new Error('QR reader element not found. Please try again.');
      }

      const html5QrCode = new Html5Qrcode('qr-reader');
      setScanner(html5QrCode);

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Parse the QR code URL
          try {
            const url = new URL(decodedText);
            const userId = url.searchParams.get('u');
            
            if (userId) {
              // Decode base64 user ID
              const decodedUserId = atob(userId);
              onScan(decodedUserId);
              stopScanner();
              onClose();
            } else {
              setError('Invalid QR code format');
            }
          } catch (err) {
            setError('Invalid QR code');
          }
        },
        (errorMessage) => {
          // Ignore common scanning errors
          if (!errorMessage.includes('NotFoundException')) {
            console.log('QR scan error:', errorMessage);
          }
        }
      );
    } catch (err: any) {
      console.error('Scanner start error:', err);
      let errorMsg = 'Failed to start camera';
      
      if (err.name === 'NotAllowedError' || err.message?.includes('Permission')) {
        errorMsg = 'Camera permission denied. Please allow camera access in your browser settings.';
      } else if (err.name === 'NotFoundError') {
        errorMsg = 'No camera found on this device.';
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scanner) {
      try {
        await scanner.stop();
        scanner.clear();
      } catch (err) {
        console.error('Scanner stop error:', err);
      }
      setScanner(null);
    }
    setScanning(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <QrCodeScannerIcon />
          <Typography variant="h6">Scan QR Code</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          {error && (
            <Alert severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          )}

          {/* Camera View */}
          <Box
            id="qr-reader"
            sx={{
              width: '100%',
              maxWidth: 400,
              borderRadius: 2,
              overflow: 'hidden',
              border: '2px solid',
              borderColor: scanning ? 'primary.main' : 'grey.300',
            }}
          />

          {scanning && (
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress size={24} sx={{ mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Point your camera at the QR code
              </Typography>
            </Box>
          )}

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
              <strong>Instructions:</strong>
              <br />
              • Allow camera access when prompted
              <br />
              • Hold the QR code within the frame
              <br />
              • Keep steady for automatic detection
            </Typography>
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}
