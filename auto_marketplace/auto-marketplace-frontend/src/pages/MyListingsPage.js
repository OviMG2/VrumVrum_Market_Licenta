import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Pagination from '@mui/material/Pagination';
import { Link as RouterLink } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SpeedIcon from '@mui/icons-material/Speed';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import placeholderCar from '../assets/images/placeholder-car.jpg';

const MyListingsPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [allListings, setAllListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const itemsPerPage = 10; // Numărul de anunțuri pe pagină

  useEffect(() => {
    // Verificăm dacă utilizatorul este autentificat
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/my-listings' } });
      return;
    }

    // Obținem toate anunțurile utilizatorului
    const fetchAllMyListings = async () => {
      try {
        setLoading(true);
        
        // Obținem prima pagină pentru a afișa ceva rapid
        const initialData = await listingsAPI.getMyListings({ page: 1, limit: itemsPerPage });
        console.log('Prima pagină de anunțuri:', initialData);
        
        if (Array.isArray(initialData?.results)) {
          setListings(initialData.results);
          
          // Dacă avem informații despre paginare în răspuns
          if (initialData.count) {
            setTotalPages(Math.ceil(initialData.count / itemsPerPage));
          }
          
          // Acum încărcăm toate anunțurile (poate dura mai mult)
          setLoadingMore(true);
          let allItems = [...initialData.results];
          let currentPage = 2;
          let hasMorePages = initialData.next != null;
          
          // Continuăm să încărcăm pagini până când am obținut toate anunțurile
          while (hasMorePages) {
            const moreData = await listingsAPI.getMyListings({ page: currentPage, limit: itemsPerPage });
            
            if (Array.isArray(moreData?.results) && moreData.results.length > 0) {
              allItems = [...allItems, ...moreData.results];
              currentPage++;
              hasMorePages = moreData.next != null;
            } else {
              hasMorePages = false;
            }
          }
          
          setAllListings(allItems);
          setTotalPages(Math.ceil(allItems.length / itemsPerPage));
          setLoadingMore(false);
        } else {
          // Încercăm o abordare alternativă - poate API-ul returnează direct lista
          console.log('Încerc abordare alternativă pentru obținerea anunțurilor');
          const directData = await listingsAPI.getMyListings({ limit: 1000 }); // Limită mare pentru a obține toate
          
          if (Array.isArray(directData)) {
            setListings(directData.slice(0, itemsPerPage)); // Primele elemente pentru prima pagină
            setAllListings(directData);
            setTotalPages(Math.ceil(directData.length / itemsPerPage));
          } else {
            console.error('Răspunsul nu este un array:', directData);
            setListings([]);
            setAllListings([]);
            setError('Format neașteptat de date. Vă rugăm să contactați administratorul.');
          }
        }
      } catch (err) {
        console.error('Eroare la încărcarea anunțurilor:', err);
        setError('Nu am putut încărca anunțurile. Vă rugăm să încercați din nou.');
        setListings([]);
        setAllListings([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchAllMyListings();
  }, [isAuthenticated, navigate]);

  // Gestionează schimbarea paginii
  const handlePageChange = (event, value) => {
    setPage(value);
    const startIndex = (value - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setListings(allListings.slice(startIndex, endIndex));
    
    // Derulăm la începutul listei pentru o experiență mai bună
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Funcția pentru a formata data
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ro-RO', options);
  };

  // Funcția pentru ștergerea unui anunț
  const handleDelete = async (id) => {
    if (window.confirm('Sunteți sigur că doriți să ștergeți acest anunț?')) {
      try {
        await listingsAPI.deleteListing(id);
        
        // Actualizăm atât lista vizibilă cât și lista completă
        setAllListings(prevListings => prevListings.filter(listing => listing.id !== id));
        setListings(prevListings => prevListings.filter(listing => listing.id !== id));
        
        // Recalculăm numărul total de pagini
        const newTotalPages = Math.ceil((allListings.length - 1) / itemsPerPage);
        setTotalPages(newTotalPages);
        
        // Dacă pagina curentă este mai mare decât noul număr total de pagini, revenim la ultima pagină
        if (page > newTotalPages && newTotalPages > 0) {
          handlePageChange(null, newTotalPages);
        }
      } catch (err) {
        console.error('Eroare la ștergerea anunțului:', err);
        setError('Nu am putut șterge anunțul. Vă rugăm să încercați din nou.');
      }
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Anunțurile mele
          {allListings.length > 0 && (
            <Typography component="span" variant="h6" color="text.secondary" sx={{ ml: 2 }}>
              ({allListings.length} anunțuri)
            </Typography>
          )}
        </Typography>
        <Button
          component={RouterLink}
          to="/create-listing"
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
        >
          Adaugă anunț nou
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loadingMore && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CircularProgress size={24} sx={{ mr: 2 }} />
            <Typography>Se încarcă toate anunțurile dumneavoastră...</Typography>
          </Box>
        </Alert>
      )}

      {allListings.length === 0 && !loading && !loadingMore ? (
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Nu aveți încă niciun anunț publicat
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3 }}>
            Creați primul dumneavoastră anunț pentru a-l vedea aici.
          </Typography>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {listings.map((listing) => (
              <Grid item xs={12} md={6} key={listing.id}>
                <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={listing.images && listing.images.length > 0 ? listing.images[0].image_path : placeholderCar}
                    alt={listing.title}
                    sx={{ backgroundColor: '#f5f5f5', objectFit: 'contain' }} // Adaugă fundalul gri deschis
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" component="div" gutterBottom>
                      {listing.title}
                    </Typography>
                    
                    <Typography variant="h6" color="primary.main" gutterBottom>
                      {typeof listing.price === 'number' 
                        ? Math.round(listing.price).toLocaleString('ro-RO') 
                        : listing.price} €
                    </Typography>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarMonthIcon sx={{ mr: 0.5, color: 'text.secondary' }} fontSize="small" />
                        <Typography variant="body2" color="text.secondary">
                          {listing.year_of_manufacture}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SpeedIcon sx={{ mr: 0.5, color: 'text.secondary' }} fontSize="small" />
                        <Typography variant="body2" color="text.secondary">
                          {listing.mileage ? listing.mileage.toLocaleString() : '0'} km
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocalGasStationIcon sx={{ mr: 0.5, color: 'text.secondary' }} fontSize="small" />
                        <Typography variant="body2" color="text.secondary">
                          {listing.fuel_type === 'benzina' ? 'Benzină' : 
                           listing.fuel_type === 'diesel' ? 'Diesel' : 
                           listing.fuel_type === 'electric' ? 'Electric' : 
                           listing.fuel_type === 'hibrid_benzina' ? 'Hibrid Benzină' :
                           listing.fuel_type === 'hibrid_diesel' ? 'Hibrid Diesel' :
                           listing.fuel_type === 'GPL' ? 'GPL' : 'Altele'}
                        </Typography>
                      </Box>
                    </Stack>
                    
                    <Typography variant="body2" color="text.secondary">
                      Publicat la: {formatDate(listing.created_at)}
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      <Chip 
                        label={listing.condition_state === 'nou' ? 'Nou' : 
                               listing.condition_state === 'utilizat' ? 'Utilizat' : 'Avariat'} 
                        color={listing.condition_state === 'nou' ? 'success' : 
                               listing.condition_state === 'utilizat' ? 'primary' : 'error'} 
                        size="small" 
                        sx={{ mr: 1 }}
                      />
                      <Chip 
                        label={listing.transmission === 'manuala' ? 'Manuală' : 
                               listing.transmission === 'automata' ? 'Automată' : 'Semi-automată'} 
                        variant="outlined" 
                        size="small" 
                      />
                    </Box>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button 
                      component={RouterLink} 
                      to={`/listings/${listing.id}`} 
                      variant="outlined" 
                      size="small"
                      startIcon={<DirectionsCarIcon />}
                    >
                      Vezi detalii
                    </Button>
                    <Box sx={{ flexGrow: 1 }} />
                    <IconButton 
                      component={RouterLink} 
                      to={`/edit-listing/${listing.id}`} 
                      color="primary" 
                      aria-label="edit"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      aria-label="delete"
                      onClick={() => handleDelete(listing.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {/* Paginare pentru anunțuri */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
                size="large"
                showFirstButton 
                showLastButton
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default MyListingsPage;