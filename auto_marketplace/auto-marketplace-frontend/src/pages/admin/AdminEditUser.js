import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

// Material UI
import {
    Container,
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    FormControlLabel,
    Checkbox,
    Avatar,
    InputAdornment,
    IconButton,
    Alert,
    CircularProgress,
    Divider,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@mui/material';

// Icons
import {
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    PhotoCamera as PhotoCameraIcon,
    Save as SaveIcon,
    ArrowBack as ArrowBackIcon,
    Delete as DeleteIcon,
    LockReset as LockResetIcon
} from '@mui/icons-material';

const AdminEditUser = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    // State
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        real_name: '',
        // display_name: '',
        phone_number: '',
        city: '',
        county: '',
        bio: '',
        is_admin: false,
        is_active: true,
        profile_image: null,
        show_email: true,
        show_phone: true,
        new_password: '',
        confirm_password: '',
    });

    // UI state
    const [showPassword, setShowPassword] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
    const [deleteUserOpen, setDeleteUserOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);

    const baseURL = 'http://localhost:8000';

    // Verificăm dacă utilizatorul are permisiuni de admin
    useEffect(() => {
        if (currentUser && !currentUser.is_admin) {
            navigate('/');
        }
    }, [currentUser, navigate]);

    // Încărcăm datele utilizatorului
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');

                if (!token) {
                    throw new Error('Nu sunteți autentificat');
                }

                const response = await axios.get(`${baseURL}/api/users/${userId}/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                setUser(response.data);

                // Populăm formularul cu datele utilizatorului
                setFormData({
                    username: response.data.username || '',
                    email: response.data.email || '',
                    real_name: response.data.real_name || '',
                    display_name: response.data.display_name || '',
                    phone_number: response.data.phone_number || '',
                    city: response.data.city || '',
                    county: response.data.county || '',
                    bio: response.data.bio || '',
                    is_admin: response.data.is_admin || false,
                    is_active: response.data.is_active !== false, // Default true
                    profile_image: null, // Pentru încărcarea unei noi imagini
                    show_email: response.data.show_email !== false, // Default true
                    show_phone: response.data.show_phone !== false, // Default true
                    new_password: '',
                    confirm_password: '',
                });

                // Încărcăm imaginea de profil existentă
                if (response.data.profile_image) {
                    setImagePreview(getImageUrl(response.data.profile_image));
                }

                setLoading(false);
            } catch (err) {
                console.error('Eroare la încărcarea datelor utilizatorului:', err);
                setError('Nu am putut încărca datele utilizatorului. Verificați conexiunea.');
                setLoading(false);
            }
        };

        if (currentUser && currentUser.is_admin && userId) {
            fetchUserData();
        }
    }, [userId, currentUser]);

    // Funcție pentru a construi URL-ul corect al imaginii
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;

        // Adăugăm un timestamp pentru a evita cache-ul browserului
        const timestamp = new Date().getTime();

        // Dacă începe cu http sau https, este deja un URL complet
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return `${imagePath}?t=${timestamp}`;
        }

        // Dacă începe cu slash, adăugăm doar domeniul
        if (imagePath.startsWith('/')) {
            return `${baseURL}${imagePath}?t=${timestamp}`;
        }

        // Altfel, construim calea completă
        return `${baseURL}/media/profile_images/${imagePath}?t=${timestamp}`;
    };

    // Handler pentru schimbarea valorilor în formular
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox') {
            setFormData({
                ...formData,
                [name]: checked
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    // Handler pentru încărcarea imaginii de profil
    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            // Verificăm dacă este o imagine și nu depășește 5MB
            if (!file.type.match('image.*')) {
                setError('Vă rugăm să încărcați doar fișiere imagine.');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                setError('Imaginea nu poate depăși 5MB.');
                return;
            }

            // Actualizăm starea și creăm un preview
            setFormData({
                ...formData,
                profile_image: file
            });

            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };


    // Adaugă această funcție AICI, între handleImageChange și handleSubmit
    const handleAdminStatusChange = async (e) => {
        try {
        const isAdmin = e.target.checked;
        setFormData({
            ...formData,
            is_admin: isAdmin
        });
        
        const token = localStorage.getItem('token');
        
        if (!token) {
            throw new Error('Nu sunteți autentificat');
        }
        
        // Folosim endpoint-ul specific pentru toggle-admin
        await axios.patch(`${baseURL}/api/users/admin/users/${userId}/toggle-admin/`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // Actualizăm starea user pentru a reflecta schimbarea
        setUser({
            ...user,
            is_admin: isAdmin
        });
        
        setSuccessMessage(`Utilizatorul este acum ${isAdmin ? 'administrator' : 'utilizator normal'}`);
        
        // Ascundem mesajul după câteva secunde
        setTimeout(() => {
            setSuccessMessage(null);
        }, 3000);
        } catch (err) {
        console.error('Eroare la schimbarea statutului de admin:', err);
        setError('Nu am putut schimba statutul de administrator.');
        }
    };



    const handleActiveStatusChange = async (e) => {
        try {
          const isActive = e.target.checked;
          setFormData({
            ...formData,
            is_active: isActive
          });
          
          const token = localStorage.getItem('token');
          
          if (!token) {
            throw new Error('Nu sunteți autentificat');
          }
          
          // Folosim endpoint-ul specific pentru toggle-active
          await axios.patch(`${baseURL}/api/users/admin/users/${userId}/toggle-active/`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          // Actualizăm starea user pentru a reflecta schimbarea
          setUser({
            ...user,
            is_active: isActive
          });
          
          setSuccessMessage(`Contul utilizatorului este acum ${isActive ? 'activ' : 'inactiv'}`);
          
          // Ascundem mesajul după câteva secunde
          setTimeout(() => {
            setSuccessMessage(null);
          }, 3000);
        } catch (err) {
          console.error('Eroare la schimbarea statutului activ:', err);
          setError('Nu am putut schimba statutul contului.');
        }
      };



    // Handler pentru salvarea modificărilor
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Resetăm mesajele
        setError(null);
        setSuccessMessage(null);

        try {
            setSaving(true);

            // Verificăm dacă parolele coincid, dacă a fost introdusă o parolă nouă
            if (formData.new_password && formData.new_password !== formData.confirm_password) {
                setError('Parolele nu coincid.');
                setSaving(false);
                return;
            }

            // Nu permitem administratorilor să-și dezactiveze propriul cont
            if (parseInt(userId) === currentUser.id && !formData.is_active) {
                setError('Nu puteți dezactiva propriul cont.');
                setSaving(false);
                return;
            }

            // Nu permitem administratorilor să-și retragă propriile drepturi admin
            if (parseInt(userId) === currentUser.id && !formData.is_admin && user.is_admin) {
                setError('Nu puteți retrage propriile drepturi de administrator.');
                setSaving(false);
                return;
            }

            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('Nu sunteți autentificat');
            }

            // Creăm un FormData pentru a putea trimite fișierul imagine
            const data = new FormData();

            // Adăugăm câmpurile la FormData
            data.append('username', formData.username);
            data.append('email', formData.email);
            data.append('real_name', formData.real_name);

            data.append('phone_number', formData.phone_number || '');
            
            data.append('city', formData.city || '');
            data.append('county', formData.county || '');
            data.append('bio', formData.bio || '');
            
            // Convertim valorile boolean la 0/1 explicit
            //data.append('is_admin', formData.is_admin ? 1 : 0);
            //data.append('is_active', formData.is_active ? 1 : 0);
            data.append('show_email', formData.show_email ? 1 : 0);
            data.append('show_phone', formData.show_phone ? 1 : 0);
            
            // Adăugăm parola dacă există
            if (formData.new_password) {
                data.append('password', formData.new_password);
            }
            
            // Adăugăm imaginea dacă există
            if (formData.profile_image) {
                data.append('profile_image', formData.profile_image);
            }


            // Adaugă acest log aici
            console.log("FormData trimis:");
            for (let pair of data.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }

            // Trimitem datele la server
            await axios.put(`${baseURL}/api/users/admin/users/${userId}/`, data, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            setSuccessMessage('Profilul utilizatorului a fost actualizat cu succes!');

            // După un scurt delay, actualizăm pagina pentru a vedea modificările
            setTimeout(() => {
                window.location.reload(); // Reîncărcăm pagina pentru a vedea modificările
            }, 2000);

        } catch (err) {
            console.error('Eroare la actualizarea datelor utilizatorului:', err);

            if (err.response && err.response.data) {
                // Afișăm mesajul de eroare de la server dacă există
                if (typeof err.response.data === 'object') {
                    const errorMessages = Object.entries(err.response.data)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(', ');
                    setError(errorMessages);
                } else {
                    setError(err.response.data);
                }
            } else {
                setError('Nu am putut actualiza datele. Verificați conexiunea și încercați din nou.');
            }
        } finally {
            setSaving(false);
        }
    };

    // Handler pentru resetarea parolei
    const handleResetPassword = async () => {
        // Resetăm mesajele
        setError(null);
        setSuccessMessage(null);

        try {
            setSaving(true);

            // Verificăm dacă parolele coincid
            if (formData.new_password !== formData.confirm_password) {
                setError('Parolele nu coincid.');
                setSaving(false);
                return;
            }

            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('Nu sunteți autentificat');
            }

            // Trimitem solicitarea de resetare parolă
            await axios.post(`${baseURL}/api/users/admin/users/${userId}/reset-password/`, {
                password: formData.new_password
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Resetăm câmpurile de parolă
            setFormData({
                ...formData,
                new_password: '',
                confirm_password: ''
            });

            // Închidem dialogul
            setResetPasswordOpen(false);

            // Afișăm un mesaj de succes
            setSuccessMessage('Parola a fost resetată cu succes!');

        } catch (err) {
            console.error('Eroare la resetarea parolei:', err);
            setError('Nu am putut reseta parola. Verificați conexiunea și încercați din nou.');
        } finally {
            setSaving(false);
        }
    };

    // Handler pentru ștergerea contului
    const handleDeleteUser = async () => {
        // Resetăm mesajele
        setError(null);
        setSuccessMessage(null);

        try {
            setSaving(true);

            // Nu permitem ștergerea propriului cont
            if (parseInt(userId) === currentUser.id) {
                setError('Nu puteți șterge propriul cont.');
                setSaving(false);
                setDeleteUserOpen(false);
                return;
            }

            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('Nu sunteți autentificat');
            }


            // Trimitem solicitarea de ștergere
            await axios.delete(`${baseURL}/api/users/admin/users/${userId}/delete/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Închidem dialogul
            setDeleteUserOpen(false);

            // Afișăm un mesaj de succes
            setSuccessMessage('Utilizatorul a fost șters cu succes!');

            // După un scurt delay, redirecționăm
            setTimeout(() => {
                navigate('/admin/dashboard');
            }, 2000);

        } catch (err) {
            console.error('Eroare la ștergerea contului:', err);

            
            setError('Nu am putut șterge contul. Verificați conexiunea și încercați din nou.');
            setDeleteUserOpen(false);
        } finally {
            setSaving(false);
        }
    };

    // Afișăm loading în timpul încărcării
    if (loading) {
        return (
            <Container sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    // Afișăm eroare dacă utilizatorul nu are permisiuni
    if (!currentUser || !currentUser.is_admin) {
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

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" component="h1">
                        Editare Utilizator
                    </Typography>

                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate(`/user/${userId}`)}
                    >
                        Înapoi la profil
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {successMessage && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        {successMessage}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        {/* Imagine profil */}
                        <Grid item xs={12} display="flex" justifyContent="center">
                            <Box sx={{ position: 'relative' }}>
                                <Avatar
                                    src={imagePreview}
                                    sx={{
                                        width: 150,
                                        height: 150,
                                        bgcolor: 'primary.main',
                                        fontSize: '3rem',
                                    }}
                                >
                                    {formData.username?.charAt(0).toUpperCase() || "U"}
                                </Avatar>

                                <Box sx={{ position: 'absolute', bottom: 0, right: 0 }}>
                                    <input
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        id="profile-image-upload"
                                        type="file"
                                        onChange={handleImageChange}
                                    />
                                    <label htmlFor="profile-image-upload">
                                        <IconButton
                                            color="primary"
                                            aria-label="upload picture"
                                            component="span"
                                            sx={{ bgcolor: 'background.paper' }}
                                        >
                                            <PhotoCameraIcon />
                                        </IconButton>
                                    </label>
                                </Box>
                            </Box>
                        </Grid>

                        {/* Date de bază */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>
                                Informații de bază
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Nume utilizator"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                //required
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                //required
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Nume real"
                                name="real_name"
                                value={formData.real_name}
                                onChange={handleChange}
                                //required
                            />
                        </Grid>

                        {/* <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nume afișat"
                name="display_name"
                value={formData.display_name || ''}
                onChange={handleChange}
                helperText="Opțional, va fi folosit în loc de numele utilizator"
              />
            </Grid> */}

                        <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                <TextField
                                    fullWidth
                                    label="Telefon"
                                    name="phone_number"
                                    value={formData.phone_number || ''}
                                    onChange={handleChange}
                                    placeholder="+07xxxxxxxx"
                                    sx={{ mr: 1 }}
                                />
                                <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    onClick={() => {
                                        setFormData({
                                            ...formData,
                                            phone_number: ''
                                        });
                                    }}
                                    sx={{ mt: 1 }}
                                >
                                    Șterge
                                </Button>
                            </Box>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Oraș"
                                name="city"
                                value={formData.city || ''}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Județ"
                                name="county"
                                value={formData.county || ''}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Descriere"
                                name="bio"
                                multiline
                                rows={4}
                                value={formData.bio || ''}
                                onChange={handleChange}
                            />
                        </Grid>

                        {/* Setări cont */}
                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                Setări cont
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formData.is_admin}
                                        onChange={handleAdminStatusChange}
                                        name="is_admin"
                                        color="primary"
                                        disabled={parseInt(userId) === currentUser.id && user?.is_admin}
                                    />
                                }
                                label="Administrator"
                            />
                            {parseInt(userId) === currentUser.id && user?.is_admin && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Nu puteți retrage propriile drepturi de administrator
                                </Typography>
                            )}
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formData.is_active}
                                        onChange={handleActiveStatusChange}
                                        name="is_active"
                                        color="primary"
                                        disabled={parseInt(userId) === currentUser.id}
                                    />
                                }
                                label="Cont activ"
                            />
                            {parseInt(userId) === currentUser.id && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Nu puteți dezactiva propriul cont
                                </Typography>
                            )}
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formData.show_email}
                                        onChange={handleChange}
                                        name="show_email"
                                        color="primary"
                                    />
                                }
                                label="Arată email-ul public"
                            />
                        </Grid>

                        {/* <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formData.show_phone}
                                        onChange={handleChange}
                                        name="show_phone"
                                        color="primary"
                                    />
                                }
                                label="Arată telefonul public"
                            />
                        </Grid> */}

                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                        </Grid>

                        {/* Butoane de acțiune */}
                        <Grid item xs={12} sm={4}>
                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                type="submit"
                                startIcon={<SaveIcon />}
                                disabled={saving}
                            >
                                {saving ? <CircularProgress size={24} /> : 'Salvează modificările'}
                            </Button>
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <Button
                                fullWidth
                                variant="outlined"
                                color="warning"
                                startIcon={<LockResetIcon />}
                                onClick={() => setResetPasswordOpen(true)}
                                disabled={saving}
                            >
                                Resetare parolă
                            </Button>
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <Button
                                fullWidth
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={() => setDeleteUserOpen(true)}
                                disabled={saving || parseInt(userId) === currentUser.id}
                            >
                                Șterge utilizator
                            </Button>
                            {parseInt(userId) === currentUser.id && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Nu puteți șterge propriul cont
                                </Typography>
                            )}
                        </Grid>
                    </Grid>
                </form>
            </Paper>

            {/* Dialog pentru resetarea parolei */}
            <Dialog open={resetPasswordOpen} onClose={() => setResetPasswordOpen(false)}>
                <DialogTitle>Resetare parolă</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Introduceți noua parolă pentru utilizatorul {formData.username}.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="new_password"
                        label="Parolă nouă"
                        type={showPassword ? 'text' : 'password'}
                        fullWidth
                        variant="outlined"
                        value={formData.new_password}
                        onChange={handleChange}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                        sx={{ mb: 2, mt: 2 }}
                    />
                    <TextField
                        margin="dense"
                        name="confirm_password"
                        label="Confirmă parola"
                        type={showPassword ? 'text' : 'password'}
                        fullWidth
                        variant="outlined"
                        value={formData.confirm_password}
                        onChange={handleChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setResetPasswordOpen(false)} color="primary">
                        Anulează
                    </Button>
                    <Button
                        onClick={handleResetPassword}
                        color="primary"
                        variant="contained"
                        disabled={!formData.new_password || !formData.confirm_password || saving}
                    >
                        {saving ? <CircularProgress size={24} /> : 'Resetează parola'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog pentru ștergerea utilizatorului */}
            <Dialog open={deleteUserOpen} onClose={() => setDeleteUserOpen(false)}>
                <DialogTitle>Șterge utilizator</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Sunteți sigur că doriți să ștergeți utilizatorul {formData.username}?
                        Această acțiune este ireversibilă și toate anunțurile asociate vor fi șterse.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteUserOpen(false)} color="primary">
                        Anulează
                    </Button>
                    <Button
                        onClick={handleDeleteUser}
                        color="error"
                        variant="contained"
                        disabled={saving}
                    >
                        {saving ? <CircularProgress size={24} /> : 'Șterge definitiv'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AdminEditUser;