import React from 'react'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral'
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  className = '',
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border'
  
  const variantStyles = {
    primary: 'bg-primary text-white border-primary',
    secondary: 'bg-light text-primary border-border',
    accent: 'bg-accent text-white border-accent',
    success: 'bg-success/10 text-success border-success/30',
    warning: 'bg-warning/10 text-warning border-warning/30',
    danger: 'bg-danger/10 text-danger border-danger/30',
    neutral: 'bg-lightGray text-gray border-border',
  }

  const classes = `${baseStyles} ${variantStyles[variant]} ${className}`

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  )
}
