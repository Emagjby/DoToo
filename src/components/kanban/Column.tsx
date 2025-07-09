import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Task } from '../../types'
import DraggableTaskCard from './DraggableTaskCard'
import Badge from '../ui/Badge'

interface ColumnProps {
  id: string
  title: string
  tasks: Task[]
  onEdit: (task: Task) => void
}

const columnTitles = {
  todo: 'To Do',
  doing: 'In Progress',
  done: 'Done',
}

export default function Column({ id, title, tasks, onEdit }: ColumnProps) {
  const { setNodeRef } = useDroppable({
    id,
  })

  return (
    <div className="flex flex-col h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground">
            {columnTitles[id as keyof typeof columnTitles] || title}
          </h3>
          <Badge variant="default" className="text-xs">
            {tasks.length}
          </Badge>
        </div>
      </div>

      {/* Column Content */}
      <div
        ref={setNodeRef}
        className="flex-1 p-4 border-2 border-border bg-muted/30 rounded-md min-h-[400px] transition-colors hover:border-border/80"
      >
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">No tasks</p>
          </div>
        ) : (
          <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {tasks.map((task) => (
                <DraggableTaskCard
                  key={task.id}
                  task={task}
                  onEdit={onEdit}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </div>
    </div>
  )
} 