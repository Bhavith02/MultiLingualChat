import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import TranslateIcon from '@mui/icons-material/Translate';
import { useStore } from '../store';
import { authAPI } from '../services/api';
import { loginSchema, type LoginFormData } from '../schemas/auth.schema';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser, setToken } = useStore();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await authAPI.login(data);
      
      // Store token
      setToken(response.token);
      localStorage.setItem('token', response.token);
      
      // Store user data
      setUser(response.user);
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || err.response?.data?.message || 'Login failed. Please try again.';
      setFormError('root', {
        message: errorMessage,
      });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        px: { xs: 2, sm: 3 },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
        }
      }}
    >
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
        <Paper elevation={0} sx={{
          p: { xs: 3, sm: 5 },
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)',
          bgcolor: 'rgba(255,255,255,0.95)',
          maxWidth: '600px',
          mx: 'auto'
        }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <TranslateIcon sx={{
              fontSize: 70,
              color: 'primary.main',
              mb: 2,
              filter: 'drop-shadow(0 2px 4px rgba(102, 126, 234, 0.3))'
            }} />
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom sx={{ color: '#2d3748' }}>
              Welcome Back
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: '1.05rem' }}>
              Sign in to continue your conversations
            </Typography>
          </Box>

          {errors.root && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.root.message}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              margin="normal"
              autoFocus
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              margin="normal"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isSubmitting}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                fontSize: '1.05rem',
                fontWeight: 600,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                },
                '&:disabled': {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  opacity: 0.6,
                }
              }}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link
                  component="button"
                  type="button"
                  onClick={() => navigate('/register')}
                  sx={{ cursor: 'pointer' }}
                >
                  Sign up
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Link
            component="button"
            type="button"
            onClick={() => navigate('/')}
            sx={{ cursor: 'pointer' }}
          >
            Back to Home
          </Link>
        </Box>
      </Container>
    </Box>
  );
}
