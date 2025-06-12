import axios from 'axios';

const baseURL = 'http://localhost:8000/api/';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});


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


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    
    if (
      error.response && 
      (error.response.status === 401 || 
       error.response.status === 403 || 
       error.response.data?.code === 'token_expired')
    ) {
     
      window.dispatchEvent(new Event('session-expired'));
      
      
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
    
    return Promise.reject(error);
  }
);


export const authAPI = {
  register: (userData) => api.post('users/register/', userData),
  login: (credentials) => api.post('users/login/', credentials),
  logout: () => api.post('users/logout/'),
  getProfile: () => api.get('users/profile/'),
  updateProfile: (userData) => api.put('users/profile/', userData),
};


const getListing = async (id) => {
  try {
   
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    const response = await axios.get(`${baseURL}listings/cars/${id}/`, { headers });
    
  
    if (!response.data) {
      throw new Error(`Răspuns invalid pentru anunțul ${id}`);
    }
    
    const data = response.data;
    

    const favoritesMap = JSON.parse(localStorage.getItem('userFavorites') || '{}');
    
    
    if (data.is_favorite === undefined && favoritesMap[id]) {
      data.is_favorite = true;
    }
    
    return data;
  } catch (error) {
    console.error('Eroare la obținerea detaliilor anunțului:', error);
    throw error;
  }
};


const createListing = async (formData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Nu sunteți autentificat');
    }
    

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


const getMyListings = async (params = {}) => {
  try {
    const token = localStorage.getItem('token');
    console.log('Token folosit pentru cerere:', token ? token.substring(0, 20) + '...' : 'null');
    if (!token) {
      throw new Error('Nu sunteți autentificat');
    }
    
  
    let url = `${baseURL}listings/cars/my_listings/`;
    
  
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
    
    
    return response.data;
  } catch (error) {
    console.error('Eroare la obținerea anunțurilor proprii:', error);
    if (error.response && error.response.status === 401) {
     
      return { results: [] };
    }
   
    console.warn('Returnăm răspuns gol din cauza erorii');
    return { results: [] };
  }
};


const updateListing = async (id, formData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Nu sunteți autentificat');
    }
    
   
    const response = await axios.put(`${baseURL}listings/cars/${id}/`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`
       
      }
    });
    
    console.log('Răspuns actualizare:', response.data);
    return response.data;
  } catch (error) {
    console.error('Eroare la actualizarea anunțului:', error);
    
    if (error.response) {
      
      console.error('Eroare server:', error.response.status, error.response.data);
      throw error.response.data;
    } else if (error.request) {

      console.error('Niciun răspuns de la server:', error.request);
      throw new Error('Serverul nu răspunde. Verificați conexiunea la internet.');
    } else {
  
      console.error('Eroare la setarea cererii:', error.message);
      throw error;
    }
  }
};


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


const getUserListings = async (userId) => {
  try {
    
    const response = await axios.get(`${baseURL}listings/user/${userId}/`);
    return response.data;
  } catch (error) {
    console.error('Eroare la obținerea anunțurilor utilizatorului:', error);
    return []; 
  }
};


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
    
   
    const favoritesMap = JSON.parse(localStorage.getItem('userFavorites') || '{}');
    
   
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
    

    const favoritesMap = {};
    
    let favoritesList = response.data?.results || response.data || [];
    if (!Array.isArray(favoritesList)) {
      console.error('Response data format invalid:', response.data);
      favoritesList = [];
    }
    

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
 
      return { data: [] };
    }
    
    throw error;
  }
};


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
      return []; 
    }
  }
};





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

        return { data: [] };
      }
      
      throw error;
    }
  },
  

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
   
        return { data: [] };
      }
      
      throw error;
    }
  },
  
  recordInteraction: async (data) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return; 
      }
      
      await axios.post(`${baseURL}recommendations/interactions/`, data, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Eroare la înregistrarea interacțiunii:', error);
      
    }
  },
};

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


export const financialAPI = {
  calculateLoan,
};

export default api;
