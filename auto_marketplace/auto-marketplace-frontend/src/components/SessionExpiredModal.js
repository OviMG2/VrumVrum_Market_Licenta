import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions, 
  Button 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const SessionExpiredModal = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const handleSessionExpired = (event) => {
      setOpen(true);
    };

    window.addEventListener('session-expired', handleSessionExpired);

    return () => {
      window.removeEventListener('session-expired', handleSessionExpired);
    };
  }, []);

  const handleRelogin = () => {
    logout();
    navigate('/login');
  };

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="sesiune-expirată"
      aria-describedby="reautentificare-necesară"
    >
      <DialogTitle id="sesiune-expirată">
        Sesiune Expirată
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="reautentificare-necesară">
          Din motive de securitate, sesiunea ta a expirat. 
          Te rugăm să te autentifici din nou pentru a continua.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={handleRelogin} 
          color="primary" 
          variant="contained"
        >
          Autentificare
        </Button>
      </DialogActions>
    </Dialog>
  );
};