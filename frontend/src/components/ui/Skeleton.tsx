import React from 'react'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  ...props
}) => {
  return (
    <div
      className={`animate-pulse bg-mid/20 rounded-md ${className}`}
      {...props}
    />
  )
}
