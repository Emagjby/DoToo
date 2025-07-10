import { useState, useEffect } from 'react'
import TaskForm from './components/TaskForm'
import Header from './components/layout/Header'
import EmptyState from './components/layout/EmptyState'
import ViewContainer from './components/views/ViewContainer'
import SearchBar from './components/SearchBar'
import SearchResults from './components/SearchResults'
import TaskStats from './components/TaskStats'
import CommandPalette from './components/CommandPalette'
import KeyboardShortcutsHelp from './components/KeyboardShortcutsHelp'
import DataManagement from './components/DataManagement'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import useTodoStore from './stores/todoStore'
import useProjectStore from './stores/projectStore'
import type { Task } from './types'
import { migrateToMultiProject, initializeDefaultProject } from './utils/migration'
import './App.css'
import { useRef } from 'react'

function App() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined)
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [isDataManagementOpen, setIsDataManagementOpen] = useState(false)
  const { tasks, filteredTasks, isDarkMode, toggleDarkMode } = useTodoStore()
  const { activeProject } = useProjectStore()
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Apply dark mode to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  // Initialize multi-project system
  useEffect(() => {
    // Run migration for existing data
    migrateToMultiProject()
    
    // Initialize default project if none exist
    initializeDefaultProject()
  }, [])

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
    // Reset search expanded state when form closes to prevent layout issues
    setIsSearchExpanded(false)
  }

  // Keyboard shortcuts handlers
  const handleOpenCommandPalette = () => {
    setIsCommandPaletteOpen(true)
  }

  const handleCloseCommandPalette = () => {
    setIsCommandPaletteOpen(false)
  }

  const handleCloseAllModals = () => {
    setIsCommandPaletteOpen(false)
    setIsDataManagementOpen(false)
    setIsFormOpen(false)
    setIsSearchExpanded(false)
    setEditingTask(undefined)
    
    // Close SearchBar dropdowns
    if ((window as any).closeSearchDropdowns) {
      (window as any).closeSearchDropdowns()
    }
    
    // Close TaskForm dropdowns
    if ((window as any).closeTaskFormDropdowns) {
      (window as any).closeTaskFormDropdowns()
    }
    
    // Close Keyboard Shortcuts Help
    if ((window as any).closeKeyboardHelp) {
      (window as any).closeKeyboardHelp()
    }
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
    onOpenDataManagement: () => setIsDataManagementOpen(true),
    onCloseAllModals: handleCloseAllModals,
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

  // Reset search expanded state when tasks array changes from empty to non-empty
  useEffect(() => {
    if (tasks.length === 0) {
      setIsSearchExpanded(false)
    }
  }, [tasks.length])

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
          
          {/* Task Views */}
          {activeProject() ? (
            tasks.length > 0 ? (
              <ViewContainer onEdit={handleEdit} />
            ) : (
              <EmptyState onNewTask={handleNewTask} />
            )
          ) : (
            <EmptyState onNewTask={handleNewTask} />
          )}
      </div>

        {/* Command Palette */}
        <CommandPalette 
          isOpen={isCommandPaletteOpen} 
          onClose={handleCloseCommandPalette}
          onOpenDataManagement={() => setIsDataManagementOpen(true)}
        />

        {/* Data Management */}
        <DataManagement
          isOpen={isDataManagementOpen}
          onClose={() => setIsDataManagementOpen(false)}
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
