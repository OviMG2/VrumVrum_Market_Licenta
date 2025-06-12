import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [profileData, setProfileData] = useState({
    real_name: user?.real_name || '',
    phone_number: user?.phone_number || '',
    city: user?.city || '',
    county: user?.county || '',
    bio: user?.bio || '', // Adăugăm bio în starea inițială
    show_email: user?.show_email !== undefined ? user.show_email : true,
    show_phone: user?.show_phone !== undefined ? user.show_phone : true,
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const baseURL = 'http://localhost:8000'; // Setează URL-ul de bază al backend-ului
  
  // Funcție pentru a construi URL-ul corect al imaginii
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // Dacă începe cu http sau https, este deja un URL complet
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Dacă începe cu slash, adăugăm doar domeniul
    if (imagePath.startsWith('/')) {
      return `${baseURL}${imagePath}`;
    }
    
    // Altfel, construim calea completă
    return `${baseURL}/media/profile_images/${imagePath}`;
  };
  
  // Setează URL-ul imaginii când se încarcă componenta
  useEffect(() => {
    if (user?.profile_image) {
      setImagePreview(getImageUrl(user.profile_image));
    }
  }, [user?.profile_image]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const fileUrl = URL.createObjectURL(file);
      setImagePreview(fileUrl);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Date invalid';
      
      // Format date as DD/MM/YYYY HH:MM using native JavaScript
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
      return 'Date invalid';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Creăm FormData pentru a trimite datele, inclusiv imaginea
      const formData = new FormData();
      formData.append('real_name', profileData.real_name);
      formData.append('phone_number', profileData.phone_number);
      formData.append('city', profileData.city);
      formData.append('county', profileData.county);
      formData.append('bio', profileData.bio); // Adăugăm bio la FormData
      formData.append('show_email', profileData.show_email);
      formData.append('show_phone', profileData.show_phone);
      
      if (profileImage) {
        formData.append('profile_image', profileImage);
      }

      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Eroare la actualizarea profilului:', error);
      // Eventual, adăugați un mesaj de eroare pentru utilizator
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Profilul meu
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box 
          component="form" 
          onSubmit={handleSubmit} 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center' 
          }}
        >
          <Box 
            sx={{ 
              position: 'relative', 
              mb: 3,
              width: 150,
              height: 150
            }}
          >
            <Avatar
              src={imagePreview}
              sx={{
                width: 150,
                height: 150,
                bgcolor: 'primary.main',
                fontSize: '3rem',
              }}
              alt={user?.username || "User"}
            >
              {!imagePreview && (user?.username?.charAt(0).toUpperCase() || "U")}
            </Avatar>
            
            {/* Indicator status activ */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 5,
                right: 5,
                width: 20,
                height: 20,
                borderRadius: '50%',
                bgcolor: user?.is_active ? '#4CAF50' : '#9e9e9e', // Verde pentru activ, gri pentru inactiv
                border: '2px solid white',
                zIndex: 1
              }}
            />
            
            {isEditing && (
              <>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="profile-image-upload"
                  type="file"
                  onChange={handleImageChange}
                />
                <label htmlFor="profile-image-upload">
                  <IconButton 
                    color="primary" 
                    component="span"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: 'background.paper',
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    <PhotoCamera />
                  </IconButton>
                </label>
              </>
            )}
          </Box>
          
          {isEditing ? (
            <>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nume real"
                    name="real_name"
                    value={profileData.real_name}
                    onChange={handleInputChange}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <TextField
                    fullWidth
                    label="Număr de telefon"
                    name="phone_number"
                    value={profileData.phone_number}
                    onChange={handleInputChange}
                    placeholder="Introduceți numărul de telefon"
                    sx={{ mb: 2, mr: 1 }}
                  />
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => {
                      setProfileData(prev => ({
                        ...prev,
                        phone_number: ''
                      }));
                    }}
                    sx={{ mt: 1 }}
                  >
                    Șterge
                  </Button>
                </Box>
              </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Oraș"
                    name="city"
                    value={profileData.city}
                    onChange={handleInputChange}
                    placeholder="Introduceți orașul"
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Județ"
                    name="county"
                    value={profileData.county}
                    onChange={handleInputChange}
                    placeholder="Introduceți județul"
                    sx={{ mb: 2 }}
                  />
                </Grid>
                {/* Adăugăm câmpul pentru bio */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Descriere"
                    name="bio"
                    multiline
                    rows={4}
                    value={profileData.bio}
                    onChange={handleInputChange}
                    placeholder="Spune-ne ceva despre tine"
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={profileData.show_email}
                        onChange={handleSwitchChange}
                        name="show_email"
                        color="primary"
                      />
                    }
                    label="Afișează email"
                  />
                </Grid>
                {/* <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={profileData.show_phone}
                        onChange={handleSwitchChange}
                        name="show_phone"
                        color="primary"
                      />
                    }
                    label="Afișează număr de telefon"
                  />
                </Grid> */}
              </Grid>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mt: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => setIsEditing(false)}
                >
                  Anulează
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                >
                  Salvează
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Box sx={{ width: '100%', mb: 2 }}>
                <Typography variant="h5" gutterBottom>
                  {user?.real_name || "Utilizator"}
                </Typography>
                
                
                <Chip
                  icon={user?.is_admin ? <AdminPanelSettingsIcon /> : <PersonIcon />}
                  label={user?.is_admin ? "Administrator" : "Utilizator standard"}
                  color={user?.is_admin ? "primary" : "default"}
                  sx={{ mb: 2 }}
                />
                
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  <strong>Username:</strong> {user?.username}
                </Typography>
                
                {user?.show_email && (
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    <strong>Email:</strong> {user?.email}
                  </Typography>
                )}
                
                {user?.phone_number && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ mr: 1 }}>
                      <strong>Telefon:</strong> {showPhone ? user.phone_number : '••••••••••'}
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => setShowPhone(!showPhone)}
                      color="primary"
                    >
                      {showPhone ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </Box>
                )}
                
                {(user?.city || user?.county) && (
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    <strong>Locație:</strong> {[user?.city, user?.county].filter(Boolean).join(', ')}
                  </Typography>
                )}

                {/* Adăugăm secțiunea pentru bio */}
                {user?.bio && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      <strong>Despre mine:</strong>
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                      {user.bio}
                    </Typography>
                  </>
                )}
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  <strong>Ultima conectare:</strong> {user?.last_login ? formatDate(user.last_login) : 'Necunoscut'}
                </Typography>
                
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  <strong>Status:</strong> <span style={{ color: user?.is_active ? '#4CAF50' : '#9e9e9e', fontWeight: 'bold' }}>
                    ● {user?.is_active ? 'Activ' : 'Inactiv'}
                  </span>
                </Typography>
                
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  <strong>Cont creat la:</strong> {user?.created_at ? formatDate(user.created_at) : 'N/A'}
                </Typography>
              </Box>
              
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => setIsEditing(true)}
              >
                Editează profil
              </Button>
            </>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfilePage;