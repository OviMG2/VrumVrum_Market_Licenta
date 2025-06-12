import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Componente de layout
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Chatbot from './components/chatbot/Chatbot';
import CarLoadingScreen from './components/layout/CarLoadingScreen';

// Pagini
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ListingDetailsPage from './pages/ListingDetailsPage';
import CreateListingPage from './pages/CreateListingPage';
import EditListingPage from './pages/EditListingPage';
import MyListingsPage from './pages/MyListingsPage';
import FavoritesPage from './pages/FavoritesPage';
import ProfilePage from './pages/ProfilePage';
import UserProfilePage from './pages/UserProfilePage';
import RecommendationsPage from './pages/RecommendationsPage';
import NotFoundPage from './pages/NotFoundPage';
import { SessionExpiredModal } from './components/SessionExpiredModal';

// Pagini de administrator
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEditUser from './pages/admin/AdminEditUser';

// Rută protejată (necesită autentificare)
import ProtectedRoute from './components/auth/ProtectedRoute';

// Componenta care detectează schimbările de rută și afișează animația
const RouteChangeDetector = ({ setIsLoading }) => {
  const location = useLocation();
  
  useEffect(() => {
    setIsLoading(true);
    
    // Ascunde animația după un timp
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // durată de 1.5 secunde pentru animație
    
    return () => clearTimeout(timer);
  }, [location.pathname, setIsLoading]);
  
  return null;
};

// Componenta de gardă pentru rutele de administrator
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Se încarcă...</div>;
  }
  
  if (!user || !user.is_admin) {
    return <Navigate to="/" />;
  }
  
  return children;
};

// Tema personalizată
const theme = createTheme({
  palette: {
    primary: {
      main: '#1e88e5',
    },
    secondary: {
      main: '#f50057',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
    },
  },
});

function App() {
  const [isLoading, setIsLoading] = useState(false);
  
  // Simulează încărcarea inițială la deschiderea site-ului
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // durată mai lungă pentru încărcarea inițială
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <SessionExpiredModal />
          <CarLoadingScreen isLoading={isLoading} />
          <RouteChangeDetector setIsLoading={setIsLoading} />
          <div 
            className="app" 
            style={{
              opacity: isLoading ? 0 : 1,
              transition: 'opacity 0.3s ease-in-out',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '100vh',
            }}
          >
            <Header />
            <main className="main-content" style={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/listings/:id" element={<ListingDetailsPage />} />
                <Route path="/user/:userId" element={<UserProfilePage />} />
                
                <Route path="/create-listing" element={
                  <ProtectedRoute>
                    <CreateListingPage />
                  </ProtectedRoute>
                } />
                
                <Route path="/edit-listing/:id" element={
                  <ProtectedRoute>
                    <EditListingPage />
                  </ProtectedRoute>
                } />
                
                <Route path="/my-listings" element={
                  <ProtectedRoute>
                    <MyListingsPage />
                  </ProtectedRoute>
                } />
                
                <Route path="/favorites" element={
                  <ProtectedRoute>
                    <FavoritesPage />
                  </ProtectedRoute>
                } />
                
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
                
                <Route path="/recommendations" element={
                  <ProtectedRoute>
                    <RecommendationsPage />
                  </ProtectedRoute>
                } />
                
                {/* Rute de administrator */}
                <Route path="/admin/dashboard" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } />
                
                <Route path="/admin/users/edit/:userId" element={
                  <AdminRoute>
                    <AdminEditUser />
                  </AdminRoute>
                } />
                
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
            <Chatbot />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;