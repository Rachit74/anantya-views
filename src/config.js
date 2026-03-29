import axios from 'axios'

export const BASE_URL = 'http://127.0.0.1:8000'

// Axios instance with ngrok header to skip browser warning
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },
})