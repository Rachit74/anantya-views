import axios from 'axios'

export const BASE_URL = 'https://a6e3-2401-4900-1c30-1cf2-8ac4-368c-494a-1ba.ngrok-free.app'

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