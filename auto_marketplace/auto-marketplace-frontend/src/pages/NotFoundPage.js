import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';

const NotFoundPage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <SentimentDissatisfiedIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        
        <Typography variant="h3" component="h1" gutterBottom>
          404
        </Typography>
        
        <Typography variant="h5" component="h2" gutterBottom>
          Pagina nu a fost găsită
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Ne pare rău, dar pagina pe care încercați să o accesați nu există sau a fost mutată.
        </Typography>
        
        <Box sx={{ mt: 4 }}>
          <Button
            component={RouterLink}
            to="/"
            variant="contained"
            color="primary"
            size="large"
          >
            Înapoi la pagina principală
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default NotFoundPage;