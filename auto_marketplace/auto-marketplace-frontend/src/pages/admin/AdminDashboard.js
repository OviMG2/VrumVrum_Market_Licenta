import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';


import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Button,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Tooltip,
  Chip,
  Badge,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';


import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import EventIcon from '@mui/icons-material/Event';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import BrandingWatermarkIcon from '@mui/icons-material/BrandingWatermark';


import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';


const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [statsType, setStatsType] = useState('fuel'); 
  
  const baseURL = 'http://localhost:8000';
  

  useEffect(() => {
    if (user && !user.is_admin) {
      navigate('/');
    }
  }, [user, navigate]);
  
 
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Token de autentificare lipsă');
        }
        
       
        const statsResponse = await axios.get(`${baseURL}/api/admin/dashboard/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        setStats(statsResponse.data);
        
        
        const usersResponse = await axios.get(`${baseURL}/api/admin/users/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        setUsers(usersResponse.data);
        setFilteredUsers(usersResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Eroare la încărcarea datelor de dashboard:', err);
        setError('Nu am putut încărca datele. Verificați conexiunea și permisiunile.');
        setLoading(false);
      }
    };
    
    if (user && user.is_admin) {
      fetchDashboardData();
    }
  }, [user]);
  
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const lowerCaseSearch = searchTerm.toLowerCase();
      const filtered = users.filter(user => 
        user.username.toLowerCase().includes(lowerCaseSearch) ||
        (user.email && user.email.toLowerCase().includes(lowerCaseSearch)) ||
        (user.real_name && user.real_name.toLowerCase().includes(lowerCaseSearch))
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);
  
 
  const refreshData = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token de autentificare lipsă');
      }
      
      
      const statsResponse = await axios.get(`${baseURL}/api/admin/dashboard/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setStats(statsResponse.data);
      
      
      const usersResponse = await axios.get(`${baseURL}/api/admin/users/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setUsers(usersResponse.data);
      setFilteredUsers(usersResponse.data);
      
      setRefreshing(false);
      setError(null);
    } catch (err) {
      console.error('Eroare la reîmprospătarea datelor:', err);
      setError('Nu am putut reîmprospăta datele. Verificați conexiunea și permisiunile.');
      setRefreshing(false);
    }
  };
  
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Data invalidă';
      
      return new Intl.DateTimeFormat('ro-RO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      return 'Data invalidă';
    }
  };
  
 
  const handleViewUser = (userId) => {
    navigate(`/user/${userId}`);
  };
  
 
  const handleEditUser = (userId) => {
    navigate(`/admin/users/edit/${userId}`);
  };
  

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token de autentificare lipsă');
      }
      
      
      if (user && userId === user.id) {
        setError('Nu puteți dezactiva propriul cont.');
        return;
      }
      
      await axios.patch(`${baseURL}/api/users/admin/users/${userId}/toggle-active/`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      
      setUsers(users.map(u => {
        if (u.id === userId) {
          return { ...u, is_active: !currentStatus };
        }
        return u;
      }));
      
     
      setFilteredUsers(filteredUsers.map(u => {
        if (u.id === userId) {
          return { ...u, is_active: !currentStatus };
        }
        return u;
      }));
    } catch (err) {
      console.error('Eroare la schimbarea statutului activ:', err);
      setError('Nu am putut schimba statutul activ. Încercați din nou.');
    }
  };
  
 
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  
  const handleStatsTypeChange = (event, newValue) => {
    if (newValue !== null) {
      setStatsType(newValue);
    }
  };

 
  const getChartData = () => {
    if (!stats?.listings) return [];
    
    switch (statsType) {
      case 'fuel':
        return stats.listings.by_fuel || [];
      case 'brand':
        return stats.listings.by_brand || [];
      default:
        return [];
    }
  };


  const getDataKey = () => {
    switch (statsType) {
      case 'fuel':
        return 'fuel_type';
      case 'brand':
        return 'brand';
      default:
        return '';
    }
  };

 
  const getChartTitle = () => {
    switch (statsType) {
      case 'fuel':
        return 'Statistici anunțuri după tip combustibil';
      case 'brand':
        return 'Statistici anunțuri după marcă';
      default:
        return 'Statistici anunțuri';
    }
  };
  
 
  if (user && !user.is_admin) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">
          Nu aveți permisiunea de a accesa această pagină.
        </Alert>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/')}>
          Înapoi la pagina principală
        </Button>
      </Container>
    );
  }
  
 
  if (loading) {
    return (
      <Container sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <CircularProgress />
      </Container>
    );
  }
  
 
  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={refreshData} startIcon={<RefreshIcon />}>
          Încearcă din nou
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Dashboard Administrator
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          onClick={refreshData} 
          startIcon={<RefreshIcon />}
          disabled={refreshing}
        >
          {refreshing ? 'Se reîmprospătează...' : 'Reîmprospătează datele'}
        </Button>
      </Box>
      
   
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <PeopleAltIcon />
                </Avatar>
                <Typography variant="h6">Utilizatori</Typography>
              </Box>
              
              <Typography variant="h3" align="center" sx={{ my: 2 }}>
                {stats?.users?.total || 0}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Chip 
                  icon={<CheckCircleIcon />} 
                  label={`${stats?.users?.active || 0} activi`} 
                  color="success" 
                  size="small"
                />
                <Chip 
                  icon={<AdminPanelSettingsIcon />} 
                  label={`${stats?.users?.admins || 0} admini`} 
                  color="primary" 
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <DirectionsCarIcon />
                </Avatar>
                <Typography variant="h6">Anunțuri auto</Typography>
              </Box>
              
              <Typography variant="h3" align="center" sx={{ my: 2 }}>
                {stats?.listings?.total || 0}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Chip 
                  icon={<EventIcon />} 
                  label={`${stats?.listings?.recent || 0} noi săpt. aceasta`} 
                  color="info" 
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <PersonIcon />
                </Avatar>
                <Typography variant="h6">Utilizatori noi</Typography>
              </Box>
              
              <Typography variant="h3" align="center" sx={{ my: 2 }}>
                {stats?.users?.new_last_week || 0}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" align="center">
                în ultima săptămână
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <VisibilityIcon />
                </Avatar>
                <Typography variant="h6">Utilizatori activi</Typography>
              </Box>
              
              <Typography variant="h3" align="center" sx={{ my: 2 }}>
                {stats?.users?.active_last_week || 0}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" align="center">
                în ultima săptămână
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Grafice statistici */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Anunțuri după Marcă
            </Typography>
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={stats?.listings?.by_brand || []}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="brand" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="count" fill="#8884d8" name="Număr anunțuri">
                  {
                    (stats?.listings?.by_brand || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Anunțuri după Categorie de Preț (EUR)
            </Typography>
            
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats?.listings?.by_price || []}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="range"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {
                    (stats?.listings?.by_price || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))
                  }
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Taburi pentru gestionarea utilizatorilor și anunțurilor */}
      <Paper sx={{ p: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          sx={{ mb: 3 }}
        >
          <Tab label="Gestionare Utilizatori" />
          <Tab label="Statistici Anunțuri" />
        </Tabs>
        
        {activeTab === 0 && (
          <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Lista Utilizatori
              </Typography>
              
              <TextField
                placeholder="Caută utilizator..."
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: 300 }}
              />
            </Box>
            
            <List>
              {filteredUsers.map((u) => (
                <React.Fragment key={u.id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                          u.is_online ? (
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                bgcolor: 'success.main',
                                border: '2px solid white',
                              }}
                            />
                          ) : null
                        }
                      >
                        <Avatar src={u.profile_image ? `${baseURL}${u.profile_image}` : null}>
                            {u.username?.charAt(0).toUpperCase() || "U"}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {u.username}
                          {u.is_admin && (
                            <Chip
                              label="Admin"
                              size="small"
                              color="primary"
                              sx={{ ml: 1 }}
                            />
                          )}
                          {!u.is_active && (
                            <Chip
                              label="Blocat"
                              size="small"
                              color="error"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" component="span">
                            {u.email} | {u.real_name || 'Nume necunoscut'}
                          </Typography>
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            Înregistrat: {formatDate(u.created_at)} | 
                            Ultima activitate: {formatDate(u.last_activity)}
                          </Typography>
                        </>
                      }
                    />
                    
                    <ListItemSecondaryAction>
                      <Tooltip title="Vezi profil">
                        <IconButton edge="end" onClick={() => handleViewUser(u.id)}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Editează">
                        <IconButton edge="end" onClick={() => handleEditUser(u.id)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title={u.is_active ? "Blochează" : "Deblochează"}>
                        <span>
                            <IconButton 
                            edge="end" 
                            color={u.is_active ? "error" : "success"}
                            onClick={() => handleToggleActive(u.id, u.is_active)}
                            disabled={user && u.id === user.id} // Nu permitem blocarea propriului cont
                            >
                            <BlockIcon />
                            </IconButton>
                        </span>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
              
              {filteredUsers.length === 0 && (
                <Box sx={{ py: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    Nu s-au găsit utilizatori corespunzători termenului căutat.
                  </Typography>
                </Box>
              )}
            </List>
          </Box>
        )}
        
        {activeTab === 1 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {getChartTitle()}
              </Typography>
              
              <ToggleButtonGroup
                value={statsType}
                exclusive
                onChange={handleStatsTypeChange}
                aria-label="tip statistici"
                size="small"
              >
                <ToggleButton value="fuel" aria-label="tip combustibil">
                  <Tooltip title="După tip combustibil">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocalGasStationIcon sx={{ mr: 1 }} />
                      <Typography variant="body2">Combustibil</Typography>
                    </Box>
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="brand" aria-label="marcă">
                  <Tooltip title="După marcă">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <BrandingWatermarkIcon sx={{ mr: 1 }} />
                      <Typography variant="body2">Marcă</Typography>
                    </Box>
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
            
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={getChartData()}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={getDataKey()} />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="count" fill="#82ca9d" name="Număr anunțuri">
                  {
                    getChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => navigate('/')}
              >
                Vezi toate anunțurile
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default AdminDashboard;
