import React from 'react'
import { Plus } from 'lucide-react'
import Button from '../ui/Button'

interface EmptyStateProps {
  onNewTask: () => void
}

export default function EmptyState({ onNewTask }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="text-gray-400 dark:text-gray-500 mb-4">
        <Plus size={48} className="mx-auto" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        No tasks yet
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-4">
        Create your first task to get started
      </p>
      <Button onClick={onNewTask} size="md">
        <Plus size={16} />
        Create Task
      </Button>
    </div>
  )
} 