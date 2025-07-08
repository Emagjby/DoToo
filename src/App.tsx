import { useState } from 'react'
import TaskForm from './components/TaskForm'
import Header from './components/layout/Header'
import EmptyState from './components/layout/EmptyState'
import TaskGrid from './components/layout/TaskGrid'
import useTodoStore from './stores/todoStore'
import type { Task } from './types'
import './App.css'

function App() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined)
  const { tasks } = useTodoStore()

  const handleNewTask = () => {
    setEditingTask(undefined)
    setIsFormOpen(true)
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingTask(undefined)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6">
        <Header 
          onNewTask={handleNewTask}
          taskCount={tasks.length}
        />

        {/* Task Content */}
        {tasks.length > 0 ? (
          <TaskGrid tasks={tasks} onEdit={handleEdit} />
        ) : (
          <EmptyState onNewTask={handleNewTask} />
        )}

        {/* TaskForm */}
        <TaskForm
          task={editingTask}
          isOpen={isFormOpen}
          onClose={handleCloseForm}
        />
      </div>
    </div>
  )
}

export default App
