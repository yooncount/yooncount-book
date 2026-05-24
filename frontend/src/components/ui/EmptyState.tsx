import React from 'react'
import type { LucideIcon } from 'lucide-react'
import Button from './Button'

interface EmptyStateProps {
  icon: LucideIcon
  message: string
  actionLabel?: string
  onAction?: () => void
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, message, actionLabel, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <Icon size={48} strokeWidth={1} className="mb-4" />
      <p className="text-sm mb-4">{message}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export default EmptyState
