import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';


import {
  Container,
  Typography,
  Box,
  Paper,
  Avatar,
  Button,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';


import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { Mail, Phone } from 'react-feather';


import { useAuth } from '../context/AuthContext';
import { listingsAPI } from '../services/api';

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();


  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPhone, setShowPhone] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);

  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);

  const baseURL = 'http://localhost:8000';

  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Data invalidă';

      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');

      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
      return 'Data invalidă';
    }
  };

  
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;

    const timestamp = new Date().getTime();

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return `${imagePath}?t=${timestamp}`;
    }

    if (imagePath.startsWith('/')) {
      return `${baseURL}${imagePath}?t=${timestamp}`;
    }

    return `${baseURL}/media/profile_images/${imagePath}?t=${timestamp}`;
  };

  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        const config = token ? {
          headers: { 'Authorization': `Bearer ${token}` }
        } : {};

        const response = await axios.get(`${baseURL}/api/users/${userId}/`, config);
        setUser(response.data);
      } catch (err) {
        console.error('Eroare la încărcarea profilului utilizatorului:', err);
        setError('Nu am putut încărca profilul utilizatorului. Vă rugăm să încercați din nou.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  
  useEffect(() => {
    const fetchUserListings = async () => {
      try {
        setLoadingListings(true);
        const listings = await listingsAPI.getUserListings(userId);
        setUserListings(listings);
      } catch (err) {
        console.error('Eroare la încărcarea anunțurilor utilizatorului:', err);
        setUserListings([]);
      } finally {
        setLoadingListings(false);
      }
    };

    if (userId) {
      fetchUserListings();
    }
  }, [userId]);

  
  useEffect(() => {
    if (currentUser && currentUser.id === parseInt(userId)) {
      navigate('/profile');
    }
  }, [currentUser, userId, navigate]);


  const handleListingClick = (listingId) => {
    navigate(`/listings/${listingId}`);
  };

  
  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Token de autentificare lipsă');
      }

      await axios.delete(`${baseURL}/api/users/admin/users/${userId}/delete/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setDeleteDialogOpen(false);
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Eroare la ștergerea contului:', err);
      setError('Nu am putut șterge contul. Vă rugăm să încercați din nou.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdminStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Token de autentificare lipsă');
      }

      await axios.patch(`${baseURL}/api/users/admin/users/${userId}/toggle-admin/`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      
      const response = await axios.get(`${baseURL}/api/users/${userId}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setUser(response.data);
      setAdminDialogOpen(false);
    } catch (err) {
      console.error('Eroare la schimbarea statutului de admin:', err);
      setError('Nu am putut schimba statutul de administrator. Vă rugăm să încercați din nou.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActiveStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Token de autentificare lipsă');
      }

      await axios.patch(`${baseURL}/api/users/admin/users/${userId}/toggle-active/`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      
      const response = await axios.get(`${baseURL}/api/users/${userId}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setUser(response.data);
      setBlockDialogOpen(false);
    } catch (err) {
      console.error('Eroare la schimbarea statusului activ:', err);
      setError('Nu am putut schimba statutul activ. Vă rugăm să încercați din nou.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = () => {
    navigate(`/admin/users/edit/${userId}`);
  };

  
  const isAdmin = currentUser && currentUser.is_admin;

  
  if (loading) {
    return (
      <Container sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  
  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  
  if (!user) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="info">Utilizatorul nu a fost găsit.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Profil utilizator
      </Typography>

      
      {isAdmin && (
        <Paper elevation={3} sx={{ p: 2, mb: 3, bgcolor: 'info.light' }}>
          <Typography variant="h6" gutterBottom>
            Acțiuni Administrator
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                startIcon={<EditIcon />}
                onClick={handleEditUser}
              >
                Editare Profil
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="contained"
                color={user.is_admin ? "warning" : "success"}
                startIcon={user.is_admin ? <PersonIcon /> : <AdminPanelSettingsIcon />}
                onClick={() => setAdminDialogOpen(true)}
              >
                {user.is_admin ? "Șterge Admin" : "Rol Admin"}
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="contained"
                color={user.is_active ? "error" : "success"}
                startIcon={<BlockIcon />}
                onClick={() => setBlockDialogOpen(true)}
              >
                {user.is_active ? "Blochează" : "Deblochează"}
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialogOpen(true)}
              >
                Șterge Cont
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

   
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'center', sm: 'flex-start' },
          gap: 3
        }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={user.profile_image ? getImageUrl(user.profile_image) : null}
              sx={{
                width: 150,
                height: 150,
                bgcolor: 'primary.main',
                fontSize: '3rem',
              }}
            >
              {user.username?.charAt(0).toUpperCase() || "U"}
            </Avatar>


            <Box
              sx={{
                position: 'absolute',
                bottom: 5,
                right: 5,
                width: 20,
                height: 20,
                borderRadius: '50%',
                bgcolor: user.is_online ? '#4CAF50' : '#9e9e9e',
                border: '2px solid white',
                zIndex: 1
              }}
            />
          </Box>

          <Box sx={{
            flexGrow: 1,
            textAlign: { xs: 'center', sm: 'left' }
          }}>
            <Typography variant="h5" gutterBottom>
              {user.display_name || user.username}
            </Typography>

            <Chip
              label={user.is_admin ? "Administrator" : "Utilizator standard"}
              color={user.is_admin ? "primary" : "default"}
              sx={{ mb: 2 }}
            />

            <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
              <strong>Username:</strong> {user.username}
            </Typography>

            {user.show_email && user.email && (
              <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
                <strong>Email:</strong> {user.email}
              </Typography>
            )}

            {user.phone_number && user.show_phone && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
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

            {(user.city || user.county) && (
              <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
                <strong>Locație:</strong> {[user.city, user.county].filter(Boolean).join(', ')}
              </Typography>
            )}

     
            {user.bio && (
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

            <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
              {user.is_online
                ? 'Online acum'
                : user.last_activity
                  ? `Ultima activitate: ${formatDate(user.last_activity)}`
                  : 'Activitate necunoscută'}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

      
        <Grid container spacing={2}>
          {user.show_email && user.email && (
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                href={`mailto:${user.email}`}
                startIcon={<Mail size={18} />}
              >
                Trimite email
              </Button>
            </Grid>
          )}

          {user.phone_number && user.show_phone && (
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                color="success"
                fullWidth
                href={`tel:${user.phone_number}`}
                startIcon={<Phone size={18} />}
                disabled={!showPhone}
                onClick={(e) => {
                  if (!showPhone) {
                    e.preventDefault();
                    setShowPhone(true);
                  }
                }}
              >
                {showPhone ? "Sună utilizatorul" : "Arată numărul pentru a suna"}
              </Button>
            </Grid>
          )}
        </Grid>
      </Paper>

    
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Anunțuri publicate
        </Typography>

        {loadingListings ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : userListings.length > 0 ? (
          <Grid container spacing={2}>
            {userListings.map(listing => (
              <Grid item xs={12} sm={6} md={4} key={listing.id}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 4
                    }
                  }}
                  onClick={() => handleListingClick(listing.id)}
                >
                  <Box sx={{
                    height: 140,
                    mb: 1,
                    backgroundImage: `url(${listing.images && listing.images.length > 0 ? listing.images[0].image_path : '/static/images/placeholder-car.jpg'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: 1
                  }} />

                  <Typography variant="subtitle1" noWrap fontWeight="bold">
                    {listing.title}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" noWrap>
                    {listing.brand} {listing.model}, {listing.year_of_manufacture}
                  </Typography>

                  <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                    {typeof listing.price === 'number'
                      ? Math.round(listing.price).toLocaleString('ro-RO')
                      : listing.price} €
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body1" color="text.secondary" sx={{ py: 2 }}>
            Acest utilizator nu are anunțuri publicate.
          </Typography>
        )}
      </Paper>

   
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmă ștergerea contului</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Sunteți sigur că doriți să ștergeți contul utilizatorului {user.username}?
            Această acțiune este ireversibilă și toate anunțurile asociate vor fi șterse.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Anulează
          </Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Șterge definitiv'}
          </Button>
        </DialogActions>
      </Dialog>

    
      <Dialog
        open={adminDialogOpen}
        onClose={() => setAdminDialogOpen(false)}
      >
        <DialogTitle>
          {user.is_admin ? "Eliminare drepturi de administrator" : "Acordare drepturi de administrator"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {user.is_admin
              ? `Sunteți sigur că doriți să eliminați drepturile de administrator pentru ${user.username}?`
              : `Sunteți sigur că doriți să acordați drepturi de administrator utilizatorului ${user.username}?`
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdminDialogOpen(false)} color="primary">
            Anulează
          </Button>
          <Button
            onClick={handleToggleAdminStatus}
            color="warning"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Confirmă'}
          </Button>
        </DialogActions>
      </Dialog>

   
      <Dialog
        open={blockDialogOpen}
        onClose={() => setBlockDialogOpen(false)}
      >
        <DialogTitle>
          {user.is_active ? "Blocare cont utilizator" : "Deblocare cont utilizator"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {user.is_active
              ? `Sunteți sigur că doriți să blocați contul utilizatorului ${user.username}? Acesta nu se va mai putea autentifica.`
              : `Sunteți sigur că doriți să deblocați contul utilizatorului ${user.username}? Acesta se va putea autentifica din nou.`
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBlockDialogOpen(false)} color="primary">
            Anulează
          </Button>
          <Button
            onClick={handleToggleActiveStatus}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Confirmă'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserProfilePage;
