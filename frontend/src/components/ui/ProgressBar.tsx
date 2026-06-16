import React from 'react'

export interface ProgressBarProps {
  value: number
  max?: number
  showValue?: boolean
  className?: string
  color?: 'primary' | 'accent' | 'success' | 'warning' | 'danger'
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  showValue = false,
  className = '',
  color = 'accent',
}) => {
  // Bound percentage between 0 and 100
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const colorClasses = {
    primary: 'bg-primary',
    accent: 'bg-accent',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
  }

  return (
    <div className={`w-full ${className}`}>
      {showValue && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-semibold text-primary">Progress</span>
          <span className="text-xs font-semibold text-primary">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="w-full bg-lightGray rounded-full h-2.5 overflow-hidden border border-border">
        <div
          className={`h-full rounded-full transition-all duration-300 ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
