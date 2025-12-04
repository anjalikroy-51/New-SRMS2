// API Utility - AJAX helper functions for backend communication
const API_BASE_URL = 'http://localhost:3000/api';

// Get stored token
function getToken() {
  return localStorage.getItem('token');
}

// Make AJAX API call with authentication
async function apiCall(endpoint, options = {}) {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      // If unauthorized, redirect to login
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!window.location.pathname.includes('Login.html')) {
          window.location.href = 'Login.html';
        }
      }
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
}

// Upload file with FormData
async function apiUpload(endpoint, formData, options = {}) {
  const token = getToken();
  
  const headers = {
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: options.method || 'POST',
      headers,
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!window.location.pathname.includes('Login.html')) {
          window.location.href = 'Login.html';
        }
      }
      throw new Error(data.error || 'Upload failed');
    }

    return data;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

// Check if user is authenticated
function isAuthenticated() {
  return !!getToken();
}

// Redirect to login if not authenticated
function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = 'Login.html';
    return false;
  }
  return true;
}

