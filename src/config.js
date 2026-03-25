import axios from 'axios'

export const BASE_URL = 'https://102d-2401-4900-1c30-1cf2-493b-a63b-cbd4-32f9.ngrok-free.app'

// Axios instance with ngrok header to skip browser warning
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },
})