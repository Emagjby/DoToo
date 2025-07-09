import { useState, useEffect } from 'react'
import TaskForm from './components/TaskForm'
import Header from './components/layout/Header'
import EmptyState from './components/layout/EmptyState'
import Board from './components/kanban/Board'
import SearchBar from './components/SearchBar'
import SearchResults from './components/SearchResults'
import TaskStats from './components/TaskStats'
import useTodoStore from './stores/todoStore'
import type { Task } from './types'
import './App.css'

function App() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined)
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const { tasks, filteredTasks, isDarkMode } = useTodoStore()

  // Apply dark mode to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

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
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <Header 
        onNewTask={handleNewTask}
        taskCount={tasks.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 px-6 py-6">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Search and Filters */}
          <SearchBar onToggleExpanded={setIsSearchExpanded} />
          
          {/* Task Statistics */}
          <TaskStats isSearchExpanded={isSearchExpanded} />
          
          {/* Task Board */}
          {tasks.length > 0 ? (
            <Board onEdit={handleEdit} />
          ) : (
            <EmptyState onNewTask={handleNewTask} />
          )}
        </div>
      </main>

      {/* TaskForm */}
      <TaskForm
        task={editingTask}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
      />
    </div>
  )
}

export default App
