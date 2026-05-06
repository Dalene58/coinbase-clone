const API_BASE = 'https://interim-assesment-dalene58-2.onrender.com/api';

const apiCall = async (endpoint, options = {}) => {
  try {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...options,
    };
    
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/signin';
        return;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const getAllCryptos = () => apiCall('/crypto');
export const getGainers = () => apiCall('/crypto/gainers');
export const getNewListings = () => apiCall('/crypto/new');
export const createCrypto = (cryptoData) => apiCall('/crypto', {
  method: 'POST',
  body: JSON.stringify(cryptoData),
});

