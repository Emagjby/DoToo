import React from 'react'
import { Plus } from 'lucide-react'
import Button from '../ui/Button'

interface HeaderProps {
  onNewTask: () => void
  taskCount: number
}

export default function Header({ onNewTask, taskCount }: HeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          DoToo 🚀
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {taskCount} task{taskCount !== 1 ? 's' : ''}
        </p>
      </div>
      <Button onClick={onNewTask} size="md">
        <Plus size={16} />
        New Task
      </Button>
    </div>
  )
} 