/**
 * Application configuration
 */

// API endpoint
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://backend-fyler.onrender.com';

// CORS proxy configuration
export const USE_CORS_PROXY = import.meta.env.VITE_USE_CORS_PROXY === 'true';
export const CORS_PROXY_URL = 'https://cors-anywhere.herokuapp.com/';

// Security
export const SECRET_PASSWORD = import.meta.env.VITE_ENCRYPTION_PASSWORD || 'password123'; 