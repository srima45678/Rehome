// api.js
// This is the central place where we configure
// all connections to our backend
// Like saving a phone number — we save it once and use everywhere

import axios from 'axios';

// Create axios instance with base URL
// Instead of writing full URL every time like:
// 'http://localhost:5000/api/auth/login'
// We just write: '/auth/login'
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// INTERCEPTOR = runs before every request
// Automatically adds token to every request header
// Like automatically showing your ID card everywhere
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
