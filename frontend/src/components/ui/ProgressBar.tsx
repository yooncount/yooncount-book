import React from 'react'

interface ProgressBarProps {
  value: number
  className?: string
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, className = '' }) => {
  const clamped = Math.min(Math.max(value, 0), 200)
  const display = Math.min(clamped, 100)

  const color =
    value >= 100
      ? 'bg-red-500'
      : value >= 80
      ? 'bg-yellow-400'
      : 'bg-green-500'

  return (
    <div className={`w-full bg-gray-100 rounded-full h-2.5 overflow-hidden ${className}`}>
      <div
        className={`h-2.5 rounded-full transition-all duration-300 ${color}`}
        style={{ width: `${display}%` }}
      />
    </div>
  )
}

export default ProgressBar
