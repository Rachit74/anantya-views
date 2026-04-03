import axios from 'axios'

export const BASE_URL = 'https://b5c9-2401-4900-1c30-1cf2-db1-e8cb-32e9-5b12.ngrok-free.app'

// Axios instance with ngrok header to skip browser warning
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },
})