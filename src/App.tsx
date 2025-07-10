import { useState, useEffect } from 'react'
import './App.css'
import Header from './components/layout/Header'
import TaskForm from './components/TaskForm'
import ViewContainer from './components/views/ViewContainer'
import CommandPalette from './components/CommandPalette'
import KeyboardShortcutsHelp from './components/KeyboardShortcutsHelp'
import DataManagement from './components/DataManagement'
import useTodoStore from './stores/todoStore'
import useProjectStore from './stores/projectStore'
import type { Task } from './types'
import { migrateToMultiProject, initializeDefaultProject } from './utils/migration'

function App() {
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [showDataManagement, setShowDataManagement] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined)

  // Get current project ID to filter tasks
  const { activeProject } = useProjectStore()
  
  // Store setup with filtered tasks
  const { tasks, isDarkMode } = useTodoStore()

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
    if (showCommandPalette) {
      setShowCommandPalette(false)
    }
    setEditingTask(undefined)
    setShowTaskForm(true)
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setShowTaskForm(true)
  }

  const handleCloseForm = () => {
    setShowTaskForm(false)
    setEditingTask(undefined)
  }

  // Keyboard shortcuts handlers
  const handleCloseCommandPalette = () => {
    setShowCommandPalette(false)
  }

  // Setup keyboard shortcuts
  useEffect(() => {
    const handleEditTaskEvent = (event: CustomEvent) => {
      setEditingTask(event.detail)
      setShowTaskForm(true)
    }

    window.addEventListener('new-task', () => handleNewTask())
    window.addEventListener('edit-task', handleEditTaskEvent as EventListener)

    return () => {
      window.removeEventListener('new-task', () => handleNewTask())
      window.removeEventListener('edit-task', handleEditTaskEvent as EventListener)
    }
  }, [])

  // Reset search expanded state when tasks array changes from empty to non-empty
  useEffect(() => {
    if (tasks.length === 0) {
      // setIsSearchExpanded(false) // This line is removed
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
          {/* SearchBar component was removed, so this section is now empty */}
          
          {/* Task Statistics */}
          {/* TaskStats component was removed, so this section is now empty */}
          
          {/* Task Views */}
          {activeProject() ? (
            tasks.length > 0 ? (
              <ViewContainer onEdit={handleEdit} />
            ) : (
              <ViewContainer onEdit={handleEdit} />
            )
          ) : (
            <ViewContainer onEdit={handleEdit} />
          )}
      </div>

        {/* Command Palette */}
        <CommandPalette 
          isOpen={showCommandPalette} 
          onClose={handleCloseCommandPalette}
          onOpenDataManagement={() => setShowDataManagement(true)}
        />

        {/* Data Management */}
        <DataManagement
          isOpen={showDataManagement}
          onClose={() => setShowDataManagement(false)}
        />

        {/* Keyboard Shortcuts Help */}
        <KeyboardShortcutsHelp />
      </main>

      {/* TaskForm */}
      <TaskForm
        task={editingTask}
        isOpen={showTaskForm}
        onClose={handleCloseForm}
      />
      </div>
  )
}

export default App
