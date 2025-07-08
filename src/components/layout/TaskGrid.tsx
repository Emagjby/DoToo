import React from 'react'
import TaskCard from '../TaskCard'
import type { Task } from '../../types'

interface TaskGridProps {
  tasks: Task[]
  onEdit: (task: Task) => void
}

export default function TaskGrid({ tasks, onEdit }: TaskGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={onEdit}
        />
      ))}
    </div>
  )
} 