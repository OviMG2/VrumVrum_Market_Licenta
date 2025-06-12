import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { listingsAPI, recommendationsAPI } from '../services/api';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DeleteIcon from '@mui/icons-material/Delete';
import placeholderCar from '../assets/images/placeholder-car.jpg';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Obținem lista de favorite de la API
      const response = await listingsAPI.getFavorites();
      console.log('Response from favorites API:', response); // Debug
      
      // Extragem datele favorite în funcție de structura răspunsului
      let favoritesData = response.data?.results || response.data || [];
      
      // Dacă nu avem nicio dată, afișăm mesajul corespunzător
      if (!favoritesData.length) {
        setFavorites([]);
        setLoading(false);
        return;
      }
      
      // Colectăm ID-urile anunțurilor favorite
      const listingIds = [];
      
      // Verificăm formatul de date pentru a extrage corect ID-urile anunțurilor
      favoritesData.forEach(favorite => {
        if (favorite.car_listing) {
          // Format: { id: 1, user: 1, car_listing: 5, ... }
          if (typeof favorite.car_listing === 'number') {
            listingIds.push(favorite.car_listing);
          } else if (favorite.car_listing?.id) {
            // Format: { id: 1, user: 1, car_listing: { id: 5, ... }, ... }
            listingIds.push(favorite.car_listing.id);
          }
        } else if (favorite.id) {
          // Format: { id: 5, brand: "...", ... }
          listingIds.push(favorite.id);
        }
      });
      
      console.log('Listing IDs to fetch:', listingIds);
      
      if (listingIds.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }
      
      // Obținem datele complete pentru fiecare anunț
      const fetchedListings = [];
      
      // Folosim un array de promise-uri pentru a face toate cererile în paralel
      const fetchPromises = listingIds.map(async (listingId) => {
        try {
          const listingData = await listingsAPI.getListing(listingId);
          if (listingData) {
            fetchedListings.push({
              ...listingData,
              is_favorite: true // Setăm anunțul ca favorit
            });
          }
        } catch (error) {
          console.error(`Eroare la obținerea anunțului ${listingId}:`, error);
          // Continuăm cu restul anunțurilor chiar dacă unul eșuează
        }
      });
      
      // Așteptăm ca toate cererile să se finalizeze
      await Promise.all(fetchPromises);
      
      console.log('Fetched complete listings:', fetchedListings);
      
      // Actualizăm starea cu anunțurile obținute
      setFavorites(fetchedListings);
      
      // Actualizăm localStorage cu toate anunțurile favorite
      const favoritesMap = {};
      fetchedListings.forEach(listing => {
        favoritesMap[listing.id] = true;
      });
      localStorage.setItem('userFavorites', JSON.stringify(favoritesMap));
      
    } catch (err) {
      console.error('Eroare la încărcarea anunțurilor favorite:', err);
      setError('A apărut o eroare la încărcarea anunțurilor favorite.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (id) => {
    setIsDeleting(id);
    
    try {
      await listingsAPI.toggleFavorite(id);
      
      // Înregistrăm interacțiunea în sistemul de recomandare
      try {
        await recommendationsAPI.recordInteraction({
          listing_id: id,
          type: 'unfavorite' // Înregistrăm ca eliminare din favorite
        });
      } catch (interactionErr) {
        console.error('Eroare la înregistrarea interacțiunii:', interactionErr);
        // Nu întrerupem fluxul principal
      }
      
      // Actualizăm lista fără a face un nou request
      setFavorites(favorites.filter(listing => listing.id !== id));
      
      // Actualizăm și localStorage
      const favoritesMap = JSON.parse(localStorage.getItem('userFavorites') || '{}');
      delete favoritesMap[id];
      localStorage.setItem('userFavorites', JSON.stringify(favoritesMap));
    } catch (err) {
      console.error('Eroare la eliminarea din favorite:', err);
    } finally {
      setIsDeleting(null);
    }
  };
  
  // Funcție pentru înregistrarea interacțiunii de vizualizare
  const handleViewDetails = async (id) => {
    try {
      await recommendationsAPI.recordInteraction({
        listing_id: id,
        type: 'view' // Înregistrăm ca interacțiune de tip vizualizare
      });
    } catch (err) {
      console.error('Eroare la înregistrarea interacțiunii de vizualizare:', err);
      // Nu întrerupem fluxul principal
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Anunțurile mele favorite
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {favorites.length === 0 ? (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nu aveți niciun anunț adăugat la favorite.
          </Typography>
          <Button
            component={RouterLink}
            to="/"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Explorează anunțuri
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {favorites.map((listing) => (
            <Grid item key={`favorite-${listing.id}`} xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', transition: 'transform 0.2s, box-shadow 0.2s','&:hover': {transform: 'translateY(-4px)',boxShadow: 4,}, }}>
                <IconButton
                  size="small"
                  color="secondary"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    zIndex: 1,
                  }}
                  onClick={() => handleRemoveFavorite(listing.id)}
                  disabled={isDeleting === listing.id}
                >
                  {isDeleting === listing.id ? (
                    <CircularProgress size={24} color="secondary" />
                  ) : (
                    <DeleteIcon />
                  )}
                </IconButton>
                <CardActionArea 
                  component={RouterLink} 
                  to={`/listings/${listing.id}`}
                  onClick={() => handleViewDetails(listing.id)}
                >
                  <CardMedia
                    component="img"
                    height="160"
                    image={listing.images && listing.images.length > 0 
                      ? listing.images.find(img => img.is_main)?.image_path || listing.images[0].image_path 
                      : placeholderCar
                    }
                    alt={`${listing.brand || ''} ${listing.model || ''}`}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="div" noWrap>
                      {listing.title || 'Anunț fără titlu'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {listing.brand || 'N/A'} {listing.model || 'N/A'}, {listing.year_of_manufacture || 'N/A'}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {typeof listing.mileage === 'number' ? listing.mileage.toLocaleString() : 'N/A'} km
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {listing.fuel_type === 'benzina' ? 'Benzină' : 
                         listing.fuel_type === 'diesel' ? 'Diesel' : 
                         listing.fuel_type === 'electric' ? 'Electric' : 
                         listing.fuel_type === 'hibrid' ? 'Hibrid' : 
                         listing.fuel_type === 'GPL' ? 'GPL' : 
                         listing.fuel_type || 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <Box>
                      <Typography variant="body2" color="text.secondary">
                        {listing.fuel_type === 'electric' 
                          ? `${listing.engine_capacity || 'N/A'} kWh, ${listing.power || 'N/A'} CP` 
                          : `${listing.engine_capacity || 'N/A'} cm³, ${listing.power || 'N/A'} CP`}
                      </Typography>
                      </Box>
                      <Typography variant="h6" color="primary.main">
                        {typeof listing.price === 'number' ? listing.price.toLocaleString() : listing.price || 'N/A'} €
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default FavoritesPage;