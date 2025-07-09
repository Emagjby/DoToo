import { useState, useEffect } from 'react'
import TaskForm from './components/TaskForm'
import Header from './components/layout/Header'
import EmptyState from './components/layout/EmptyState'
import Board from './components/kanban/Board'
import SearchBar from './components/SearchBar'
import SearchResults from './components/SearchResults'
import TaskStats from './components/TaskStats'
import CommandPalette from './components/CommandPalette'
import KeyboardShortcutsHelp from './components/KeyboardShortcutsHelp'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import useTodoStore from './stores/todoStore'
import type { Task } from './types'
import './App.css'
import { useRef } from 'react'

function App() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined)
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const { tasks, filteredTasks, isDarkMode, toggleDarkMode } = useTodoStore()
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Apply dark mode to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const handleNewTask = () => {
    // Close command palette if it's open
    if (isCommandPaletteOpen) {
      setIsCommandPaletteOpen(false)
    }
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

  // Keyboard shortcuts handlers
  const handleOpenCommandPalette = () => {
    setIsCommandPaletteOpen(true)
  }

  const handleCloseCommandPalette = () => {
    setIsCommandPaletteOpen(false)
  }

  const handleFocusSearch = () => {
    // First expand the search if it's not already expanded
    if (!isSearchExpanded) {
      setIsSearchExpanded(true)
      // Focus after the search is expanded and rendered
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 200) // 200ms delay to ensure expansion animation completes
    } else {
      // If already expanded, focus immediately
      searchInputRef.current?.focus()
    }
  }

  // Setup keyboard shortcuts
  useKeyboardShortcuts({
    onOpenCommandPalette: handleOpenCommandPalette,
    onNewTask: handleNewTask,
    onToggleTheme: toggleDarkMode,
    onFocusSearch: handleFocusSearch,
  })

  // Listen for custom events from command palette
  useEffect(() => {
    const handleNewTaskEvent = () => {
      handleNewTask()
    }

    const handleEditTaskEvent = (event: CustomEvent) => {
      setEditingTask(event.detail)
      setIsFormOpen(true)
    }

    window.addEventListener('new-task', handleNewTaskEvent)
    window.addEventListener('edit-task', handleEditTaskEvent as EventListener)

    return () => {
      window.removeEventListener('new-task', handleNewTaskEvent)
      window.removeEventListener('edit-task', handleEditTaskEvent as EventListener)
    }
  }, [])

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
          <SearchBar onToggleExpanded={setIsSearchExpanded} ref={searchInputRef} />
          
          {/* Task Statistics */}
          <TaskStats isSearchExpanded={isSearchExpanded} />
          
          {/* Task Board */}
          {tasks.length > 0 ? (
            <Board onEdit={handleEdit} />
          ) : (
            <EmptyState onNewTask={handleNewTask} />
          )}
        </div>

        {/* Command Palette */}
        <CommandPalette 
          isOpen={isCommandPaletteOpen} 
          onClose={handleCloseCommandPalette} 
        />

        {/* Keyboard Shortcuts Help */}
        <KeyboardShortcutsHelp />
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
