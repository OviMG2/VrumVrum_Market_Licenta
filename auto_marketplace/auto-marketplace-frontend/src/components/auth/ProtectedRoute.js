import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  // Afișam un indicator de încărcare în timp ce verificăm starea autentificării
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Verificăm dacă utilizatorul este autentificat
  if (!isAuthenticated) {
    // Redirecționăm către pagina de autentificare și păstrăm locația curentă
    // pentru a redirecționa înapoi după autentificare
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificăm dacă este necesară permisiunea de administrator
  if (adminOnly && !isAdmin) {
    // Redirecționăm către pagina principală dacă utilizatorul nu este administrator
    return <Navigate to="/" replace />;
  }

  // Dacă toate verificările sunt trecute, afișăm componenta protejată
  return children;
};

export default ProtectedRoute;