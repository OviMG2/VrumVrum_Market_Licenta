import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import YouTubeIcon from '@mui/icons-material/YouTube';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim() !== '') {
     
      console.log(`Email abonat: ${email}`);
      setOpenSnackbar(true);
      setEmail(''); 
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <Box sx={{ 
      bgcolor: '#333333', 
      color: 'white', 
      py: 6, 
      mt: 'auto',
      boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.2)'
    }}>
      <Container maxWidth="lg">
        <Grid container spacing={5} alignItems="flex-start">
      
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <DirectionsCarIcon sx={{ fontSize: 40, mr: 1.5 }} />
              <Typography variant="h5" fontWeight="bold" sx={{ letterSpacing: '0.5px' }}>
                Vrum Vrum Market
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.6, opacity: 0.9 }}>
              Platforma ta de încredere pentru cumpărarea și vânzarea autovehiculelor. 
              Cu o experiență de peste 10 ani pe piață, oferim cele mai bune soluții pentru nevoile tale auto.
            </Typography>
            <Box sx={{ display: 'flex', mt: 2 }}>
              <IconButton color="inherit" aria-label="Facebook" sx={{ mr: 1, bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                <FacebookIcon />
              </IconButton>
              <IconButton color="inherit" aria-label="Instagram" sx={{ mr: 1, bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                <InstagramIcon />
              </IconButton>
              <IconButton color="inherit" aria-label="Twitter" sx={{ mr: 1, bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                <TwitterIcon />
              </IconButton>
              <IconButton color="inherit" aria-label="LinkedIn" sx={{ mr: 1, bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                <LinkedInIcon />
              </IconButton>
              <IconButton color="inherit" aria-label="YouTube" sx={{ bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                <YouTubeIcon />
              </IconButton>
            </Box>
          </Grid>

        
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ 
              position: 'relative', 
              pb: 2,
              '&:after': {
                content: '""',
                position: 'absolute',
                left: 0,
                bottom: 0,
                width: '40px',
                height: '3px',
                bgcolor: 'secondary.main'
              }
            }}>
              Navigare rapidă
            </Typography>
            <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none', mt: 2 }}>
              <Box component="li" sx={{ mb: 1.5 }}>
                <Link component={RouterLink} to="/" color="inherit" underline="hover" sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  transition: 'all 0.2s',
                  '&:hover': { pl: 0.5 }
                }}>
                  Acasă
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1.5 }}>
                <Link component={RouterLink} to="/recommendations" color="inherit" underline="hover" sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  transition: 'all 0.2s',
                  '&:hover': { pl: 0.5 }
                }}>
                  Recomandate
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1.5 }}>
                <Link component={RouterLink} to="/create-listing" color="inherit" underline="hover" sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  transition: 'all 0.2s',
                  '&:hover': { pl: 0.5 }
                }}>
                  Adaugă anunț
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1.5 }}>
                <Link component={RouterLink} to="/my-listings" color="inherit" underline="hover" sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  transition: 'all 0.2s',
                  '&:hover': { pl: 0.5 }
                }}>
                  Anunțurile mele
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1.5 }}>
                <Link component={RouterLink} to="/favorites" color="inherit" underline="hover" sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  transition: 'all 0.2s',
                  '&:hover': { pl: 0.5 }
                }}>
                  Favorite
                </Link>
              </Box>
            </Box>
          </Grid>

        
          <Grid item xs={12} sm={6} md={5}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ 
              position: 'relative', 
              pb: 2,
              '&:after': {
                content: '""',
                position: 'absolute',
                left: 0,
                bottom: 0,
                width: '40px',
                height: '3px',
                bgcolor: 'secondary.main'
              }
            }}>
              Contactează-ne
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationOnIcon sx={{ mr: 2, color: 'secondary.main' }} />
                <Typography variant="body2">
                  Strada Exemplu, Nr. 123, București
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PhoneIcon sx={{ mr: 2, color: 'secondary.main' }} />
                <Typography variant="body2">
                  0700 123 456
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <EmailIcon sx={{ mr: 2, color: 'secondary.main' }} />
                <Typography variant="body2">
                  contact@vrumvrum.com
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" gutterBottom sx={{ fontWeight: '500' }}>
                Abonează-te la newsletter:
              </Typography>
              <Box
                component="form"
                onSubmit={handleSubscribe}
                sx={{
                  display: 'flex',
                  mt: 1.5,
                  position: 'relative',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
                noValidate
              >
                <input
                  style={{ 
                    padding: '12px 15px', 
                    borderRadius: '4px 0 0 4px',
                    border: 'none',
                    flexGrow: 1,
                    outline: 'none',
                    fontSize: '14px'
                  }}
                  placeholder="Adresa ta de email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  sx={{ 
                    borderRadius: '0 4px 4px 0',
                    boxShadow: 'none',
                    px: 2
                  }}
                >
                  Abonare
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'center', sm: 'center' },
          textAlign: { xs: 'center', sm: 'left' }
        }}>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            &copy; {new Date().getFullYear()} Vrum Vrum Market. Toate drepturile rezervate.
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            mt: { xs: 2, sm: 0 },
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <Link href="#" color="inherit" underline="hover" sx={{ mx: 1.5, opacity: 0.7, '&:hover': { opacity: 1 } }}>
              Termeni și condiții
            </Link>
            <Link href="#" color="inherit" underline="hover" sx={{ mx: 1.5, opacity: 0.7, '&:hover': { opacity: 1 } }}>
              Politica de confidențialitate
            </Link>
            <Link href="#" color="inherit" underline="hover" sx={{ mx: 1.5, opacity: 0.7, '&:hover': { opacity: 1 } }}>
              Cookies
            </Link>
          </Box>
        </Box>
      </Container>
      
     
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={5000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Te-ai abonat cu succes la newsletter-ul nostru!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Footer;
