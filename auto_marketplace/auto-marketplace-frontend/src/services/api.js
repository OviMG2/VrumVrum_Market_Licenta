import axios from 'axios';

const baseURL = 'http://localhost:8000/api/';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor pentru adăugarea token-ului JWT la cereri
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor pentru gestionarea răspunsurilor
// Interceptor pentru gestionarea răspunsurilor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Verifică dacă token-ul a expirat sau avem 401/403
    if (
      error.response && 
      (error.response.status === 401 || 
       error.response.status === 403 || 
       error.response.data?.code === 'token_expired')
    ) {
      // Trimite un eveniment personalizat pentru a deschide modalul
      window.dispatchEvent(new Event('session-expired'));
      
      // Opțional: deconectează utilizatorul
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
    
    return Promise.reject(error);
  }
);

// Funcții pentru autentificare
export const authAPI = {
  register: (userData) => api.post('users/register/', userData),
  login: (credentials) => api.post('users/login/', credentials),
  logout: () => api.post('users/logout/'),
  getProfile: () => api.get('users/profile/'),
  updateProfile: (userData) => api.put('users/profile/', userData),
};

// Funcția simplificată pentru obținerea unui anunț specific
const getListing = async (id) => {
  try {
    // Verificăm dacă utilizatorul este autentificat pentru a include token-ul de autorizare
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    const response = await axios.get(`${baseURL}listings/cars/${id}/`, { headers });
    
    // Verificăm dacă răspunsul este valid
    if (!response.data) {
      throw new Error(`Răspuns invalid pentru anunțul ${id}`);
    }
    
    const data = response.data;
    
    // Verificăm starea favoritului în localStorage
    const favoritesMap = JSON.parse(localStorage.getItem('userFavorites') || '{}');
    
    // Dacă starea de favorite nu este specificată explicit în răspunsul API,
    // dar anunțul este marcat ca favorit în localStorage, o setăm
    if (data.is_favorite === undefined && favoritesMap[id]) {
      data.is_favorite = true;
    }
    
    return data;
  } catch (error) {
    console.error('Eroare la obținerea detaliilor anunțului:', error);
    throw error;
  }
};

// Funcția pentru crearea unui anunț
const createListing = async (formData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Nu sunteți autentificat');
    }
    
    // Folosim axios pentru a gestiona corect FormData
    const response = await axios.post(`${baseURL}listings/cars/`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Răspuns reușit:', response.data);
    return response.data;
  } catch (error) {
    console.error('Eroare la crearea anunțului:', error);
    
    if (error.response) {
      throw error.response.data;
    } else if (error.request) {
      throw new Error('Serverul nu răspunde. Verificați conexiunea la internet.');
    } else {
      throw error;
    }
  }
};

// Funcția pentru obținerea anunțurilor utilizatorului curent
// Funcția pentru obținerea anunțurilor utilizatorului curent
// Funcția pentru obținerea TUTUROR anunțurilor utilizatorului curent
// Funcția pentru obținerea anunțurilor utilizatorului curent
const getMyListings = async (params = {}) => {
  try {
    const token = localStorage.getItem('token');
    console.log('Token folosit pentru cerere:', token ? token.substring(0, 20) + '...' : 'null');
    if (!token) {
      throw new Error('Nu sunteți autentificat');
    }
    
    // Construim parametrii de query corect
    let url = `${baseURL}listings/cars/my_listings/`;
    
    // Adăugăm parametrii de paginare doar dacă sunt furnizați
    if (params.page || params.limit) {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      url += `?${queryParams.toString()}`;
    }
    
    console.log('URL cerere:', url);
    
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Răspuns my_listings brut:', response.data);
    
    // Returnăm răspunsul COMPLET, inclusiv informațiile despre paginare
    return response.data;
  } catch (error) {
    console.error('Eroare la obținerea anunțurilor proprii:', error);
    if (error.response && error.response.status === 401) {
      // Utilizatorul nu este autentificat
      return { results: [] };
    }
    // Pentru alte erori, returnăm un obiect gol dar valid pentru structura așteptată
    console.warn('Returnăm răspuns gol din cauza erorii');
    return { results: [] };
  }
};

// Funcția pentru actualizarea unui anunț
const updateListing = async (id, formData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Nu sunteți autentificat');
    }
    
    // Folosim axios pentru a gestiona corect FormData
    const response = await axios.put(`${baseURL}listings/cars/${id}/`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`
        // Nu setăm Content-Type, axios va configura automat pentru FormData
      }
    });
    
    console.log('Răspuns actualizare:', response.data);
    return response.data;
  } catch (error) {
    console.error('Eroare la actualizarea anunțului:', error);
    
    if (error.response) {
      // Serverul a răspuns cu un status cod în afara intervalului 2xx
      console.error('Eroare server:', error.response.status, error.response.data);
      throw error.response.data;
    } else if (error.request) {
      // Cererea a fost făcută dar nu s-a primit niciun răspuns
      console.error('Niciun răspuns de la server:', error.request);
      throw new Error('Serverul nu răspunde. Verificați conexiunea la internet.');
    } else {
      // Ceva a mers prost la setarea cererii
      console.error('Eroare la setarea cererii:', error.message);
      throw error;
    }
  }
};

// Funcția pentru ștergerea unui anunț
const deleteListing = async (id) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Nu sunteți autentificat');
    }
    
    const response = await axios.delete(`${baseURL}listings/cars/${id}/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Eroare la ștergerea anunțului:', error);
    
    if (error.response) {
      throw error.response.data;
    } else if (error.request) {
      throw new Error('Serverul nu răspunde. Verificați conexiunea la internet.');
    } else {
      throw error;
    }
  }
};

