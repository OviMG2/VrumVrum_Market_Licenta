import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { recommendationsAPI, listingsAPI } from '../services/api';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import InfoIcon from '@mui/icons-material/Info';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Tooltip from '@mui/material/Tooltip';
import placeholderCar from '../assets/images/placeholder-car.jpg';

const RecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isToggling, setIsToggling] = useState(null);
  const [tabValue, setTabValue] = useState(0); 

  
  const algorithmTypes = ['hybrid', 'collaborative', 'content'];

  useEffect(() => {
    fetchRecommendations(algorithmTypes[tabValue]);
  }, [tabValue]);

  const fetchRecommendations = async (algorithm = 'hybrid') => {
    setLoading(true);
    setError(null);

    try {
      let response;
      if (algorithm === 'hybrid') {
        response = await recommendationsAPI.getForYou();
      } else {
        response = await recommendationsAPI.getRecommendationsByAlgorithm(algorithm);
      }

      console.log(`Recomandări primite cu algoritmul ${algorithm}:`, response.data);
      setRecommendations(response.data);
    } catch (err) {
      console.error(`Eroare la încărcarea recomandărilor cu algoritmul ${algorithm}:`, err);
      setError(`A apărut o eroare la încărcarea recomandărilor cu algoritmul ${algorithm}.`);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (id) => {
    setIsToggling(id);

    try {
      await listingsAPI.toggleFavorite(id);

      
      await recommendationsAPI.recordInteraction({
        listing_id: id,
        type: 'favorite'
      });

      
      setRecommendations(
        recommendations.map(listing =>
          listing.id === id
            ? { ...listing, is_favorite: !listing.is_favorite }
            : listing
        )
      );

      
      const favoritesMap = JSON.parse(localStorage.getItem('userFavorites') || '{}');
      if (favoritesMap[id]) {
        delete favoritesMap[id];
      } else {
        favoritesMap[id] = true;
      }
      localStorage.setItem('userFavorites', JSON.stringify(favoritesMap));
    } catch (err) {
      console.error('Eroare la adăugarea/eliminarea din favorite:', err);
    } finally {
      setIsToggling(null);
    }
  };

  
  const handleViewDetails = async (id) => {
    try {
      await recommendationsAPI.recordInteraction({
        listing_id: id,
        type: 'click'
      });
    } catch (err) {
      console.error('Eroare la înregistrarea interacțiunii:', err);
    }
  };

  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue);
  };

  const getAlgorithmDescription = () => {
    const algorithm = algorithmTypes[tabValue];
    switch (algorithm) {
      case 'collaborative':
        return "Recomandări bazate pe preferințele utilizatorilor similari cu tine.";
      case 'content':
        return "Recomandări bazate pe caracteristicile mașinilor pe care le-ai apreciat anterior.";
      case 'hybrid':
      default:
        return "Recomandări care combină preferințele utilizatorilor similari și caracteristicile mașinilor apreciate.";
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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Recomandate pentru tine
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Pe baza preferințelor și interacțiunilor tale, am selectat următoarele mașini care credem că ți-ar plăcea.
        </Typography>

        
        <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleChangeTab}
            aria-label="algoritmi de recomandare"
          >
            <Tooltip title="Combină mai multe metode pentru rezultate optime">
              <Tab label="Recomandări Personalizate" />
            </Tooltip>
            <Tooltip title="Bazat pe preferințele altor utilizatori similari">
              <Tab label="Utilizatori Similari" />
            </Tooltip>
            <Tooltip title="Bazat pe caracteristicile mașinilor apreciate de tine">
              <Tab label="Mașini Similare" />
            </Tooltip>
          </Tabs>
          <Typography variant="body2" color="text.secondary" sx={{ my: 1, fontStyle: 'italic' }}>
            {getAlgorithmDescription()}
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {recommendations.length === 0 ? (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nu avem încă suficiente date pentru a-ți oferi recomandări personalizate cu acest algoritm.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Adaugă anunțuri la favorite pentru a te ajuta să găsești mașini similare.
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
          {recommendations.map((listing) => (
            <Grid item key={listing.id} xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative',transition: 'transform 0.2s, box-shadow 0.2s','&:hover': {transform: 'translateY(-4px)',boxShadow: 4,}, }}>
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
                      {listing.title || 'Titlu indisponibil'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {listing.brand || ''} {listing.model || ''}, {listing.year_of_manufacture || ''}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {typeof listing.mileage === 'number' ? listing.mileage.toLocaleString() : listing.mileage || 'N/A'} km
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
                <Divider />
                <CardActions>
                  <Button
                    component={RouterLink}
                    to={`/listings/${listing.id}`}
                    size="small"
                    startIcon={<InfoIcon />}
                    onClick={() => handleViewDetails(listing.id)}
                  >
                    Detalii
                  </Button>
                  <Box sx={{ ml: 'auto' }}>
                    <IconButton
                      color="secondary"
                      onClick={() => toggleFavorite(listing.id)}
                      disabled={isToggling === listing.id}
                    >
                      {isToggling === listing.id ? (
                        <CircularProgress size={24} color="secondary" />
                      ) : listing.is_favorite ? (
                        <FavoriteIcon />
                      ) : (
                        <FavoriteBorderIcon />
                      )}
                    </IconButton>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default RecommendationsPage;
