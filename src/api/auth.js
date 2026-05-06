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
      const error = await response.json();
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export async function continueWithEmail(email) {
  if (!String(email || '').trim()) {
    throw new Error('Email is required.');
  }
  return { message: 'Email accepted. Continue with authentication.' };
}

export async function signUpWithEmail({ email, password, name }) {
  return apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
}

export async function signInWithEmail({ email, password }) {
  const response = await apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  if (response.token) {
    localStorage.setItem('token', response.token);
  }
  
  return response;
}

export async function getActiveUser() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const response = await apiCall('/auth/me');
    return response.user || response;
  } catch (error) {
    console.error('Error fetching active user:', error);
    localStorage.removeItem('token');
    return null;
  }
}

export function clearActiveUser() {
  localStorage.removeItem('token');
}
