import axios from 'axios'

export const BASE_URL = 'https://2faa-2401-4900-1c30-1cf2-3e40-1ab4-3a17-d46d.ngrok-free.app/'

// Maintenance mode configuration
// Set to true to show maintenance page to all users
export const MAINTENANCE_MODE = false

// Routes that are accessible during maintenance mode
export const MAINTENANCE_EXEMPT_ROUTES = ['/maintenance']

// Axios instance with ngrok header to skip browser warning
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },
})