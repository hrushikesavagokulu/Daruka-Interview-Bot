import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { Loader2 } from 'lucide-react'

interface AuthContextType {
  isInitializing: boolean
}

const AuthContext = createContext<AuthContextType>({ isInitializing: true })

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitializing, setIsInitializing] = useState(true)
  const { token, fetchMe, logout } = useAuthStore()

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          await fetchMe()
        } catch (error) {
          console.error('Session restoration failed:', error)
          logout()
        }
      }
      setIsInitializing(false)
    }

    initializeAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#F2F3F4] flex flex-col items-center justify-center gap-4">
        <div className="flex flex-col items-center gap-2">
          <span className="text-4xl animate-bounce">🤖</span>
          <h1 className="text-2xl font-black text-[#1A3A5C] tracking-wide">Daruka</h1>
          <p className="text-xs text-[#555555]">Initializing secure session...</p>
        </div>
        <div className="flex items-center gap-2 text-[#2980B9] font-semibold mt-4">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-xs">Authenticating...</span>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ isInitializing }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
