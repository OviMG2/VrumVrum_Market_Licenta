import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingsAPI } from '../services/api';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Container from '@mui/material/Container';
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
// Adaugă aceste importuri la începutul fișierului
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
//import PhotoCamera from '@mui/icons-material/PhotoCamera';
import UploadFileIcon from '@mui/icons-material/UploadFile';

// Opțiuni pentru selecturi
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

const bodyTypeOptions = [
  { value: 'sedan', label: 'Sedan' },
  { value: 'hatchback', label: 'Hatchback' },
  { value: 'combi', label: 'Combi/Break' },
  { value: 'suv', label: 'SUV/Crossover' },
  { value: 'coupe', label: 'Coupe' },
  { value: 'cabrio', label: 'Cabriolet/Decapotabilă' },
  { value: 'mini', label: 'Mini/Mică' },
  { value: 'monovolum', label: 'Monovolum' },
  { value: 'utilitara', label: 'Utilitară' },
  { value: 'altele', label: 'Altele' }
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

const emissionOptions = [
  { value: 'Euro 3', label: 'Euro 3' },
  { value: 'Euro 4', label: 'Euro 4' },
  { value: 'Euro 5', label: 'Euro 5' },
  { value: 'Euro 6', label: 'Euro 6' },
  { value: 'Euro 6d', label: 'Euro 6d' },
  { value: 'Non-Euro', label: 'Non-Euro' },
];

// Pentru culori
const colorOptions = [
  { value: 'alb', label: 'Alb' },
  { value: 'negru', label: 'Negru' },
  { value: 'gri', label: 'Gri' },
  { value: 'argintiu', label: 'Argintiu' },
  { value: 'albastru', label: 'Albastru' },
  { value: 'Roșu', label: 'Roșu' },
  { value: 'verde', label: 'Verde' },
  { value: 'galben', label: 'Galben' },
  { value: 'maro', label: 'Maro' },
  { value: 'portocaliu', label: 'Portocaliu' },
  { value: 'alta culoare', label: 'Altă culoare' },
];

// Schema de validare pentru anunț
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
  description: Yup.string(), // Eliminăm limita de caractere
  features: Yup.array().of(
    Yup.object().shape({
      feature_name: Yup.string().notRequired('Numele dotării este obligatoriu'),
      feature_value: Yup.string(),
    })
  ),
  images: Yup.array().min(1, 'Trebuie să adăugați cel puțin o imagine'),
  body_type: Yup.string(),
  right_hand_drive: Yup.boolean().default(false),
  co2_emissions: Yup.number().positive('Valoarea trebuie să fie pozitivă').nullable(),
  seats: Yup.number().positive('Valoarea trebuie să fie pozitivă').nullable(),
  doors: Yup.number().positive('Valoarea trebuie să fie pozitivă').nullable(),
  registered: Yup.boolean().default(false),
  location: Yup.string(),
});

// Pașii pentru formular
const steps = ['Informații de bază', 'Detalii tehnice', 'Imagini și descriere', 'Finalizare'];





const CreateListingPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);

  // Formik pentru gestionarea formularului
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
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);
      
      try {
        // Creăm un FormData pentru a trimite imaginile
        console.log('Valori complete la submit:', values);
        console.log('Features la submit:', values.features);
        const formData = new FormData();
        
        // Adăugăm fiecare câmp la FormData
        for (const key in values) {
          if (key === 'images') {
            // Adăugăm fiecare imagine
            values.images.forEach((image, index) => {
              formData.append(`images[${index}]`, image);  // Notați formatul schimbat!
            });
          } else if (key === 'features') {
            // console.log('Features înainte de filtrare:', values.features);
            // Adăugăm dotările ca JSON
            const filteredFeatures = values.features
            .filter(f => f.feature_name && f.feature_name.trim() !== '')
            .map(f => ({
              feature_name: f.feature_name.trim(),
              feature_value: f.feature_value ? f.feature_value.trim() : ''
            }));
            // console.log('Features filtrate:', filteredFeatures);
          // Trimite doar dacă există dotări relevante
          if (filteredFeatures.length > 0) {
            const featuresJson = JSON.stringify(filteredFeatures);
            formData.append('features', featuresJson);
          }
            } else {
            formData.append(key, values[key]);
          }
        }
        
        // Trimitem anunțul
        const response = await listingsAPI.createListing(formData);
        
        console.log('Răspuns primit:', response);
        
        // Extragem ID-ul din răspuns
        const listingId = response.id;
        
        if (listingId) {
          // Redirecționăm către pagina anunțului
          navigate(`/listings/${listingId}`);
        } else {
          console.error('Răspuns fără ID:', response);
          throw new Error('Nu am putut identifica ID-ul anunțului');
        }
      } catch (err) {
        console.error('Eroare la crearea anunțului:', err);
        
        // Gestionăm diferit tipurile de erori
        if (err.detail) {
          setError(err.detail);
        } else if (err.message) {
          setError(err.message);
        } else if (typeof err === 'object' && err !== null) {
          // Transformă obiectul de eroare într-un mesaj lizibil
          const errorMessages = Object.entries(err)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
          setError(errorMessages || 'Eroare necunoscută');
        } else {
          setError('A apărut o eroare la crearea anunțului. Vă rugăm să încercați din nou.');
        }
        
        setActiveStep(0); // Revenim la primul pas pentru a vedea erorile
      } finally {
        setLoading(false);
      }
    },
  });

  // Gestionarea pașilor
  const handleNext = () => {
    // Validăm doar câmpurile din pasul curent
    const fieldsToValidate = activeStep === 0
      ? ['title', 'brand', 'model', 'year_of_manufacture', 'price', 'condition_state', 'color']
      : activeStep === 1
      ? ['mileage', 'power', 'engine_capacity', 'fuel_type', 'transmission', 'drive_type', 'emission_standard']
      : activeStep === 2
      ? ['description', 'images']
      : [];
    
    // Verificăm dacă există erori pentru câmpurile din pasul curent
    const stepHasErrors = fieldsToValidate.some(field => 
      formik.touched[field] && formik.errors[field]
    );
    
    // Marcăm câmpurile ca atinse pentru a vedea erorile
    fieldsToValidate.forEach(field => {
      formik.setFieldTouched(field, true);
    });
    
    // Dacă nu există erori, trecem la pasul următor
    if (!stepHasErrors) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Gestionarea adăugării/eliminării dotărilor
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

  // Gestionarea încărcării imaginilor
  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    
    // Validăm fișierele (doar imagini, max 5MB)
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
    
    // Adăugăm la imaginile existente
    const newImages = [...formik.values.images, ...validFiles];
    
    // Limitarea la maxim 10 imagini
    if (newImages.length > 10) {
      alert('Puteți încărca maxim 10 imagini.');
      return;
    }
    
    formik.setFieldValue('images', newImages);
    
    // Creăm URL-uri pentru previzualizare
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setPreviewImages([...previewImages, ...newPreviews]);
  };

  const removeImage = (index) => {
    const updatedImages = [...formik.values.images];
    updatedImages.splice(index, 1);
    formik.setFieldValue('images', updatedImages);
    
    const updatedPreviews = [...previewImages];
    URL.revokeObjectURL(updatedPreviews[index]); // Eliberăm URL-ul
    updatedPreviews.splice(index, 1);
    setPreviewImages(updatedPreviews);
  };

  // Afișăm conținutul în funcție de pasul curent
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
                  value={formik.values.body_type}
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
                value={formik.values.co2_emissions}
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
                    checked={formik.values.right_hand_drive}
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
                    checked={formik.values.registered}
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
                  value={feature.feature_name || ''} // Adăugați || ''
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur} // Adăugați onBlur
                  placeholder="Ex: Aer condiționat, GPS, etc."
                />
              </Grid>
              <Grid item xs={5}>
                <TextField
                  fullWidth
                  name={`features[${index}].feature_value`}
                  label="Valoare/Detalii (opțional)"
                  value={feature.feature_value || ''} // Adăugați || ''
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur} // Adăugați onBlur
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
                Imagini
              </Typography>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Încărcați imagini clare ale mașinii dumneavoastră. Prima imagine va fi imaginea principală. 
                Puteți încărca maxim 10 imagini, fiecare cu dimensiunea maximă de 5MB.
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
                    Selectează imagini
                  </Button>
                </label>
                
                {formik.touched.images && formik.errors.images && (
                  <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                    {formik.errors.images}
                  </Typography>
                )}
                
                {previewImages.length > 0 && (
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    {previewImages.map((preview, index) => (
                      <Grid item xs={6} sm={4} md={3} key={index}>
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
                          {index === 0 && (
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
                            onClick={() => removeImage(index)}
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
                maxRows={30}
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
                    minHeight: '150px',  // Înălțimea minimă
                    alignItems: 'flex-start'  // Aliniază eticheta în partea de sus
                  },
                  '& .MuiInputBase-input': {
                    overflow: 'auto'  // Permite scroll în interiorul câmpului
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
                Vă rugăm să verificați toate informațiile înainte de a publica anunțul.
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
                    <Typography variant="subtitle2">Imagini: {formik.values.images.length}</Typography>
                    {previewImages.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: 1, mt: 1, overflowX: 'auto', pb: 1 }}>
                        {previewImages.map((preview, index) => (
                          <Box
                            key={index}
                            sx={{
                              minWidth: 100,
                              height: 75,
                              borderRadius: 1,
                              overflow: 'hidden',
                              flexShrink: 0,
                              border: index === 0 ? '2px solid' : '1px solid',
                              borderColor: index === 0 ? 'primary.main' : 'divider',
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
                          </Box>
                        ))}
                      </Box>
                    )}
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
          Adaugă un anunț nou
        </Typography>
        
        {error && (
  <Alert severity="error" sx={{ mb: 3 }}>
    {typeof error === 'object' 
      ? Object.entries(error).map(([key, value]) => {
          // Verificăm dacă value este la rândul său un obiect
          if (typeof value === 'object' && value !== null) {
            return <div key={key}><strong>{key}</strong>: {JSON.stringify(value)}</div>;
          }
          return <div key={key}><strong>{key}</strong>: {value}</div>;
        })
      : error
    }
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
                  {loading ? <CircularProgress size={24} /> : 'Publică anunțul'}
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

export default CreateListingPage;