import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Cream contextul de autentificare
const AuthContext = createContext(null);

// Hook pentru a folosi contextul de autentificare
export const useAuth = () => useContext(AuthContext);

// Provider pentru context care va înconjura aplicația
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);
  const baseURL = 'http://localhost:8000/api/';
  
  // Interval pentru actualizarea activității utilizatorului (la fiecare 30 secunde)
  const ACTIVITY_UPDATE_INTERVAL = 30 * 1000;

  // Verificăm la încărcare dacă există un utilizator salvat
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (storedUser && token) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (err) {
          console.error('Eroare la parsarea utilizatorului:', err);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
        }
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);
  
  // Setăm un interval pentru a actualiza timestamp-ul de activitate
  useEffect(() => {
    let activityInterval = null;
    
    // Doar dacă utilizatorul este autentificat
    if (user && !loading) {
      // Funcție care trimite cerere la server pentru a actualiza last_activity
      const updateActivity = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;
          
          await axios.post(`${baseURL}users/update_activity/`, {}, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        } catch (err) {
          console.error('Eroare la actualizarea activității:', err);
        }
      };
      
      // Actualizăm imediat la autentificare și apoi la interval
      updateActivity();
      activityInterval = setInterval(updateActivity, ACTIVITY_UPDATE_INTERVAL);
    }
    
    // Cleanup la deconectare
    return () => {
      if (activityInterval) {
        clearInterval(activityInterval);
      }
    };
  }, [user, loading]);

  // Funcție pentru autentificare
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      // Facem o cerere reală către API-ul de autentificare
      const response = await axios.post(`${baseURL}users/login/`, credentials);
      
      // Extragem datele din răspuns
      const { access, refresh, user: userData } = response.data;
      
      // Salvăm token-urile și informațiile utilizatorului
      localStorage.setItem('token', access);
      localStorage.setItem('refreshToken', refresh);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Setăm utilizatorul în state
      setUser(userData);
      
      return { success: true };
    } catch (err) {
      console.error('Eroare la autentificare:', err);
      setError(err.response?.data?.error || 'Credențiale invalide');
      return { success: false, error: err.response?.data?.error || 'Credențiale invalide' };
    } finally {
      setLoading(false);
    }
  };

  // Funcție pentru înregistrare
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Facem o cerere reală de înregistrare
      await axios.post(`${baseURL}users/register/`, userData);
      return { success: true };
    } catch (err) {
      console.error('Eroare la înregistrare:', err);
      setError(err.response?.data || 'Eroare la înregistrare');
      return { success: false, error: err.response?.data || 'Eroare la înregistrare' };
    } finally {
      setLoading(false);
    }
  };

  // Funcție pentru deconectare
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const token = localStorage.getItem('token');

      if (refreshToken && token) {

        await axios.post(
          `${baseURL}users/logout/`, 
          { refresh: refreshToken }, 
          { 
            headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json'
              } 
            }

        );
      }
    } catch (err) {
      console.error('Eroare la deconectare:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  // Funcție pentru actualizarea profilului
  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Luăm token-ul pentru autorizare
      const token = localStorage.getItem('token');
      
      // Facem cererea de actualizare a profilului
      const response = await axios.put(`${baseURL}users/profile/`, profileData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Actualizăm utilizatorul în localStorage și state
      const updatedUser = response.data;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return { success: true, user: updatedUser };
    } catch (err) {
      console.error('Eroare la actualizarea profilului:', err);
      
      // Gestionăm diferite tipuri de erori
      const errorMessage = err.response?.data?.error || 
                           err.response?.data?.detail || 
                           'Eroare la actualizarea profilului';
      
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  };
  
  // Valorile expuse de context
  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.is_admin || false,
    login,
    register,
    logout,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};