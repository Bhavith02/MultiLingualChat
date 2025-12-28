import { useEffect, useRef } from 'react';
import { Box, Button, Container, Typography, Grid, Card, CardContent, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import TranslateIcon from '@mui/icons-material/Translate';
import GroupsIcon from '@mui/icons-material/Groups';
import PublicIcon from '@mui/icons-material/Public';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';

export default function LandingPage() {
  const navigate = useNavigate();
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Generate app QR code
    if (qrCanvasRef.current) {
      const appUrl = window.location.origin;
      QRCode.toCanvas(
        qrCanvasRef.current,
        appUrl,
        {
          width: 200,
          margin: 1,
          color: {
            dark: '#667eea',
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) console.error('QR generation error:', error);
        }
      );
    }
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', overflow: 'hidden' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          px: { xs: 3, md: 6 },
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          }
        }}
      >
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center' }}>
            <TranslateIcon sx={{ fontSize: { xs: 60, md: 80 }, mb: 3, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }} />
            <Typography variant="h2" component="h1" gutterBottom fontWeight="bold" sx={{ fontSize: { xs: '2.5rem', md: '3.75rem' }, mb: 2 }}>
              MultiLingual Chat
            </Typography>
            <Typography variant="h5" component="h2" sx={{ mb: 5, opacity: 0.95, fontSize: { xs: '1.25rem', md: '1.5rem' }, maxWidth: '800px', mx: 'auto' }}>
              Break language barriers. Connect with anyone, anywhere, in any language.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  px: 5,
                  py: 1.8,
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  borderRadius: 2,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'grey.100',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                  },
                }}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/login')}
                sx={{
                  borderColor: 'white',
                  borderWidth: 2,
                  color: 'white',
                  px: 5,
                  py: 1.8,
                  fontSize: '1.1rem',
                  borderRadius: 2,
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderWidth: 2,
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.15)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Sign In
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* QR Code Section */}
      <Container maxWidth="xl" sx={{ py: { xs: 6, md: 8 }, px: { xs: 3, md: 6 } }}>
        <Paper
          elevation={8}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            textAlign: 'center',
            bgcolor: 'rgba(255,255,255,0.95)',
            border: '2px solid',
            borderColor: 'primary.main',
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 2, color: '#2d3748' }}>
            Quick Access with QR Code
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Scan this code with your phone to access the app instantly
          </Typography>
          <Box
            sx={{
              display: 'inline-block',
              p: 2,
              bgcolor: 'white',
              borderRadius: 2,
              boxShadow: 2,
            }}
          >
            <canvas ref={qrCanvasRef} />
          </Box>
          <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
            {window.location.origin}
          </Typography>
        </Paper>
      </Container>

      {/* Features Section */}
      <Container maxWidth="xl" sx={{ py: { xs: 8, md: 12 }, px: { xs: 3, md: 6 } }}>
        <Typography variant="h3" align="center" gutterBottom fontWeight="bold" sx={{ mb: 8, fontSize: { xs: '2rem', md: '3rem' }, color: '#2d3748' }}>
          Why MultiLingual Chat?
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              height: '100%',
              textAlign: 'center',
              p: 4,
              borderRadius: 3,
              transition: 'all 0.3s ease',
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 24px rgba(102, 126, 234, 0.15)',
              }
            }}>
              <CardContent>
                <TranslateIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Real-Time Translation
                </Typography>
                <Typography color="text.secondary">
                  Messages are instantly translated to your preferred language. No manual translation needed!
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              height: '100%',
              textAlign: 'center',
              p: 4,
              borderRadius: 3,
              transition: 'all 0.3s ease',
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 24px rgba(102, 126, 234, 0.15)',
              }
            }}>
              <CardContent>
                <GroupsIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Group Conversations
                </Typography>
                <Typography color="text.secondary">
                  Chat with multiple people, each seeing messages in their own language seamlessly.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              height: '100%',
              textAlign: 'center',
              p: 4,
              borderRadius: 3,
              transition: 'all 0.3s ease',
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 24px rgba(102, 126, 234, 0.15)',
              }
            }}>
              <CardContent>
                <PublicIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  100+ Languages
                </Typography>
                <Typography color="text.secondary">
                  Support for over 100 languages. Connect with people from all around the world.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              height: '100%',
              textAlign: 'center',
              p: 4,
              borderRadius: 3,
              transition: 'all 0.3s ease',
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 24px rgba(102, 126, 234, 0.15)',
              }
            }}>
              <CardContent>
                <QrCodeScannerIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  QR Connect
                </Typography>
                <Typography color="text.secondary">
                  Scan QR codes to instantly connect and start chatting with anyone, anywhere.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* How It Works Section */}
      <Box sx={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        py: { xs: 8, md: 12 },
        px: { xs: 3, md: 6 },
        position: 'relative',
        width: '100%'
      }}>
        <Container maxWidth="xl">
          <Typography variant="h3" align="center" gutterBottom fontWeight="bold" sx={{ mb: 8, fontSize: { xs: '2rem', md: '3rem' }, color: '#2d3748' }}>
            How It Works
          </Typography>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 32,
                    fontWeight: 'bold',
                    mx: 'auto',
                    mb: 3,
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                  }}
                >
                  1
                </Box>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Choose Your Language
                </Typography>
                <Typography color="text.secondary">
                  Select your preferred language when you sign up
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 32,
                    fontWeight: 'bold',
                    mx: 'auto',
                    mb: 3,
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                  }}
                >
                  2
                </Box>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Start Chatting
                </Typography>
                <Typography color="text.secondary">
                  Type messages in your language naturally
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 32,
                    fontWeight: 'bold',
                    mx: 'auto',
                    mb: 3,
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                  }}
                >
                  3
                </Box>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Magic Happens
                </Typography>
                <Typography color="text.secondary">
                  Everyone sees messages in their preferred language
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="xl" sx={{ py: { xs: 8, md: 12 }, px: { xs: 3, md: 6 }, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom fontWeight="bold" sx={{ fontSize: { xs: '2rem', md: '3rem' }, color: '#2d3748' }}>
          Ready to Connect?
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 5, fontSize: { xs: '1.1rem', md: '1.3rem' } }}>
          Join thousands of users breaking language barriers every day
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/register')}
          sx={{
            px: 6,
            py: 2,
            fontSize: '1.1rem',
            fontWeight: 600,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 4px 14px rgba(102, 126, 234, 0.3)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
            }
          }}
        >
          Create Free Account
        </Button>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 4, width: '100%' }}>
        <Container maxWidth="xl" sx={{ px: { xs: 3, md: 6 } }}>
          <Typography variant="body2" align="center" sx={{ opacity: 0.9 }}>
            © 2025 MultiLingual Chat. Made with ❤️ for global communication.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
