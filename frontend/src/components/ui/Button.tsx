import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'text' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed'
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  }

  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-opacity-90',
    secondary: 'bg-light text-primary hover:bg-opacity-80',
    accent: 'bg-accent text-white hover:bg-opacity-90',
    outline: 'border border-border text-primary hover:bg-lightGray bg-transparent',
    text: 'text-primary hover:bg-lightGray bg-transparent',
    success: 'bg-success text-white hover:bg-opacity-90',
    warning: 'bg-warning text-white hover:bg-opacity-90',
    danger: 'bg-danger text-white hover:bg-opacity-90',
  }

  const classes = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`

  return (
    <button className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  )
}
