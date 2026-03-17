import axios from 'axios'

export const BASE_URL = 'https://caf3-2401-4900-81fc-999a-908b-1499-e9d4-2496.ngrok-free.app'

// Axios instance with ngrok header to skip browser warning
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },
})