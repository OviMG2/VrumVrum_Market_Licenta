import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import ListSubheader from '@mui/material/ListSubheader';


import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonIcon from '@mui/icons-material/Person';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LogoutIcon from '@mui/icons-material/Logout';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RecommendIcon from '@mui/icons-material/Recommend';

import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState(null);
  
  const baseURL = 'http://localhost:8000'; 

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    
    const timestamp = new Date().getTime();
    
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return `${imagePath}?t=${timestamp}`;
    }
    
    if (imagePath.startsWith('/')) {
      return `${baseURL}${imagePath}?t=${timestamp}`;
    }
    
   
    return `${baseURL}/media/profile_images/${imagePath}?t=${timestamp}`;
  };
  
  
  useEffect(() => {
    console.log("User changed:", user?.username);
    if (user?.profile_image) {
      const newAvatarUrl = getImageUrl(user.profile_image);
      console.log("Setting avatar URL:", newAvatarUrl);
      setAvatarUrl(newAvatarUrl);
    } else {
     
      console.log("Resetting avatar URL");
      setAvatarUrl(null);
    }
  }, [user?.id, user?.username, user?.profile_image]);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = async () => {
    await logout();
    handleCloseUserMenu();
    navigate('/');
  };

  
  const pages = [
    { title: 'Acasă', path: '/' },
  ];


  const authenticatedPages = [
    { title: 'Recomandate', path: '/recommendations', icon: <RecommendIcon /> },
    { title: 'Adaugă anunț', path: '/create-listing', icon: <AddCircleIcon /> },
  ];
  
  
  const renderMobileMenu = () => {
    const menuItems = [
      ...pages.map((page) => (
        <MenuItem key={page.title} onClick={handleCloseNavMenu} component={RouterLink} to={page.path}>
          <Typography textAlign="center">{page.title}</Typography>
        </MenuItem>
      ))
    ];
    
    if (isAuthenticated) {
      
      menuItems.push(
        ...authenticatedPages.map((page) => (
          <MenuItem key={page.title} onClick={handleCloseNavMenu} component={RouterLink} to={page.path}>
            <Typography textAlign="center">{page.title}</Typography>
          </MenuItem>
        ))
      );
      
    
      if (user?.is_admin) {
        menuItems.push(
          <Divider key="admin-divider" />,
          <ListSubheader key="admin-header">Administrator</ListSubheader>,
          <MenuItem 
            key="admin-dashboard"
            onClick={handleCloseNavMenu} 
            component={RouterLink} 
            to="/admin/dashboard"
          >
            <ListItemIcon>
              <DashboardIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Dashboard Admin</ListItemText>
          </MenuItem>
        );
      }
    }
    
    return menuItems;
  };
  
  
  const renderUserMenu = () => {
    const menuItems = [
      <MenuItem 
        key="profile"
        onClick={handleCloseUserMenu}
        component={RouterLink}
        to="/profile"
      >
        <ListItemIcon>
          <PersonIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Profilul meu</ListItemText>
      </MenuItem>,
      
      <MenuItem 
        key="my-listings"
        onClick={handleCloseUserMenu}
        component={RouterLink}
        to="/my-listings"
      >
        <ListItemIcon>
          <DirectionsCarIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Anunțurile mele</ListItemText>
      </MenuItem>,
      
      <MenuItem 
        key="favorites"
        onClick={handleCloseUserMenu}
        component={RouterLink}
        to="/favorites"
      >
        <ListItemIcon>
          <FavoriteIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Favorite</ListItemText>
      </MenuItem>
    ];
    
    
    if (user?.is_admin) {
      menuItems.push(
        <Divider key="admin-divider" />,
        <ListSubheader key="admin-header">Administrare</ListSubheader>,
        <MenuItem 
          key="admin-dashboard"
          onClick={handleCloseUserMenu}
          component={RouterLink}
          to="/admin/dashboard"
        >
          <ListItemIcon>
            <DashboardIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Dashboard</ListItemText>
        </MenuItem>
      );
    }
    

    menuItems.push(
      <Divider key="logout-divider" />,
      <MenuItem key="logout" onClick={handleLogout}>
        <ListItemIcon>
          <LogoutIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Deconectare</ListItemText>
      </MenuItem>
    );
    
    return menuItems;
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
         
          <DirectionsCarIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            VrumVrum
          </Typography>

        
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {renderMobileMenu()}
            </Menu>
          </Box>

        
          <DirectionsCarIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            AutoMarket
          </Typography>

      
          <Box sx={{ 
            flexGrow: 1, 
            display: { xs: 'none', md: 'flex' }, 
            alignItems: 'center' 
          }}>
            {pages.map((page) => (
              <Button
                key={page.title}
                component={RouterLink}
                to={page.path}
                sx={{ 
                  my: 2, 
                  color: 'white', 
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {page.title}
              </Button>
            ))}
            
            {isAuthenticated && authenticatedPages.map((page) => (
              <Button
                key={page.title}
                component={RouterLink}
                to={page.path}
                sx={{ 
                  my: 2, 
                  color: 'white', 
                  height: '40px', 
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {page.title}
              </Button>
            ))}
            
          
            {isAuthenticated && user?.is_admin && (
              <Button
                component={RouterLink}
                to="/admin/dashboard"
                sx={{ 
                  my: 2, 
                  color: 'white', 
                  display: 'inline-flex',
                  height: '40px', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  px: 1.5, 
                  minWidth: 'auto', 
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.25)',
                  },
                  ml: 2,
                  borderRadius: 1 
                }}
                startIcon={<DashboardIcon />}
              >
                Admin
              </Button>
            )}
          </Box>

         
          <Box sx={{ flexGrow: 0 }}>
            {isAuthenticated ? (
              <>
                <Tooltip title="Deschide setări">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar 
                      alt={user?.username || 'User'} 
                      src={avatarUrl}
                      sx={{ 
                        width: 40, 
                        height: 40,
                        bgcolor: !avatarUrl ? 'primary.main' : undefined
                      }}
                    >
                      {!avatarUrl && (user?.username?.charAt(0).toUpperCase() || "U")}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  {renderUserMenu()}
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex' }}>
                <Button
                  component={RouterLink}
                  to="/login"
                  sx={{ color: 'white', mr: 1 }}
                >
                  Autentificare
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  sx={{ 
                    color: 'white', 
                    bgcolor: 'secondary.main',
                    '&:hover': {
                      bgcolor: 'secondary.dark',
                    } 
                  }}
                >
                  Înregistrare
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
