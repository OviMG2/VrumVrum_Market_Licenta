import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
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
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Tooltip from '@mui/material/Tooltip';
import InfoIcon from '@mui/icons-material/Info';
import Popover from '@mui/material/Popover';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    real_name: '',
    password: '',
    password2: '',
    admin_code: '',
    is_admin_request: false,
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();

  // State pentru verificarea cerințelor parolei
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Resetăm erorile pentru câmpul modificat
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }

    // Verificăm cerințele parolei dacă se modifică câmpul password
    if (name === 'password') {
      setPasswordRequirements({
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /[0-9]/.test(value),
        special: /[^A-Za-z0-9]/.test(value),
      });
    }
  };

  // Funcție pentru a schimba vizibilitatea parolei
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleAdminCheckboxChange = (e) => {
    setFormData({ ...formData, is_admin_request: e.target.checked });
    // Resetăm eroarea pentru codul de admin când checkbox-ul se schimbă
    if (formErrors.admin_code) {
      setFormErrors({ ...formErrors, admin_code: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.username.trim()) {
      errors.username = 'Numele de utilizator este obligatoriu';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Adresa de email este obligatorie';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Adresa de email este invalidă';
    }
    
    if (!formData.real_name.trim()) {
      errors.real_name = 'Numele real este obligatoriu';
    }
    
    if (!formData.password) {
      errors.password = 'Parola este obligatorie';
    } else if (formData.password.length < 8) {
      errors.password = 'Parola trebuie să aibă minim 8 caractere';
    }
    
    if (formData.password !== formData.password2) {
      errors.password2 = 'Parolele nu coincid';
    }
    
    // Validare pentru codul de administrator
    if (formData.is_admin_request && !formData.admin_code.trim()) {
      errors.admin_code = 'Codul de administrator este obligatoriu';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Pregătim datele pentru trimitere
    const dataToSend = {
      username: formData.username,
      email: formData.email,
      real_name: formData.real_name,
      password: formData.password,
      password2: formData.password2,
    };
    
    // Adăugăm codul de administrator doar dacă există o cerere de admin
    if (formData.is_admin_request) {
      dataToSend.admin_code = formData.admin_code;
    }
    
    const result = await register(dataToSend);
    
    if (result.success) {
      navigate('/login', { 
        state: { message: 'Înregistrare reușită! Te poți autentifica acum.' } 
      });
    }
  };

  // State pentru popover
  const [anchorEl, setAnchorEl] = useState(null);

  // Funcții pentru gestionarea focusului pe câmpul de parolă
  const handlePasswordFocus = (event) => {
    setAnchorEl(event.currentTarget);
    setPasswordFocused(true);
  };

  const handlePasswordBlur = () => {
    setPasswordFocused(false);
    setAnchorEl(null);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Înregistrare
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {typeof error === 'object' 
                ? Object.entries(error).map(([key, value]) => (
                    <div key={key}><strong>{key}</strong>: {value}</div>
                  ))
                : error
              }
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              label="Nume utilizator"
              name="username"
              autoComplete="username"
              value={formData.username}
              onChange={handleChange}
              error={!!formErrors.username}
              helperText={formErrors.username}
              required
            />
            
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
              label="Nume real"
              name="real_name"
              autoComplete="name"
              value={formData.real_name}
              onChange={handleChange}
              error={!!formErrors.real_name}
              helperText={formErrors.real_name}
              required
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="Parolă"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              onFocus={handlePasswordFocus}
              onBlur={handlePasswordBlur}
              error={!!formErrors.password}
              helperText={formErrors.password}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {formData.password && (
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                        size="small"
                        sx={{ 
                          color: 'rgba(0, 0, 0, 0.54)',
                          '&:hover': {
                            backgroundColor: 'transparent'
                          }
                        }}
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    )}
                    <Tooltip 
                      title="Recomandări pentru parolă"
                      placement="right"
                    >
                      <IconButton
                        aria-label="password requirements"
                        size="small"
                        sx={{ 
                          color: 'rgba(0, 0, 0, 0.54)',
                          ml: 0.5,
                          '&:hover': {
                            backgroundColor: 'transparent'
                          }
                        }}
                      >
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                )
              }}
            />
            
            {/* Popover pentru cerințele parolei */}
            <Popover
              open={passwordFocused}
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'center',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'center',
                horizontal: 'left',
              }}
              sx={{ ml: 2 }}
              keepMounted
              disablePortal
              disableEnforceFocus
              disableAutoFocus
              disableRestoreFocus
            >
              <Paper sx={{ p: 2, maxWidth: 320 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Parola ar trebui să conțină:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {passwordRequirements.length ? 
                        <CheckCircleOutlineIcon color="success" fontSize="small" /> : 
                        <CancelOutlinedIcon color="error" fontSize="small" />}
                    </ListItemIcon>
                    <ListItemText primary="Minim 8 caractere" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {passwordRequirements.uppercase ? 
                        <CheckCircleOutlineIcon color="success" fontSize="small" /> : 
                        <CancelOutlinedIcon color="error" fontSize="small" />}
                    </ListItemIcon>
                    <ListItemText primary="Cel puțin o literă mare (A-Z)" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {passwordRequirements.lowercase ? 
                        <CheckCircleOutlineIcon color="success" fontSize="small" /> : 
                        <CancelOutlinedIcon color="error" fontSize="small" />}
                    </ListItemIcon>
                    <ListItemText primary="Cel puțin o literă mică (a-z)" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {passwordRequirements.number ? 
                        <CheckCircleOutlineIcon color="success" fontSize="small" /> : 
                        <CancelOutlinedIcon color="error" fontSize="small" />}
                    </ListItemIcon>
                    <ListItemText primary="Cel puțin o cifră (0-9)" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {passwordRequirements.special ? 
                        <CheckCircleOutlineIcon color="success" fontSize="small" /> : 
                        <CancelOutlinedIcon color="error" fontSize="small" />}
                    </ListItemIcon>
                    <ListItemText primary="Cel puțin un caracter special (!@#$...)" />
                  </ListItem>
                </List>
              </Paper>
            </Popover>
            
            <TextField
              fullWidth
              margin="normal"
              label="Confirmare parolă"
              name="password2"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={formData.password2}
              onChange={handleChange}
              error={!!formErrors.password2}
              helperText={formErrors.password2}
              required
            />
            
            <FormControlLabel
              control={
                <Checkbox 
                  checked={formData.is_admin_request}
                  onChange={handleAdminCheckboxChange}
                  name="is_admin_request"
                  color="primary"
                />
              }
              label="Vreau să mă înregistrez ca administrator"
              sx={{ mt: 2 }}
            />
            
            <Collapse in={formData.is_admin_request}>
              <TextField
                fullWidth
                margin="normal"
                label="Cod administrator"
                name="admin_code"
                type="password"
                value={formData.admin_code}
                onChange={handleChange}
                error={!!formErrors.admin_code}
                helperText={formErrors.admin_code}
                placeholder="Introduceți codul secret pentru administratori"
              />
            </Collapse>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Înregistrare'}
            </Button>
            
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2">
                Ai deja un cont?{' '}
                <Link component={RouterLink} to="/login" variant="body2">
                  Autentifică-te
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage;