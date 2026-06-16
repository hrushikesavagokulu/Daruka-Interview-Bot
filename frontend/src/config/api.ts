import axios from 'axios'

// Base URL from Vite env (set in docker-compose or .env)
const BASE_URL = (import.meta as any).env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — attach JWT token from sessionStorage
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('daruka_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('daruka_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)