// Funcție pentru obținerea tuturor anunțurilor (cu filtrare opțională)
const getListings = async (filters = {}) => {
  try {
    const response = await axios.get(`${baseURL}listings/cars/`, {
      params: filters
    });
    return response.data;
  } catch (error) {
    console.error('Eroare la obținerea anunțurilor:', error);
    throw error;
  }
};

// Funcție pentru a obține anunțurile unui utilizator specific
const getUserListings = async (userId) => {
  try {
    // Folosim endpoint-ul corect pentru anunțurile utilizatorului
    const response = await axios.get(`${baseURL}listings/user/${userId}/`);
    return response.data;
  } catch (error) {
    console.error('Eroare la obținerea anunțurilor utilizatorului:', error);
    return []; // Returnăm un array gol în caz de eroare
  }
};

// Funcția pentru adăugarea/eliminarea unui anunț din favorite
const toggleFavorite = async (listingId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Nu sunteți autentificat');
    }
    
    const response = await axios.post(`${baseURL}listings/cars/${listingId}/favorite/`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Actualizăm și caching-ul local
    const favoritesMap = JSON.parse(localStorage.getItem('userFavorites') || '{}');
    
    // Logica de toggle bazată pe răspunsul API-ului
    if (response.data && response.data.status === 'added') {
      favoritesMap[listingId] = true;
    } else {
      delete favoritesMap[listingId];
    }
    
    localStorage.setItem('userFavorites', JSON.stringify(favoritesMap));
    
    return response.data;
  } catch (error) {
    console.error('Eroare la adăugarea/eliminarea din favorite:', error);
    
    if (error.response) {
      throw error.response.data;
    } else if (error.request) {
      throw new Error('Serverul nu răspunde. Verificați conexiunea la internet.');
    } else {
      throw error;
    }
  }
};

// Funcția pentru obținerea listei de favorite
const getFavorites = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Nu sunteți autentificat');
    }
    
    const response = await axios.get(`${baseURL}listings/favorites/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Actualizăm și localStorage cu favoritele primite
    const favoritesMap = {};
    
    let favoritesList = response.data?.results || response.data || [];
    if (!Array.isArray(favoritesList)) {
      console.error('Response data format invalid:', response.data);
      favoritesList = [];
    }
    
    // Procesăm favoritele și le adăugăm în map
    favoritesList.forEach(favorite => {
      const listing = favorite.car_listing || favorite;
      if (listing && listing.id) {
        favoritesMap[listing.id] = true;
      }
    });
    
    localStorage.setItem('userFavorites', JSON.stringify(favoritesMap));
    
    return response;
  } catch (error) {
    console.error('Eroare la obținerea anunțurilor favorite:', error);
    
    if (error.response && error.response.status === 401) {
      // Utilizatorul nu este autentificat
      return { data: [] };
    }
    
    throw error;
  }
};

// Funcții pentru anunțuri
export const listingsAPI = {
  getAllListings: (params) => api.get('listings/cars/', { params }),
  getListing,
  createListing,
  updateListing,
  deleteListing,
  getMyListings,
  getListings,
  toggleFavorite,
  getFavorites,
  getUserListings,
  getSimilarListings: async (listingId) => {
    try {
      const response = await axios.get(`${baseURL}listings/cars/${listingId}/similar_listings/`);
      return response.data;
    } catch (error) {
      console.error('Eroare la obținerea anunțurilor similare:', error);
      return []; // Returnăm array gol în caz de eroare
    }
  }
};




// Funcții pentru recomandări - adăugare endpoints pentru algoritmi
export const recommendationsAPI = {
  getForYou: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Nu sunteți autentificat');
      }
      
      const response = await axios.get(`${baseURL}recommendations/for_you/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response;
    } catch (error) {
      console.error('Eroare la obținerea recomandărilor:', error);
      
      if (error.response && error.response.status === 401) {
        // Utilizatorul nu este autentificat
        return { data: [] };
      }
      
      throw error;
    }
  },
  
  // Noul endpoint pentru recomandări bazate pe algoritm specific
  getRecommendationsByAlgorithm: async (algorithm) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Nu sunteți autentificat');
      }
      
      const response = await axios.get(`${baseURL}recommendations/algorithm/${algorithm}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response;
    } catch (error) {
      console.error(`Eroare la obținerea recomandărilor cu algoritmul ${algorithm}:`, error);
      
      if (error.response && error.response.status === 401) {
        // Utilizatorul nu este autentificat
        return { data: [] };
      }
      
      throw error;
    }
  },
  
  recordInteraction: async (data) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return; // Ignorăm silențios dacă utilizatorul nu este autentificat
      }
      
      await axios.post(`${baseURL}recommendations/interactions/`, data, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Eroare la înregistrarea interacțiunii:', error);
      // Nu propagăm eroarea pentru a nu afecta experiența utilizatorului
    }
  },
};

// Funcție pentru calculul împrumutului
const calculateLoan = async (data) => {
  try {
    const response = await fetch(`${baseURL}listings/calculator/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const responseData = await response.json();
    return { data: responseData };
  } catch (error) {
    throw error;
  }
};

// Funcții pentru calculatorul financiar
export const financialAPI = {
  calculateLoan,
};

export default api;