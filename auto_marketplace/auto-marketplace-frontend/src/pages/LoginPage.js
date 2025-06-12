import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [sessionExpired, setSessionExpired] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  
  const from = location.state?.from?.pathname || '/';

  
  useEffect(() => {
    
    const params = new URLSearchParams(location.search);
    if (params.get('expired') === 'true') {
      setSessionExpired(true);
    }
    
   
    if (location.state?.sessionExpired) {
      setSessionExpired(true);
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
   
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email.trim()) {
      errors.email = 'Adresa de email este obligatorie';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Adresa de email este invalidă';
    }
    
    if (!formData.password) {
      errors.password = 'Parola este obligatorie';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const result = await login(formData);
    
    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Autentificare
          </Typography>
          
          {sessionExpired && (
            <Alert severity="info" sx={{ mb: 3 }}>
              Sesiunea ta a expirat. Te rugăm să te autentifici din nou.
            </Alert>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              label="Adresă de email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
              required
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="Parolă"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
              required
              InputProps={{
                endAdornment: formData.password && (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                      size="small"
                      sx={{ 
                        p: 0, 
                        color: 'rgba(0, 0, 0, 0.54)',
                        '&:hover': {
                          backgroundColor: 'transparent'
                        }
                      }}
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Autentificare'}
            </Button>
            
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2">
                Nu ai un cont?{' '}
                <Link component={RouterLink} to="/register" variant="body2">
                  Înregistrează-te
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
