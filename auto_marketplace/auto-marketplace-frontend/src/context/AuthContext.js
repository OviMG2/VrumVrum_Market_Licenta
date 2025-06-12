import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';


const AuthContext = createContext(null);


export const useAuth = () => useContext(AuthContext);


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);
  const baseURL = 'http://localhost:8000/api/';
  
  
  const ACTIVITY_UPDATE_INTERVAL = 30 * 1000;


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
  
  useEffect(() => {
    let activityInterval = null;
    
    
    if (user && !loading) {
      
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
      
     
      updateActivity();
      activityInterval = setInterval(updateActivity, ACTIVITY_UPDATE_INTERVAL);
    }
    
  
    return () => {
      if (activityInterval) {
        clearInterval(activityInterval);
      }
    };
  }, [user, loading]);

  
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      
      const response = await axios.post(`${baseURL}users/login/`, credentials);
      
      
      const { access, refresh, user: userData } = response.data;
      
     
      localStorage.setItem('token', access);
      localStorage.setItem('refreshToken', refresh);
      localStorage.setItem('user', JSON.stringify(userData));
      
      
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

  
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
     
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

 
  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    
    try {
      
      const token = localStorage.getItem('token');
      
 
      const response = await axios.put(`${baseURL}users/profile/`, profileData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
     
      const updatedUser = response.data;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return { success: true, user: updatedUser };
    } catch (err) {
      console.error('Eroare la actualizarea profilului:', err);
      
    
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
