import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Pagination from '@mui/material/Pagination';
import placeholderCar from '../assets/images/placeholder-car.jpg';

const HomePage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    brand: '',
    model: '',
    condition_state: '',
    fuel_type: '',
    transmission: '',
    drive_type: '',
    year_of_manufacture_min: '',
    year_of_manufacture_max: '',
    price_min: '',
    price_max: '',
    mileage_max: '',
    power_min: '',
    power_max: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('-created_at');
  
  // State-uri pentru paginare
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    fetchListings();
  }, [filters, sortBy, page, pageSize]);

  const fetchListings = async () => {
    setLoading(true);
    
    try {
      // Construim obiectul de parametri pentru filtrare
      const params = {
        ordering: sortBy,
        search: searchQuery,
        page: page,
        page_size: pageSize, // Specificăm explicit dimensiunea paginii
      };
      
      // Adăugăm filtrele non-vide
      if (filters.brand) params.brand = filters.brand;
      if (filters.model) params.model__icontains = filters.model;
      if (filters.condition_state) params.condition_state = filters.condition_state;
      if (filters.fuel_type) params.fuel_type = filters.fuel_type;
      if (filters.transmission) params.transmission = filters.transmission;
      if (filters.drive_type) params.drive_type = filters.drive_type;
      if (filters.year_of_manufacture_min) params.year_of_manufacture__gte = filters.year_of_manufacture_min;
      if (filters.year_of_manufacture_max) params.year_of_manufacture__lte = filters.year_of_manufacture_max;
      if (filters.price_min) params.price__gte = filters.price_min;
      if (filters.price_max) params.price__lte = filters.price_max;
      if (filters.mileage_max) params.mileage__lte = filters.mileage_max;
      if (filters.power_min) params.power__gte = filters.power_min;
      if (filters.power_max) params.power__lte = filters.power_max;
      
      // Folosim fetch direct pentru a evita problemele cu interceptorii
      const queryParams = new URLSearchParams(params).toString();
      const response = await fetch(`http://localhost:8000/api/listings/cars/?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Eroare server: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Date primite de la API:", data);
      
      // Extragem datele în funcție de formatul răspunsului
      if (data.results && Array.isArray(data.results)) {
        // Format paginat de la DRF
        setListings(data.results);
        
        // Actualizăm informațiile despre paginare
        setTotalCount(data.count || 0);
        
        // Calculăm numărul total de pagini
        const totalPages = Math.ceil((data.count || 0) / pageSize);
        setTotalPages(totalPages);
      } else if (Array.isArray(data)) {
        // Array direct
        setListings(data);
        setTotalCount(data.length);
        setTotalPages(1);
      } else {
        console.error("Răspunsul nu conține un array de anunțuri:", data);
        setListings([]);
        setError("Format de date neașteptat de la server");
      }
    } catch (err) {
      console.error('Eroare la încărcarea anunțurilor:', err);
      setError('A apărut o eroare la încărcarea anunțurilor. Vă rugăm să încercați din nou.');
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    // Resetăm la pagina 1 când se schimbă filtrele
    setPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    // Resetăm la pagina 1 când se schimbă ordinea
    setPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Resetăm la pagina 1 când se face o nouă căutare
    setPage(1);
    fetchListings();
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearFilters = () => {
    setFilters({
      brand: '',
      model: '',
      condition_state: '',
      fuel_type: '',
      transmission: '',
      drive_type: '',
      year_of_manufacture_min: '',
      year_of_manufacture_max: '',
      price_min: '',
      price_max: '',
      mileage_max: '',
      power_min: '',
      power_max: ''
    });
    setSearchQuery('');
    // Resetăm la pagina 1 când se resetează filtrele
    setPage(1);
  };
  
  // Handler pentru schimbarea paginii
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    // Scroll la început pentru o mai bună experiență utilizator
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Handler pentru schimbarea dimensiunii paginii
  const handlePageSizeChange = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(1); // Resetăm la pagina 1 când se schimbă dimensiunea paginii
  };

  const brandOptions = [
    { value: 'Audi', label: 'Audi' },
    { value: 'BMW', label: 'BMW' },
    { value: 'Dacia', label: 'Dacia' },
    { value: 'Ford', label: 'Ford' },
    { value: 'Mercedes-Benz', label: 'Mercedes-Benz' },
    { value: 'Opel', label: 'Opel' },
    { value: 'Renault', label: 'Renault' },
    { value: 'Skoda', label: 'Skoda' },
    { value: 'Toyota', label: 'Toyota' },
    { value: 'Volkswagen', label: 'Volkswagen' },
    { value: 'Alfa Romeo', label: 'Alfa Romeo' },
    { value: 'Aston Martin', label: 'Aston Martin' },
    { value: 'Bentley', label: 'Bentley' },
    { value: 'Bugatti', label: 'Bugatti' },
    { value: 'Cadillac', label: 'Cadillac' },
    { value: 'Chevrolet', label: 'Chevrolet' },
    { value: 'Chrysler', label: 'Chrysler' },
    { value: 'Citroen', label: 'Citroen' },
    { value: 'Dodge', label: 'Dodge' },
    { value: 'Ferrari', label: 'Ferrari' },
    { value: 'Fiat', label: 'Fiat' },
    { value: 'Honda', label: 'Honda' },
    { value: 'Hyundai', label: 'Hyundai' },
    { value: 'Jaguar', label: 'Jaguar' },
    { value: 'Jeep', label: 'Jeep' },
    { value: 'Kia', label: 'Kia' },
    { value: 'Lamborghini', label: 'Lamborghini' },
    { value: 'Land Rover', label: 'Land Rover' },
    { value: 'Lexus', label: 'Lexus' },
    { value: 'Maserati', label: 'Maserati' },
    { value: 'Mazda', label: 'Mazda' },
    { value: 'McLaren', label: 'McLaren' },
    { value: 'MINI', label: 'MINI' },
    { value: 'Mitsubishi', label: 'Mitsubishi' },
    { value: 'Nissan', label: 'Nissan' },
    { value: 'Peugeot', label: 'Peugeot' },
    { value: 'Porsche', label: 'Porsche' },
    { value: 'Rolls-Royce', label: 'Rolls-Royce' },
    { value: 'Seat', label: 'Seat' },
    { value: 'Smart', label: 'Smart' },
    { value: 'Subaru', label: 'Subaru' },
    { value: 'Suzuki', label: 'Suzuki' },
    { value: 'Tesla', label: 'Tesla' },
    { value: 'Volvo', label: 'Volvo' }
  ];

  const conditionOptions = [
    { value: 'nou', label: 'Nou' },
    { value: 'utilizat', label: 'Utilizat' },
    { value: 'avariat', label: 'Avariat' },
  ];

  const fuelOptions = [
    { value: 'benzina', label: 'Benzină' },
    { value: 'diesel', label: 'Diesel' },
    { value: 'electric', label: 'Electric' },
    { value: 'hibrid_benzina', label: 'Hibrid Benzină' },
    { value: 'hibrid_diesel', label: 'Hibrid Diesel' },
    { value: 'GPL', label: 'GPL' },
    { value: 'altele', label: 'Altele' },
  ];

  const transmissionOptions = [
    { value: 'manuala', label: 'Manuală' },
    { value: 'automata', label: 'Automată' },
    { value: 'semi-automata', label: 'Semi-automată' },
  ];

  const driveTypeOptions = [
    { value: 'fata', label: 'Față' },
    { value: 'spate', label: 'Spate' },
    { value: '4x4', label: '4x4' },
  ];

  const sortOptions = [
    { value: '-created_at', label: 'Cele mai noi' },
    { value: 'price', label: 'Preț (crescător)' },
    { value: '-price', label: 'Preț (descrescător)' },
    { value: 'mileage', label: 'Kilometraj (crescător)' },
    { value: '-mileage', label: 'Kilometraj (descrescător)' },
    { value: '-year_of_manufacture', label: 'An fabricație (descrescător)' },
    { value: 'year_of_manufacture', label: 'An fabricație (crescător)' },
  ];
  
  const pageSizeOptions = [
    { value: 10, label: '10 pe pagină' },
    { value: 20, label: '20 pe pagină' },
    { value: 50, label: '50 pe pagină' },
    { value: 100, label: '100 pe pagină' },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Găsește-ți mașina visurilor
      </Typography>
      
      {/* Bara de căutare */}
      <Box component="form" onSubmit={handleSearch} sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Caută mașini"
              variant="outlined"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Marca, model..."
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel id="sort-by-label">Sortează după</InputLabel>
              <Select
                labelId="sort-by-label"
                id="sort-by"
                value={sortBy}
                label="Sortează după"
                onChange={handleSortChange}
              >
                {sortOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              fullWidth
              sx={{ height: '56px' }}
            >
              Caută
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      {/* Filtre avansate */}
      <Box sx={{ mb: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
        <Typography variant="h6" gutterBottom>
          Filtre avansate
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel id="brand-label">Marca</InputLabel>
              <Select
                labelId="brand-label"
                id="brand"
                name="brand"
                value={filters.brand}
                onChange={handleFilterChange}
                label="Marca"
              >
                <MenuItem value="">
                  <em>Toate mărcile</em>
                </MenuItem>
                {brandOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Model"
              variant="outlined"
              name="model"
              value={filters.model}
              onChange={handleFilterChange}
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel id="condition-label">Stare</InputLabel>
              <Select
                labelId="condition-label"
                id="condition_state"
                name="condition_state"
                value={filters.condition_state}
                onChange={handleFilterChange}
                label="Stare"
              >
                <MenuItem value="">
                  <em>Toate</em>
                </MenuItem>
                {conditionOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel id="fuel-label">Combustibil</InputLabel>
              <Select
                labelId="fuel-label"
                id="fuel_type"
                name="fuel_type"
                value={filters.fuel_type}
                onChange={handleFilterChange}
                label="Combustibil"
              >
                <MenuItem value="">
                  <em>Toate</em>
                </MenuItem>
                {fuelOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel id="transmission-label">Cutie de viteze</InputLabel>
              <Select
                labelId="transmission-label"
                id="transmission"
                name="transmission"
                value={filters.transmission}
                onChange={handleFilterChange}
                label="Cutie de viteze"
              >
                <MenuItem value="">
                  <em>Toate</em>
                </MenuItem>
                {transmissionOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel id="drive-type-label">Tracțiune</InputLabel>
              <Select
                labelId="drive-type-label"
                id="drive_type"
                name="drive_type"
                value={filters.drive_type}
                onChange={handleFilterChange}
                label="Tracțiune"
              >
                <MenuItem value="">
                  <em>Toate</em>
                </MenuItem>
                {driveTypeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="An fabricație (min)"
              variant="outlined"
              name="year_of_manufacture_min"
              type="number"
              value={filters.year_of_manufacture_min}
              onChange={handleFilterChange}
              size="small"
              InputProps={{ inputProps: { min: 1900, max: new Date().getFullYear() } }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="An fabricație (max)"
              variant="outlined"
              name="year_of_manufacture_max"
              type="number"
              value={filters.year_of_manufacture_max}
              onChange={handleFilterChange}
              size="small"
              InputProps={{ inputProps: { min: 1900, max: new Date().getFullYear() } }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Preț minim (€)"
              variant="outlined"
              name="price_min"
              type="number"
              value={filters.price_min}
              onChange={handleFilterChange}
              size="small"
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Preț maxim (€)"
              variant="outlined"
              name="price_max"
              type="number"
              value={filters.price_max}
              onChange={handleFilterChange}
              size="small"
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Kilometraj maxim"
              variant="outlined"
              name="mileage_max"
              type="number"
              value={filters.mileage_max}
              onChange={handleFilterChange}
              size="small"
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Grid>
          
          {/* Adăugăm filtrele pentru putere */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Putere minimă (CP)"
              variant="outlined"
              name="power_min"
              type="number"
              value={filters.power_min}
              onChange={handleFilterChange}
              size="small"
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Putere maximă (CP)"
              variant="outlined"
              name="power_max"
              type="number"
              value={filters.power_max}
              onChange={handleFilterChange}
              size="small"
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel id="page-size-label">Rezultate pe pagină</InputLabel>
              <Select
                labelId="page-size-label"
                id="page_size"
                value={pageSize}
                label="Rezultate pe pagină"
                onChange={handlePageSizeChange}
              >
                {pageSizeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="outlined" 
              color="secondary" 
              fullWidth 
              onClick={clearFilters}
              sx={{ height: '40px' }}
            >
              Resetează filtrele
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      {/* Filtrele active */}
      {Object.entries(filters).some(([_, value]) => value !== '') && (
        <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="subtitle1" sx={{ mr: 1 }}>
            Filtre active:
          </Typography>
          
          {filters.brand && (
            <Chip 
              label={`Marca: ${filters.brand}`} 
              onDelete={() => setFilters({ ...filters, brand: '' })} 
              color="primary" 
              variant="outlined"
            />
          )}
          
          {filters.model && (
            <Chip 
              label={`Model: ${filters.model}`} 
              onDelete={() => setFilters({ ...filters, model: '' })} 
              color="primary" 
              variant="outlined"
            />
          )}
          
          {filters.condition_state && (
            <Chip 
              label={`Stare: ${conditionOptions.find(opt => opt.value === filters.condition_state)?.label}`} 
              onDelete={() => setFilters({ ...filters, condition_state: '' })} 
              color="primary" 
              variant="outlined"
            />
          )}
          
          {filters.fuel_type && (
            <Chip 
              label={`Combustibil: ${fuelOptions.find(opt => opt.value === filters.fuel_type)?.label}`} 
              onDelete={() => setFilters({ ...filters, fuel_type: '' })} 
              color="primary" 
              variant="outlined"
            />
          )}
          
          {filters.transmission && (
            <Chip 
              label={`Cutie: ${transmissionOptions.find(opt => opt.value === filters.transmission)?.label}`} 
              onDelete={() => setFilters({ ...filters, transmission: '' })} 
              color="primary" 
              variant="outlined"
            />
          )}
          
          {filters.drive_type && (
            <Chip 
              label={`Tracțiune: ${driveTypeOptions.find(opt => opt.value === filters.drive_type)?.label}`} 
              onDelete={() => setFilters({ ...filters, drive_type: '' })} 
              color="primary" 
              variant="outlined"
            />
          )}
          
          {filters.year_of_manufacture_min && (
            <Chip 
              label={`An min: ${filters.year_of_manufacture_min}`} 
              onDelete={() => setFilters({ ...filters, year_of_manufacture_min: '' })} 
              color="primary" 
              variant="outlined"
            />
          )}
          
          {filters.year_of_manufacture_max && (
            <Chip 
              label={`An max: ${filters.year_of_manufacture_max}`} 
              onDelete={() => setFilters({ ...filters, year_of_manufacture_max: '' })} 
              color="primary" 
              variant="outlined"
            />
          )}
          
          {filters.price_min && (
            <Chip 
              label={`Preț min: ${filters.price_min}€`} 
              onDelete={() => setFilters({ ...filters, price_min: '' })} 
              color="primary" 
              variant="outlined"
            />
          )}
          
          {filters.price_max && (
            <Chip 
              label={`Preț max: ${filters.price_max}€`} 
              onDelete={() => setFilters({ ...filters, price_max: '' })} 
              color="primary" 
              variant="outlined"
            />
          )}
          
          {filters.mileage_max && (
            <Chip 
              label={`Km max: ${filters.mileage_max}`} 
              onDelete={() => setFilters({ ...filters, mileage_max: '' })} 
              color="primary" 
              variant="outlined"
            />
          )}
          
          {filters.power_min && (
            <Chip 
              label={`Putere min: ${filters.power_min} CP`} 
              onDelete={() => setFilters({ ...filters, power_min: '' })} 
              color="primary" 
              variant="outlined"
            />
          )}
          
          {filters.power_max && (
            <Chip 
              label={`Putere max: ${filters.power_max} CP`} 
              onDelete={() => setFilters({ ...filters, power_max: '' })} 
              color="primary" 
              variant="outlined"
            />
          )}
        </Box>
      )}
      
      {/* Rezultatele căutării */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ my: 4 }}>{error}</Typography>
      ) : listings.length === 0 ? (
        <Typography sx={{ my: 4 }}>Nu a fost găsit niciun anunț care să corespundă criteriilor de căutare.</Typography>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              {totalCount} anunțuri găsite
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ mr: 2 }}>
                Afișare {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, totalCount)} din {totalCount}
              </Typography>
            </Box>
          </Box>
          

          <Grid container spacing={3}>
            {listings.map((listing) => (
              <Grid item key={listing.id} xs={12} sm={6} md={4}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardActionArea component={RouterLink} to={`/listings/${listing.id}`}>
                    <CardMedia
                      component="img"
                      height="220"  // Mărirea înălțimii imaginii de la 160 la 220
                      image={listing.images && listing.images.length > 0 
                        ? listing.images.find(img => img.is_main)?.image_path || listing.images[0].image_path 
                        : placeholderCar
                      }
                      alt={`${listing.brand} ${listing.model}`}
                    />
                    <CardContent sx={{ p: 2, pt: 1.5, pb: 1.5 }}>  
                      <Typography gutterBottom variant="h6" component="div" noWrap sx={{ mb: 0.5 }}>
                        {listing.title}
                      </Typography>
                      
                      {/* Informații condensate pe două rânduri în loc de trei */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          {listing.brand} {listing.model}, {listing.year_of_manufacture}
                        </Typography>
                        <Typography variant="h6" color="primary.main">
                          {typeof listing.price === 'number' 
                          ? Math.round(listing.price).toLocaleString('ro-RO') 
                          : listing.price} €
                        </Typography>
                      </Box>
                      
                      {/* A doua linie de informații - doar cele esențiale */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                        <Box sx={{ display: 'flex' }}>
                          <Typography variant="body2" color="text.secondary">
                            {typeof listing.mileage === 'number' ? listing.mileage.toLocaleString() : listing.mileage} km
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mx: 1 }}>•</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {fuelOptions.find(opt => opt.value === listing.fuel_type)?.label || listing.fuel_type}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>

          
          {/* Paginare */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default HomePage;