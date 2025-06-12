import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listingsAPI } from '../services/api';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Container from '@mui/material/Container';
import { useAuth } from '../context/AuthContext';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';


import {
  brandOptions,
  conditionOptions,
  fuelOptions,
  transmissionOptions,
  driveTypeOptions,
  emissionOptions,
  colorOptions,
  bodyTypeOptions
} from '../utils/options'; 


const validationSchema = Yup.object({
  title: Yup.string()
    .min(5, 'Titlul trebuie să aibă minim 5 caractere')
    .max(100, 'Titlul trebuie să aibă maxim 100 de caractere')
    .required('Titlul este obligatoriu'),
  brand: Yup.string().required('Marca este obligatorie'),
  model: Yup.string().required('Modelul este obligatoriu'),
  year_of_manufacture: Yup.number()
    .min(1950, 'Anul trebuie să fie după 1950')
    .max(new Date().getFullYear(), `Anul trebuie să fie maxim ${new Date().getFullYear()}`)
    .required('Anul fabricației este obligatoriu'),
  mileage: Yup.number()
    .min(0, 'Kilometrajul nu poate fi negativ')
    .required('Kilometrajul este obligatoriu'),
  price: Yup.number()
    .min(1, 'Prețul trebuie să fie pozitiv')
    .required('Prețul este obligatoriu'),
  power: Yup.number()
    .min(1, 'Puterea trebuie să fie pozitivă')
    .required('Puterea este obligatorie'),
  engine_capacity: Yup.number()
    .min(0, 'Capacitatea motorului trebuie să fie pozitivă, sau 0 pentru motor electric')
    .required('Capacitatea motorului este obligatorie'),
  color: Yup.string().required('Culoarea este obligatorie'),
  condition_state: Yup.string().required('Starea este obligatorie'),
  fuel_type: Yup.string().required('Tipul de combustibil este obligatoriu'),
  transmission: Yup.string().required('Cutia de viteze este obligatorie'),
  drive_type: Yup.string().required('Tracțiunea este obligatorie'),
  emission_standard: Yup.string().required('Norma de poluare este obligatorie'),
  description: Yup.string(), 
  features: Yup.array().of(
    Yup.object().shape({
      feature_name: Yup.string().notRequired('Numele dotării este obligatoriu'),
      feature_value: Yup.string(),
    })
  ),
  body_type: Yup.string(),
  right_hand_drive: Yup.boolean().default(false),
  co2_emissions: Yup.number().positive('Valoarea trebuie să fie pozitivă').nullable(),
  seats: Yup.number().positive('Valoarea trebuie să fie pozitivă').nullable(),
  doors: Yup.number().positive('Valoarea trebuie să fie pozitivă').nullable(),
  registered: Yup.boolean().default(false),
  location: Yup.string(),
});


const steps = ['Informații de bază', 'Detalii tehnice', 'Imagini și descriere', 'Finalizare'];

const EditListingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [listing, setListing] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(false);

  
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        setLoading(true);
        const fetchedListing = await listingsAPI.getListing(id);
        
        
        if (user && (user.id === fetchedListing.user.id || user.is_admin)) {
          setIsAuthorized(true);
          setListing(fetchedListing);
          
          
          if (fetchedListing.images && fetchedListing.images.length > 0) {
            setExistingImages(fetchedListing.images);
          }
        } else {
          setError('Nu aveți permisiunea să editați acest anunț.');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Eroare la încărcarea anunțului:', err);
        setError('Nu am putut încărca anunțul. Vă rugăm să încercați din nou.');
        setLoading(false);
      }
    };
    
    if (user) {
      checkPermissions();
    }
  }, [id, user]);

  
  const formik = useFormik({
    initialValues: {
      title: '',
      brand: '',
      model: '',
      year_of_manufacture: new Date().getFullYear(),
      mileage: '',
      price: '',
      power: '',
      engine_capacity: '',
      color: '',
      condition_state: '',
      fuel_type: '',
      transmission: '',
      drive_type: '',
      emission_standard: '',
      description: '',
      features: [{ feature_name: '', feature_value: '' }],
      images: [],
      body_type: '',
      right_hand_drive: false,
      co2_emissions: '',
      seats: '',
      doors: '',
      registered: false,
      location: '',
    },
    validationSchema,
    enableReinitialize: true, 
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);
      
      try {
        
        const formData = new FormData();
        console.log("Valorile formularului înainte de trimitere:", values);
        console.log("Features înainte de filtrare:", values.features);
        
      
        for (const key in values) {
          if (key === 'images') {
            
            values.images.forEach((image) => {
              formData.append('new_images', image);
            });
          } 
          else if (key === 'features') {
            
          const filteredFeatures = values.features
          .filter(f => f.feature_name && f.feature_name.trim() !== '')
          .map(f => ({
            feature_name: f.feature_name.trim(),
            feature_value: f.feature_value ? f.feature_value.trim() : ''
          }));

        console.log('Features filtrate ce vor fi trimise:', filteredFeatures);

        if (filteredFeatures.length > 0) {
          const featuresJson = JSON.stringify(filteredFeatures);
          console.log("Features JSON serializat:", featuresJson);
          formData.append('features', featuresJson);
        }
          } else {
            formData.append(key, values[key]);
          }
        }
        
        
        if (imagesToDelete.length > 0) {
          formData.append('images_to_delete', JSON.stringify(imagesToDelete));
        }
        
      
        await listingsAPI.updateListing(id, formData);
        
        
        navigate(`/listings/${id}`);
      } catch (err) {
        console.error('Eroare la actualizarea anunțului:', err);
        
        
        if (err.detail) {
          setError(err.detail);
        } else if (err.message) {
          setError(err.message);
        } else if (typeof err === 'object' && err !== null) {
        
          const errorMessages = Object.entries(err)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
          setError(errorMessages || 'Eroare necunoscută');
        } else {
          setError('A apărut o eroare la actualizarea anunțului. Vă rugăm să încercați din nou.');
        }
      } finally {
        setLoading(false);
      }
    },
  });

  
  useEffect(() => {
    if (listing) {
      console.log("Features primite de la API:", listing.features);
      const formValues = {
        title: listing.title || '',
        brand: listing.brand || '',
        model: listing.model || '',
        year_of_manufacture: listing.year_of_manufacture || new Date().getFullYear(),
        mileage: listing.mileage || '',
        price: listing.price || '',
        power: listing.power || '',
        engine_capacity: listing.engine_capacity || '',
        color: listing.color || '',
        condition_state: listing.condition_state || '',
        fuel_type: listing.fuel_type || '',
        transmission: listing.transmission || '',
        drive_type: listing.drive_type || '',
        emission_standard: listing.emission_standard || '',
        description: listing.description || '',
        features: listing.features && listing.features.length > 0 
          ? listing.features.map(f => ({ 
              feature_name: f.feature_name || '', 
              feature_value: f.feature_value || '' 
            }))
          : [{ feature_name: '', feature_value: '' }],
        images: [],
        body_type: listing.body_type || '',  
        right_hand_drive: listing.right_hand_drive ?? false,
        co2_emissions: listing.co2_emissions ?? '',
        seats: listing.seats ?? '',
        doors: listing.doors ?? '',
        registered: listing.registered ?? false,
        location: listing.location || '',
      };
      
      formik.setValues(formValues);
    }
  }, [listing]);

  
  const handleNext = () => {
    
    const fieldsToValidate = activeStep === 0
      ? ['title', 'brand', 'model', 'year_of_manufacture', 'price', 'condition_state', 'color']
      : activeStep === 1
      ? ['mileage', 'power', 'engine_capacity', 'fuel_type', 'transmission', 'drive_type', 'emission_standard']
      : activeStep === 2
      ? ['description']
      : [];
    
    
    const stepHasErrors = fieldsToValidate.some(field => 
      formik.touched[field] && formik.errors[field]
    );
    
    
    fieldsToValidate.forEach(field => {
      formik.setFieldTouched(field, true);
    });
    
   
    if (!stepHasErrors) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };


  const addFeature = () => {
    formik.setFieldValue('features', [
      ...formik.values.features,
      { feature_name: '', feature_value: '' }
    ]);
  };

  const removeFeature = (index) => {
    const updatedFeatures = [...formik.values.features];
    updatedFeatures.splice(index, 1);
    formik.setFieldValue('features', updatedFeatures);
  };

  
  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    
    
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`Fișierul "${file.name}" nu este o imagine.`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`Fișierul "${file.name}" depășește limita de 5MB.`);
        return false;
      }
      return true;
    });
    

    const newImages = [...formik.values.images, ...validFiles];
    
    
    if (newImages.length + existingImages.length - imagesToDelete.length > 10) {
      alert('Puteți încărca maxim 10 imagini în total.');
      return;
    }
    
    formik.setFieldValue('images', newImages);
    
 
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setPreviewImages([...previewImages, ...newPreviews]);
  };

  
  const removeNewImage = (index) => {
    const updatedImages = [...formik.values.images];
    updatedImages.splice(index, 1);
    formik.setFieldValue('images', updatedImages);
    
    const updatedPreviews = [...previewImages];
    URL.revokeObjectURL(updatedPreviews[index]); 
    updatedPreviews.splice(index, 1);
    setPreviewImages(updatedPreviews);
  };

  
  const removeExistingImage = (index) => {
    const imageToDelete = existingImages[index];
    setImagesToDelete([...imagesToDelete, imageToDelete.id]);
    
    const updatedExistingImages = [...existingImages];
    updatedExistingImages.splice(index, 1);
    setExistingImages(updatedExistingImages);
  };

  
  if (loading && !listing) {
    return (
      <Container sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  
  if (!isAuthorized && !loading) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || "Nu aveți permisiunea să editați acest anunț."}
        </Alert>
        <Button 
          variant="contained"

          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/listings/${id}`)}
        >
          Înapoi la anunț
        </Button>
      </Container>
    );
  }

 
  if (error && !listing) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/my-listings')}>
          Înapoi la anunțurile mele
        </Button>
      </Container>
    );
  }

  
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="title"
                name="title"
                label="Titlu anunț"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={formik.touched.brand && Boolean(formik.errors.brand)}>
                <InputLabel id="brand-label">Marca *</InputLabel>
                <Select
                  labelId="brand-label"
                  id="brand"
                  name="brand"
                  value={formik.values.brand}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Marca *"
                >
                  {brandOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.brand && formik.errors.brand && (
                  <FormHelperText>{formik.errors.brand}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={formik.touched.body_type && Boolean(formik.errors.body_type)}>
                <InputLabel id="body-type-label">Tip caroserie</InputLabel>
                <Select
                  labelId="body-type-label"
                  id="body_type"
                  name="body_type"
                  value={formik.values.body_type || ''}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Tip caroserie"
                >
                  {bodyTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="location"
                name="location"
                label="Localitate"
                value={formik.values.location}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.location && Boolean(formik.errors.location)}
                helperText={formik.touched.location && formik.errors.location}
                placeholder="Ex: București, Cluj-Napoca"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="model"
                name="model"
                label="Model"
                value={formik.values.model}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.model && Boolean(formik.errors.model)}
                helperText={formik.touched.model && formik.errors.model}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="year_of_manufacture"
                name="year_of_manufacture"
                label="An fabricație"
                type="number"
                value={formik.values.year_of_manufacture}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.year_of_manufacture && Boolean(formik.errors.year_of_manufacture)}
                helperText={formik.touched.year_of_manufacture && formik.errors.year_of_manufacture}
                required
                InputProps={{ 
                  inputProps: { 
                    min: 1950, 
                    max: new Date().getFullYear() 
                  } 
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="price"
                name="price"
                label="Preț (€)"
                type="number"
                value={formik.values.price}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.price && Boolean(formik.errors.price)}
                helperText={formik.touched.price && formik.errors.price}
                required
                InputProps={{ 
                  inputProps: { min: 1 }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={formik.touched.condition_state && Boolean(formik.errors.condition_state)}>
                <InputLabel id="condition-label">Stare *</InputLabel>
                <Select
                  labelId="condition-label"
                  id="condition_state"
                  name="condition_state"
                  value={formik.values.condition_state}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Stare *"
                >
                  {conditionOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.condition_state && formik.errors.condition_state && (
                  <FormHelperText>{formik.errors.condition_state}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={formik.touched.color && Boolean(formik.errors.color)}>
                <InputLabel id="color-label">Culoare *</InputLabel>
                <Select
                  labelId="color-label"
                  id="color"
                  name="color"
                  value={formik.values.color}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Culoare *"
                >
                  {colorOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.color && formik.errors.color && (
                  <FormHelperText>{formik.errors.color}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="mileage"
                name="mileage"
                label="Kilometraj"
                type="number"
                value={formik.values.mileage}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.mileage && Boolean(formik.errors.mileage)}
                helperText={formik.touched.mileage && formik.errors.mileage}
                required
                InputProps={{ 
                  inputProps: { min: 0 }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="power"
                name="power"
                label="Putere (CP)"
                type="number"
                value={formik.values.power}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.power && Boolean(formik.errors.power)}
                helperText={formik.touched.power && formik.errors.power}
                required
                InputProps={{ 
                  inputProps: { min: 1 }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="engine_capacity"
                name="engine_capacity"
                label="Capacitate cilindrică (cm³) / baterie (kWh)"
                type="number"
                value={formik.values.engine_capacity}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.engine_capacity && Boolean(formik.errors.engine_capacity)}
                helperText={formik.touched.engine_capacity && formik.errors.engine_capacity}
                required
                InputProps={{ 
                  inputProps: { min: 1 }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={formik.touched.fuel_type && Boolean(formik.errors.fuel_type)}>
                <InputLabel id="fuel-type-label">Combustibil *</InputLabel>
                <Select
                  labelId="fuel-type-label"
                  id="fuel_type"
                  name="fuel_type"
                  value={formik.values.fuel_type}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Combustibil *"
                >
                  {fuelOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.fuel_type && formik.errors.fuel_type && (
                  <FormHelperText>{formik.errors.fuel_type}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="co2_emissions"
                name="co2_emissions"
                label="Emisii CO2 (g/km)"
                type="number"
                value={formik.values.co2_emissions ?? ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.co2_emissions && Boolean(formik.errors.co2_emissions)}
                helperText={formik.touched.co2_emissions && formik.errors.co2_emissions}
                InputProps={{ 
                  inputProps: { min: 0 }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                id="seats"
                name="seats"
                label="Număr locuri"
                type="number"
                value={formik.values.seats}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.seats && Boolean(formik.errors.seats)}
                helperText={formik.touched.seats && formik.errors.seats}
                InputProps={{ 
                  inputProps: { min: 1, max: 9 }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                id="doors"
                name="doors"
                label="Număr uși"
                type="number"
                value={formik.values.doors}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.doors && Boolean(formik.errors.doors)}
                helperText={formik.touched.doors && formik.errors.doors}
                InputProps={{ 
                  inputProps: { min: 2, max: 5 }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="right_hand_drive"
                    checked={formik.values.right_hand_drive === true}
                    onChange={formik.handleChange}
                  />
                }
                label="Volan pe dreapta"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="registered"
                    checked={formik.values.registered === true}
                    onChange={formik.handleChange}
                  />
                }
                label="Înmatriculat în România"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={formik.touched.transmission && Boolean(formik.errors.transmission)}>
                <InputLabel id="transmission-label">Cutie de viteze *</InputLabel>
                <Select
                  labelId="transmission-label"
                  id="transmission"
                  name="transmission"
                  value={formik.values.transmission}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Cutie de viteze *"
                >
                  {transmissionOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.transmission && formik.errors.transmission && (
                  <FormHelperText>{formik.errors.transmission}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={formik.touched.drive_type && Boolean(formik.errors.drive_type)}>
                <InputLabel id="drive-type-label">Tracțiune *</InputLabel>
                <Select
                  labelId="drive-type-label"
                  id="drive_type"
                  name="drive_type"
                  value={formik.values.drive_type}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Tracțiune *"
                >
                  {driveTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.drive_type && formik.errors.drive_type && (
                  <FormHelperText>{formik.errors.drive_type}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={formik.touched.emission_standard && Boolean(formik.errors.emission_standard)}>
                <InputLabel id="emission-standard-label">Normă de poluare *</InputLabel>
                <Select
                  labelId="emission-standard-label"
                  id="emission_standard"
                  name="emission_standard"
                  value={formik.values.emission_standard}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Normă de poluare *"
                >
                  {emissionOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.emission_standard && formik.errors.emission_standard && (
                  <FormHelperText>{formik.errors.emission_standard}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Divider>
                <Chip label="Dotări și echipamente" />
              </Divider>
            </Grid>
            
            {formik.values.features.map((feature, index) => (
              <Grid item xs={12} key={index} container spacing={2} alignItems="center">
                <Grid item xs={5}>
                  <TextField
                    fullWidth
                    name={`features[${index}].feature_name`}
                    label="Nume dotare"
                    value={feature.feature_name}
                    onChange={formik.handleChange}
                    placeholder="Ex: Aer condiționat, GPS, etc."
                  />
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    fullWidth
                    name={`features[${index}].feature_value`}
                    label="Valoare/Detalii (opțional)"
                    value={feature.feature_value}
                    onChange={formik.handleChange}
                    placeholder="Ex: Automat, Bose, etc."
                  />
                </Grid>
                <Grid item xs={2}>
                  <IconButton 
                    color="error" 
                    onClick={() => removeFeature(index)}
                    disabled={formik.values.features.length <= 1}
                  >
                    <RemoveIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
            
            <Grid item xs={12}>
              <Button 
                startIcon={<AddIcon />}
                onClick={addFeature}
                variant="outlined"
              >
                Adaugă dotare
              </Button>
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Imagini existente
              </Typography>
              
              {existingImages.length > 0 ? (
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  {existingImages
                    .filter(img => !imagesToDelete.includes(img.id))
                    .map((image, index) => (
                    <Grid item xs={6} sm={4} md={3} key={`existing-${index}`}>
                      <Box
                        sx={{
                          position: 'relative',
                          height: 150,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          overflow: 'hidden',
                        }}
                      >
                        <img
                          src={image.image_path}
                          alt={`Imagine ${index}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                        {image.is_main && (
                          <Chip
                            label="Principal"
                            color="primary"
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 5,
                              left: 5,
                            }}
                          />
                        )}
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 5,
                            right: 5,
                            bgcolor: 'background.paper',
                          }}
                          onClick={() => removeExistingImage(index)}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Nu există imagini pentru acest anunț.
                </Typography>
              )}
              
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Adaugă imagini noi
              </Typography>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Puteți adăuga noi imagini ale mașinii dumneavoastră. 
                Numărul total de imagini (existente + noi) nu poate depăși 10.
              </Typography>
              
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 1,
                  textAlign: 'center',
                }}
              >
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload"
                  type="file"
                  multiple
                  onChange={handleImageChange}
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={<UploadFileIcon />}
                  >
                    Selectează imagini noi
                  </Button>
                </label>
                
                {previewImages.length > 0 && (
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    {previewImages.map((preview, index) => (
                      <Grid item xs={6} sm={4} md={3} key={`new-${index}`}>
                        <Box
                          sx={{
                            position: 'relative',
                            height: 150,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            overflow: 'hidden',
                          }}
                        >
                          <img
                            src={preview}
                            alt={`Preview ${index}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                          <Chip
                            label="Nouă"
                            color="secondary"
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 5,
                              left: 5,
                            }}
                          />
                          <IconButton
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 5,
                              right: 5,
                              bgcolor: 'background.paper',
                            }}
                            onClick={() => removeNewImage(index)}
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Descriere
              </Typography>
              
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Descriere detaliată"
                multiline
                minRows={6}
                maxRows={30}  // Adăugăm maxRows pentru a limita înălțimea maximă, dar a permite creștere
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={
                  (formik.touched.description && formik.errors.description) ||
                  "Adăugați o descriere detaliată a mașinii, inclusiv istoricul, starea, eventuale reparații, defecte etc."
                }
                placeholder="Descrieți mașina în detaliu..."
                sx={{
                  '& .MuiInputBase-root': {
                    minHeight: '150px',  
                    alignItems: 'flex-start'  
                  },
                  '& .MuiInputBase-input': {
                    overflow: 'auto'  
                  }
                }}
              />
            </Grid>
          </Grid>
        );
      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Verificare anunț
              </Typography>
              
              <Alert severity="info" sx={{ mb: 3 }}>
                Vă rugăm să verificați toate informațiile înainte de a actualiza anunțul.
              </Alert>
              
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  {formik.values.title}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="subtitle2">Informații generale:</Typography>
                      <Typography variant="body2">Marca: {formik.values.brand}</Typography>
                      <Typography variant="body2">Model: {formik.values.model}</Typography>
                      <Typography variant="body2">An fabricație: {formik.values.year_of_manufacture}</Typography>
                      <Typography variant="body2">Stare: {
                        conditionOptions.find(opt => opt.value === formik.values.condition_state)?.label || formik.values.condition_state
                      }</Typography>
                      <Typography variant="body2">Culoare: {formik.values.color}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>
                        Preț: {Number(formik.values.price).toLocaleString()} €
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="subtitle2">Detalii tehnice:</Typography>
                      <Typography variant="body2">Kilometraj: {Number(formik.values.mileage).toLocaleString()} km</Typography>
                      <Typography variant="body2">Putere: {formik.values.power} CP</Typography>
                      <Typography variant="body2">Capacitate motor: {formik.values.engine_capacity} cm³</Typography>
                      <Typography variant="body2">Combustibil: {
                        fuelOptions.find(opt => opt.value === formik.values.fuel_type)?.label || formik.values.fuel_type
                      }</Typography>
                      <Typography variant="body2">Cutie de viteze: {
                        transmissionOptions.find(opt => opt.value === formik.values.transmission)?.label || formik.values.transmission
                      }</Typography>
                      <Typography variant="body2">Tracțiune: {
                        driveTypeOptions.find(opt => opt.value === formik.values.drive_type)?.label || formik.values.drive_type
                      }</Typography>
                      <Typography variant="body2">Normă de poluare: {formik.values.emission_standard}</Typography>
                    </Box>
                  </Grid>
                  
                  {formik.values.features.length > 0 && formik.values.features[0].feature_name && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2">Dotări:</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {formik.values.features
                          .filter(feature => feature.feature_name.trim() !== '')
                          .map((feature, index) => (
                            <Chip 
                              key={index} 
                              label={feature.feature_value ? `${feature.feature_name}: ${feature.feature_value}` : feature.feature_name} 
                              size="small"
                              variant="outlined"
                            />
                          ))}
                      </Box>
                    </Grid>
                  )}
                  
                  {formik.values.description && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2">Descriere:</Typography>
                      <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-line' }}>
                        {formik.values.description}
                      </Typography>
                    </Grid>
                  )}
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Imagini:</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                      <Typography variant="body2">
                        Imagini existente: {existingImages.filter(img => !imagesToDelete.includes(img.id)).length}
                      </Typography>
                      <Typography variant="body2">
                        Imagini noi: {previewImages.length}
                      </Typography>
                      <Typography variant="body2">
                        Imagini șterse: {imagesToDelete.length}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Editare anunț #{id}
        </Typography>
        
        
        {user && user.is_admin && user.id !== listing?.user?.id && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Editați acest anunț în calitate de administrator. Proprietarul anunțului este {listing?.user?.username}.
            </Typography>
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ mb: 4 }}>
            {getStepContent(activeStep)}
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              disabled={activeStep === 0 || loading}
              onClick={handleBack}
            >
              Înapoi
            </Button>
            
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Actualizează anunțul'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                >
                  Continuă
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default EditListingPage;
