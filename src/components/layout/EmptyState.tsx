import React from 'react'
import { Plus } from 'lucide-react'
import Button from '../ui/Button'

interface EmptyStateProps {
  onNewTask: () => void
}

export default function EmptyState({ onNewTask }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <div className="text-muted-foreground mb-4">
        <Plus size={48} className="mx-auto" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">
        No tasks yet
      </h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Create your first task to get started with your project management
      </p>
      <Button onClick={onNewTask} size="default" className="gap-2">
        <Plus size={16} />
        Create Task
      </Button>
    </div>
  )
} 