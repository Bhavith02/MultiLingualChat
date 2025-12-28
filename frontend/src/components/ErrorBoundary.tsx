import React, { Component, type ReactNode } from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="sm">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh',
              textAlign: 'center',
              gap: 2,
            }}
          >
            <ErrorOutlineIcon sx={{ fontSize: 80, color: 'error.main' }} />
            <Typography variant="h4" gutterBottom>
              Oops! Something went wrong
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </Typography>
            <Button variant="contained" onClick={this.handleReset} size="large">
              Return to Home
            </Button>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
