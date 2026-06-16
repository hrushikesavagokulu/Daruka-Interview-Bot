import React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  type = 'text',
  disabled,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`
  
  const baseInputStyles = 'w-full px-3 py-2 border rounded-lg bg-lightGray text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent transition-colors'
  const stateStyles = error 
    ? 'border-danger focus:border-danger focus:ring-danger/20' 
    : 'border-border focus:border-accent'
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : ''

  const finalInputClass = `${baseInputStyles} ${stateStyles} ${disabledStyles} ${className}`

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-primary">
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        className={finalInputClass}
        disabled={disabled}
        {...props}
      />
      {error && (
        <span className="text-xs text-danger font-medium">{error}</span>
      )}
      {!error && helperText && (
        <span className="text-xs text-gray">{helperText}</span>
      )}
    </div>
  )
}
