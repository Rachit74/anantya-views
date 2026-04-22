import axios from 'axios'

export const BASE_URL = 'https://dc1a-2401-4900-1c30-1cf2-ed76-bf96-b6b2-7269.ngrok-free.app'

// Maintenance mode configuration
// Set to true to show maintenance page to all users
export const MAINTENANCE_MODE = true

// Routes that are accessible during maintenance mode
export const MAINTENANCE_EXEMPT_ROUTES = ['/maintenance']

// Axios instance with ngrok header to skip browser warning
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },
})