import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
}

export const Card: React.FC<CardProps> = ({
  hoverable = false,
  className = '',
  children,
  ...props
}) => {
  const baseStyles = 'bg-white border border-border rounded-xl p-5 shadow-sm transition-all duration-200'
  const hoverStyles = hoverable ? 'hover:shadow-md hover:-translate-y-0.5' : ''
  const classes = `${baseStyles} ${hoverStyles} ${className}`

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div className={`border-b border-border pb-3 mb-4 ${className}`} {...props}>
      {children}
    </div>
  )
}

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <h3 className={`text-lg font-bold text-primary ${className}`} {...props}>
      {children}
    </h3>
  )
}

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  )
}

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div className={`border-t border-border pt-3 mt-4 flex items-center justify-end gap-2 ${className}`} {...props}>
      {children}
    </div>
  )
}
