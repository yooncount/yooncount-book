import React from 'react'

type BadgeVariant = 'income' | 'expense' | 'buy' | 'sell' | 'active' | 'inactive'

interface BadgeProps {
  variant: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  income: 'bg-green-100 text-green-700',
  expense: 'bg-red-100 text-red-700',
  buy: 'bg-blue-100 text-blue-700',
  sell: 'bg-orange-100 text-orange-700',
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-500',
}

const Badge: React.FC<BadgeProps> = ({ variant, children, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  )
}

export default Badge
