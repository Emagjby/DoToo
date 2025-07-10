import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import type { Task } from '../../types'
import Column from './Column'
import TaskCard from '../TaskCard'
import useTodoStore from '../../stores/todoStore'

interface BoardProps {
  onEdit?: (task: Task) => void
}

export default function Board({ onEdit }: BoardProps) {
  const { filteredTasks, updateTaskStatus } = useTodoStore()
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const task = filteredTasks().find(t => t.id === event.active.id)
    if (task) {
      setActiveTask(task)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const taskId = active.id as string
      
      // Check if the drop target is a valid column
      const validColumns = ['todo', 'doing', 'done']
      if (validColumns.includes(over.id as string)) {
        const newStatus = over.id as 'todo' | 'doing' | 'done'
        updateTaskStatus(taskId, newStatus)
      }
      // If dropping on another task, find the column that contains that task
      else {
        const targetTask = filteredTasks().find(t => t.id === over.id)
        if (targetTask) {
          updateTaskStatus(taskId, targetTask.status)
        }
      }
    }

    setActiveTask(null)
  }

  const handleEdit = (task: Task) => {
    if (onEdit) {
      onEdit(task)
    }
  }

  // Group tasks by status
  const todoTasks = filteredTasks().filter(task => task.status === 'todo')
  const doingTasks = filteredTasks().filter(task => task.status === 'doing')
  const doneTasks = filteredTasks().filter(task => task.status === 'done')

  return (
    <div className="h-full">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
          <Column
            id="todo"
            title="To Do"
            tasks={todoTasks}
            onEdit={handleEdit}
          />
          <Column
            id="doing"
            title="In Progress"
            tasks={doingTasks}
            onEdit={handleEdit}
          />
          <Column
            id="done"
            title="Done"
            tasks={doneTasks}
            onEdit={handleEdit}
          />
        </div>

        <DragOverlay dropAnimation={null}>
          {activeTask ? (
            <TaskCard task={activeTask} onEdit={handleEdit} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
} 