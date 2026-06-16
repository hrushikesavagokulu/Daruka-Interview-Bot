import React, { useEffect } from 'react'
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react'

export interface ToastProps {
  message: string
  type?: 'success' | 'warning' | 'error' | 'info'
  onClose: () => void
  duration?: number
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  onClose,
  duration = 5000,
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-success" />,
    warning: <AlertTriangle className="w-5 h-5 text-warning" />,
    error: <AlertCircle className="w-5 h-5 text-danger" />,
    info: <Info className="w-5 h-5 text-accent" />,
  }

  const borderColors = {
    success: 'border-success bg-white',
    warning: 'border-warning bg-white',
    error: 'border-danger bg-white',
    info: 'border-accent bg-white',
  }

  return (
    <div className={`flex items-start gap-3 p-4 border-l-4 rounded-r-xl shadow-lg border border-border ${borderColors[type]} max-w-sm w-full animate-in fade-in slide-in-from-top-4 duration-300`}>
      <div className="flex-shrink-0 mt-0.5">
        {icons[type]}
      </div>
      <div className="flex-grow">
        <p className="text-sm font-medium text-primary leading-tight">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-gray hover:text-primary transition-colors focus:outline-none"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
