
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listingsAPI, recommendationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import ImageGallery from '../components/listings/ImageGallery';
import FinancialCalculator from '../components/financial/FinancialCalculator';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SpeedIcon from '@mui/icons-material/Speed';
import EventIcon from '@mui/icons-material/Event';
import InfoIcon from '@mui/icons-material/Info';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SettingsIcon from '@mui/icons-material/Settings';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import placeholderCar from '../assets/images/placeholder-car.jpg';
import { Mail, Phone } from 'react-feather';
import {
  Card,
  CardContent,
  CardMedia,
  CardActions,
} from '@mui/material';


function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`listing-tabpanel-${index}`}
      aria-labelledby={`listing-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}


function a11yProps(index) {
  return {
    id: `listing-tab-${index}`,
    'aria-controls': `listing-tabpanel-${index}`,
  };
}


const SimilarListings = ({ currentListing }) => {
  const [similarListings, setSimilarListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSimilarListings = async () => {
      try {
        setLoading(true);
        const listings = await listingsAPI.getSimilarListings(currentListing.id);
        setSimilarListings(listings);
        setLoading(false);
      } catch (error) {
        console.error('Eroare la încărcarea anunțurilor similare:', error);
        setError('Nu am putut încărca anunțuri similare.');
        setLoading(false);
      }
    };

    if (currentListing && currentListing.id) {
      fetchSimilarListings();
    }
  }, [currentListing.id]);

  
  const handleListingClick = async (listingId) => {
    try {
     
      await recommendationsAPI.recordInteraction({
        listing_id: listingId,
        type: 'click'
      });
      
    
      navigate(`/listings/${listingId}`);
    } catch (err) {
      console.error('Eroare la înregistrarea interacțiunii:', err);
     
      navigate(`/listings/${listingId}`);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <CircularProgress size={30} />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography variant="body2" color="text.secondary">
        {error}
      </Typography>
    );
  }

  if (similarListings.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        Nu am găsit anunțuri similare.
      </Typography>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        {similarListings.map((listing) => (
          <Grid item xs={12} sm={6} key={listing.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
                cursor: 'pointer'
              }}
              onClick={() => handleListingClick(listing.id)}
            >
              <CardMedia
                component="img"
                height="140"
                image={
                  listing.images && listing.images.length > 0 
                    ? listing.images.find(img => img.is_main)?.image_path || listing.images[0].image_path 
                    : placeholderCar
                }
                alt={`${listing.brand} ${listing.model}`}
              />
              <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                <Typography gutterBottom variant="subtitle1" component="div" noWrap fontWeight="medium">
                  {listing.title}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {listing.year_of_manufacture} | {listing.mileage.toLocaleString()} km
                  </Typography>
                  <Chip 
                    label={listing.fuel_type === 'benzina' ? 'Benzină' : 
                          listing.fuel_type === 'diesel' ? 'Diesel' : 
                          listing.fuel_type === 'electric' ? 'Electric' : 
                          listing.fuel_type === 'hibrid_benzina' ? 'Hibrid' : 
                          listing.fuel_type === 'hibrid_diesel' ? 'Hibrid' : 
                          listing.fuel_type === 'GPL' ? 'GPL' : listing.fuel_type}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2, pt: 0 }}>
                <Typography variant="subtitle1" color="primary" fontWeight="bold">
                  {typeof listing.price === 'number' ? listing.price.toLocaleString() : listing.price} €
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};





const ListingDetailsPage = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [isToggling, setIsToggling] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [sellerAvatarUrl, setSellerAvatarUrl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const baseURL = 'http://localhost:8000'; 
  

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
    const fetchListing = async () => {
      try {
        setLoading(true);
        const data = await listingsAPI.getListing(id);
        console.log('Date listing primite:', data);
        
        
        if (isAuthenticated) {
          const favoritesMap = JSON.parse(localStorage.getItem('userFavorites') || '{}');
          
          if (data.is_favorite === undefined && favoritesMap[id]) {
            data.is_favorite = true;
          }
        }
        
        setListing(data);
        
        
        if (data?.user?.profile_image) {
          setSellerAvatarUrl(getImageUrl(data.user.profile_image));
        }
      } catch (err) {
        console.error('Eroare la încărcarea detaliilor anunțului:', err);
        setError('Nu am putut încărca detaliile anunțului. Vă rugăm să încercați din nou.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchListing();
  }, [id, isAuthenticated]);
  

  useEffect(() => {
   
    if (listing && isAuthenticated && !loading) {
     
      try {
        console.log('Înregistrare vizualizare pentru anunțul ID:', id);
        recommendationsAPI.recordInteraction({
          listing_id: id,
          type: 'view'
        });
      } catch (err) {
        console.error('Eroare la înregistrarea interacțiunii de vizualizare:', err);
       
      }
    }
  }, [listing, id, isAuthenticated, loading]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  
  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/listings/${id}` } });
      return;
    }
    
    try {
      setIsToggling(true);
      await listingsAPI.toggleFavorite(id);
      
 
      try {
        const interactionType = !listing.is_favorite ? 'favorite' : 'unfavorite';
        await recommendationsAPI.recordInteraction({
          listing_id: id,
          type: interactionType
        });
      } catch (interactionErr) {
        console.error('Eroare la înregistrarea interacțiunii:', interactionErr);
        
      }
      
     
      setListing(prevListing => ({
        ...prevListing,
        is_favorite: !prevListing.is_favorite
      }));
      
      
      const favoritesMap = JSON.parse(localStorage.getItem('userFavorites') || '{}');
      if (!listing.is_favorite) {
        favoritesMap[id] = true;
      } else {
        delete favoritesMap[id];
      }
      localStorage.setItem('userFavorites', JSON.stringify(favoritesMap));
      
    } catch (err) {
      console.error('Eroare la adăugarea/eliminarea din favorite:', err);
    } finally {
      setIsToggling(false);
    }
  };
  

  const navigateToSellerProfile = () => {
    if (listing?.user?.id) {
      navigate(`/user/${listing.user.id}`);
    }
  };
  
  
  const isOwner = isAuthenticated && user && listing && listing.user && user.id === listing.user.id;
  
  
  const isAdmin = isAuthenticated && user && user.is_admin;
  
  
  const handleEdit = () => {
    navigate(`/edit-listing/${id}`);
  };
  
  
  const handleDeleteConfirm = () => {
    setDeleteDialogOpen(true);
  };
  
  
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };
  

  const handleDeleteListing = async () => {
    try {
      setDeleting(true);
      await listingsAPI.deleteListing(id);
      setDeleteDialogOpen(false);
      navigate('/');
    } catch (err) {
      console.error('Eroare la ștergerea anunțului:', err);
      setError('Nu am putut șterge anunțul. Vă rugăm să încercați din nou.');
      setDeleting(false);
    }
  };
  
  if (loading) {
    return (
      <Container sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
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
  
  if (!listing) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="info">Anunțul nu a fost găsit.</Alert>
      </Container>
    );
  }
  
  
  const images = listing.images && listing.images.length > 0
    ? listing.images.map(img => ({
        original: img.image_path,
        thumbnail: img.image_path,
      }))
    : [{ original: placeholderCar, thumbnail: placeholderCar }];
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
         
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                {listing.title}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Publicat la {new Date(listing.created_at).toLocaleDateString('ro-RO')}
                {listing.user && ` de ${listing.user.username}`}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {isOwner || isAdmin ? (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<EditIcon />}
                    onClick={handleEdit}
                  >
                    Editează anunțul
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleDeleteConfirm}
                  >
                    Șterge anunțul
                  </Button>
                </Box>
              ) : (
                <Button
                  variant={listing.is_favorite ? "contained" : "outlined"}
                  color="secondary"
                  startIcon={listing.is_favorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  onClick={toggleFavorite}
                  disabled={isToggling}
                >
                  {listing.is_favorite ? "Adăugat la favorite" : "Adaugă la favorite"}
                </Button>
              )}
            </Box>
          </Box>
          
         
          {isAdmin && !isOwner && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                Aveți acces la acest anunț în calitate de administrator.
              </Typography>
            </Alert>
          )}
          
       
          <Paper elevation={2} sx={{ mb: 4, overflow: 'hidden' }}>
            <ImageGallery images={images} />
          </Paper>
          
          
          <Paper elevation={2} sx={{ mb: 4 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="listing tabs">
                <Tab label="Detalii" icon={<InfoIcon />} iconPosition="start" {...a11yProps(0)} />
                <Tab label="Descriere" icon={<DirectionsCarIcon />} iconPosition="start" {...a11yProps(1)} />
                <Tab label="Finanțare" icon={<AttachMoneyIcon />} iconPosition="start" {...a11yProps(2)} />
              </Tabs>
              </Box>
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="h6" gutterBottom>
                    <DirectionsCarIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Informații generale
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">Marca:</Typography>
                      <Typography variant="body1" fontWeight="bold">{listing.brand}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">Model:</Typography>
                      <Typography variant="body1" fontWeight="bold">{listing.model}</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">Tip caroserie:</Typography>
                      <Typography variant="body1" fontWeight="bold">{listing.body_type || 'N/A'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">Localitate:</Typography>
                      <Typography variant="body1" fontWeight="bold">{listing.location || 'N/A'}</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">An fabricație:</Typography>
                      <Typography variant="body1" fontWeight="bold">{listing.year_of_manufacture}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">Stare:</Typography>
                      <Chip 
                        label={listing.condition_state === 'nou' ? 'Nou' : 
                              listing.condition_state === 'utilizat' ? 'Utilizat' : 'Avariat'} 
                        color={listing.condition_state === 'nou' ? 'success' : 
                              listing.condition_state === 'utilizat' ? 'primary' : 'error'} 
                        size="small" 
                      />
                    </Box>

                  
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {listing.right_hand_drive && (
                        <Chip 
                          label="Volan pe dreapta" 
                          color="info" 
                          size="small"
                        />
                      )}
                      {listing.registered && (
                        <Chip 
                          label="Înmatriculat în România" 
                          color="success" 
                          size="small"
                        />
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">Culoare:</Typography>
                      <Typography variant="body1" fontWeight="bold">{listing.color}</Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="h6" gutterBottom>
                    <SettingsIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Caracteristici tehnice
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">Kilometraj:</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {typeof listing.mileage === 'number' 
                          ? listing.mileage.toLocaleString() 
                          : listing.mileage} km
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">
                        {listing.fuel_type === 'electric' ? 'Capacitate baterie:' : 'Capacitate motor:'}
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {listing.fuel_type === 'electric' 
                          ? `${listing.engine_capacity} kWh` 
                          : `${listing.engine_capacity} cm³`}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">Putere:</Typography>
                      <Typography variant="body1" fontWeight="bold">{listing.power} CP</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">Combustibil:</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {listing.fuel_type === 'benzina' ? 'Benzină' : 
                         listing.fuel_type === 'diesel' ? 'Diesel' : 
                         listing.fuel_type === 'electric' ? 'Electric' : 
                         listing.fuel_type === 'hibrid_benzina' ? 'Hibrid Benzina' : 
                         listing.fuel_type === 'hibrid_diesel' ? 'Hibrid Diesel' : 
                         listing.fuel_type === 'GPL' ? 'GPL' : 'Altele'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">Număr locuri:</Typography>
                      <Typography variant="body1" fontWeight="bold">{listing.seats || 'N/A'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">Număr uși:</Typography>
                      <Typography variant="body1" fontWeight="bold">{listing.doors || 'N/A'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">Emisii CO2:</Typography>
                      <Typography variant="body1" fontWeight="bold">{listing.co2_emissions ? `${listing.co2_emissions} g/km` : 'N/A'}</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">Norma de poluare:</Typography>
                      <Typography variant="body1" fontWeight="bold">{listing.emission_standard}</Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="h6" gutterBottom>
                    <SpeedIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Transmisie
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">Cutie de viteze:</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {listing.transmission === 'manuala' ? 'Manuală' : 
                         listing.transmission === 'automata' ? 'Automată' : 'Semi-automată'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">Tracțiune:</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {listing.drive_type === 'fata' ? 'Față' : 
                         listing.drive_type === 'spate' ? 'Spate' : '4x4'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                {/* Dotări/echipamente */}
              <Grid item xs={12} sm={6}>
                <Typography variant="h6" gutterBottom>
                  <CheckCircleIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Dotări
                </Typography>
                <Box sx={{ pl: 2 }}>
                  {console.log('Features la afișare:', listing.features)}
                  {listing.features && listing.features.length > 0 && listing.features.some(feature => feature.feature_name.trim() !== '') ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {listing.features
                        .filter(feature => feature.feature_name.trim() !== '')
                        .map((feature, index) => (
                          <Chip 
                            key={index} 
                            label={`${feature.feature_name}${feature.feature_value ? ': ' + feature.feature_value : ''}`} 
                            size="small" 
                            variant="outlined"
                          />
                        ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Nu au fost specificate dotări.
                    </Typography>
                  )}
                </Box>
              </Grid>
              </Grid>
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom>
                Descriere
              </Typography>
              {listing.description ? (
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {listing.description}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Nu a fost adăugată o descriere.
                </Typography>
              )}
            </TabPanel>
            
            <TabPanel value={tabValue} index={2}>
              <FinancialCalculator price={listing.price} />
            </TabPanel>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h4" color="primary.main" gutterBottom>
              {typeof listing.price === 'number' 
              ? Math.round(listing.price).toLocaleString('ro-RO') 
              : listing.price} €
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Cod anunț: {listing.id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <EventIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                Publicat la {new Date(listing.created_at).toLocaleDateString('ro-RO')}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Informații vânzător
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 1,
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.8
                  }
                }}
                onClick={navigateToSellerProfile}
              >
                <Box sx={{ position: 'relative', mr: 2 }}>
                  <Avatar 
                    src={sellerAvatarUrl}
                    alt={listing.user?.username || "User"}
                    sx={{ 
                      width: 50, 
                      height: 50,
                      bgcolor: !sellerAvatarUrl ? 'primary.main' : undefined
                    }}
                  >
                    {!sellerAvatarUrl && (listing.user?.username?.charAt(0).toUpperCase() || "U")}
                  </Avatar>
                  
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: listing.user?.is_online ? '#4CAF50' : '#9e9e9e',
                      border: '2px solid white',
                      zIndex: 1
                    }}
                  />
                </Box>
                <Box>
                  <Typography variant="body1" fontWeight="bold">
                    {listing.user?.display_name || listing.user?.username || 'Informații indisponibile'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {listing.user?.is_online 
                      ? 'Online acum' 
                      : listing.user?.last_activity 
                        ? `Ultima activitate: ${new Date(listing.user.last_activity).toLocaleString('ro-RO', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}`
                        : 'Activitate necunoscută'}
                  </Typography>
                </Box>
              </Box>
              
              {listing.user?.email && (
                <Typography variant="body2">
                  Email: {listing.user.email}
                </Typography>
              )}
              
              {listing.user?.phone_number && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2">
                    Telefon: {showPhone ? listing.user.phone_number : '••••••••••'}
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => setShowPhone(!showPhone)}
                    color="primary"
                    sx={{ ml: 1 }}
                  >
                    {showPhone ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                  </IconButton>
                </Box>
              )}
            </Box>
            
            {listing.user?.email && (
              <Button 
                variant="outlined" 
                color="primary" 
                fullWidth
                href={`mailto:${listing.user.email}?subject=Anunț Vrum Vrum Market: ${listing.title}&body=Bună ziua,%0A%0ASunt interesat de anunțul dumneavoastră "${listing.title}" de pe Vrum Vrum Market (ID: ${listing.id}). Vă rog să mă contactați pentru mai multe detalii.%0A%0AVă mulțumesc,`}
                startIcon={<Mail />}
                sx={{ mb: 1 }}
                onClick={() => {
                  
                  try {
                    recommendationsAPI.recordInteraction({
                      listing_id: listing.id,
                      type: 'contact'
                    });
                  } catch (err) {
                    console.error('Eroare la înregistrarea interacțiunii de contact:', err);
                  }
                }}
              >
                Trimite email
              </Button>
            )}
            
            {listing.user?.phone_number && (
              <Button 
                variant="contained" 
                color="success" 
                fullWidth
                href={`tel:${listing.user.phone_number}`}
                startIcon={<Phone size={18} />}
                disabled={!showPhone}
                onClick={(e) => {
                  if (!showPhone) {
                    e.preventDefault();
                    setShowPhone(true);
                  } else{
                    
                    try {
                      recommendationsAPI.recordInteraction({
                        listing_id: listing.id,
                        type: 'contact'
                      });
                    } catch (err) {
                      console.error('Eroare la înregistrarea interacțiunii de contact:', err);
                    }
                  }
                }}
              >
                {showPhone ? "Sună vânzătorul" : "Arată numărul pentru a suna"}
              </Button>
            )}
          </Paper>
          
          
         
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <DirectionsCarIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Anunțuri similare
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Mașini similare care te-ar putea interesa:
            </Typography>
            
          
            <SimilarListings currentListing={listing} />
          </Paper>
        </Grid>
      </Grid>
      
     
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirmare ștergere anunț
        </DialogTitle>
        <DialogContent>
          <Typography id="delete-dialog-description">
            Sunteți sigur că doriți să ștergeți acest anunț? Această acțiune nu poate fi anulată.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Anulează
          </Button>
          <Button 
            onClick={handleDeleteListing} 
            color="error" 
            variant="contained"
            disabled={deleting}
          >
            {deleting ? <CircularProgress size={24} /> : 'Șterge definitiv'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ListingDetailsPage;
