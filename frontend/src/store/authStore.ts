import { create } from 'zustand'
import { api } from '../config/api'

export interface UserResponse {
  id: number
  full_name: string
  email: string
  role: string
  is_active: boolean
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

interface AuthState {
  user: UserResponse | null
  token: string | null
  isAuthenticated: boolean
  isOtpPending: boolean
  emailForOtp: string | null
  error: string | null
  isLoading: boolean

  // Actions
  setError: (error: string | null) => void
  signup: (fullName: string, email: string, password: string) => Promise<{ message: string }>
  verifySignupOtp: (email: string, otp: string) => Promise<TokenResponse>
  login: (email: string, password: string) => Promise<TokenResponse>
  verifyLoginOtp: (email: string, otp: string) => Promise<TokenResponse>
  fetchMe: () => Promise<UserResponse>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: sessionStorage.getItem('daruka_token'),
  isAuthenticated: !!sessionStorage.getItem('daruka_token'),
  isOtpPending: false,
  emailForOtp: null,
  error: null,
  isLoading: false,

  setError: (error) => set({ error }),

  signup: async (fullName, email, password) => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.post<{ message: string }>('/auth/signup', {
        full_name: fullName,
        email,
        password,
      })
      set({ isOtpPending: true, emailForOtp: email, isLoading: false })
      return response.data
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || 'Registration failed'
      set({ error: errMsg, isLoading: false })
      throw new Error(errMsg)
    }
  },

  verifySignupOtp: async (email, otp) => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.post<TokenResponse>('/auth/verify-otp', {
        email,
        otp,
      })
      const { access_token } = response.data
      sessionStorage.setItem('daruka_token', access_token)
      set({ token: access_token, isAuthenticated: true, isOtpPending: false, isLoading: false })
      
      // Load user profile information
      await get().fetchMe()
      return response.data
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || 'OTP Verification failed'
      set({ error: errMsg, isLoading: false })
      throw new Error(errMsg)
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      // POST /auth/login returns a temporary token (expires in 10 minutes)
      const response = await api.post<TokenResponse>('/auth/login', {
        email,
        password,
      })
      set({ isOtpPending: true, emailForOtp: email, isLoading: false })
      return response.data
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || 'Login failed'
      set({ error: errMsg, isLoading: false })
      throw new Error(errMsg)
    }
  },

  verifyLoginOtp: async (email, otp) => {
    set({ isLoading: true, error: null })
    try {
      // POST /auth/verify-login-otp returns the final access token
      const response = await api.post<TokenResponse>('/auth/verify-login-otp', {
        email,
        otp,
      })
      const { access_token } = response.data
      sessionStorage.setItem('daruka_token', access_token)
      set({ token: access_token, isAuthenticated: true, isOtpPending: false, isLoading: false })
      
      // Load user profile information
      await get().fetchMe()
      return response.data
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || 'Login OTP Verification failed'
      set({ error: errMsg, isLoading: false })
      throw new Error(errMsg)
    }
  },

  fetchMe: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.get<UserResponse>('/auth/me')
      set({ user: response.data, isAuthenticated: true, isLoading: false })
      return response.data
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || 'Failed to fetch user profile'
      // Clear session if we get an authorization error
      if (err.response?.status === 401) {
        get().logout()
      }
      set({ error: errMsg, isLoading: false })
      throw new Error(errMsg)
    }
  },

  logout: () => {
    sessionStorage.removeItem('daruka_token')
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isOtpPending: false,
      emailForOtp: null,
      error: null,
      isLoading: false,
    })
  },
}))
