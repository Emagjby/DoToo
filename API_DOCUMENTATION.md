# DoToo API Documentation

> **Comprehensive API reference for DoToo - The Developer's Todo App**

This document provides detailed documentation for all public APIs, functions, and components in the DoToo application. Whether you're contributing to the project or integrating with its components, this guide will help you understand and use the available APIs effectively.

## Table of Contents

1. [TypeScript Types & Interfaces](#typescript-types--interfaces)
2. [State Management (Zustand Store)](#state-management-zustand-store)
3. [Data Management Service](#data-management-service)
4. [Custom Hooks](#custom-hooks)
5. [React Components](#react-components)
6. [Utility Functions](#utility-functions)
7. [Usage Examples](#usage-examples)

---

## TypeScript Types & Interfaces

### Core Types

#### `Priority`
```typescript
type Priority = 'low' | 'medium' | 'high' | 'critical'
```
Defines the priority levels for tasks.

#### `TaskStatus`
```typescript
type TaskStatus = 'todo' | 'doing' | 'done'
```
Represents the three possible states in the Kanban board.

#### `Category`
```typescript
type Category = 'feature' | 'bug' | 'docs' | 'refactor' | 'test' | 'chore'
```
Categories for organizing tasks by type.

### Main Interfaces

#### `Task`
```typescript
interface Task {
  id: string                    // Unique identifier (UUID)
  title: string                 // Task title
  description?: string          // Optional detailed description
  code?: string                 // Optional code snippet
  language?: string             // Programming language for syntax highlighting
  category: Category            // Task category
  priority: Priority            // Task priority level
  status: TaskStatus            // Current status in Kanban board
  createdAt: Date              // Creation timestamp
  dueDate?: Date               // Optional due date
  branchName?: string          // Auto-generated git branch name
  tags?: string[]              // Optional tags for filtering
}
```

**Usage Example:**
```typescript
const newTask: Task = {
  id: crypto.randomUUID(),
  title: "Implement user authentication",
  description: "Add JWT-based authentication system",
  category: "feature",
  priority: "high",
  status: "todo",
  createdAt: new Date(),
  code: "const auth = jwt.sign(payload, secret)",
  language: "javascript"
}
```

#### `SearchFilters`
```typescript
interface SearchFilters {
  query: string              // Text search query
  category?: Category        // Filter by category
  priority?: Priority        // Filter by priority
  status?: TaskStatus        // Filter by status
  tags?: string[]           // Filter by tags
  hasCode?: boolean         // Filter tasks with/without code
  hasDueDate?: boolean      // Filter tasks with/without due dates
  isOverdue?: boolean       // Filter overdue tasks
}
```

#### `CategoryInfo`
```typescript
interface CategoryInfo {
  value: Category
  label: string
  color: string
  icon: string
}
```

#### `PriorityInfo`
```typescript
interface PriorityInfo {
  value: Priority
  label: string
  color: string
}
```

---

## State Management (Zustand Store)

The application uses Zustand for state management with persistence. The store provides comprehensive task management functionality.

### Store Interface

```typescript
interface TodoState {
  // State
  tasks: Task[]
  searchFilters: SearchFilters
  selectedTask: Task | null
  isCommandPaletteOpen: boolean
  isDarkMode: boolean
  
  // Task Management Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  updateTaskStatus: (id: string, status: TaskStatus) => void
  
  // Search & Filter Actions
  setSearchFilters: (filters: Partial<SearchFilters>) => void
  clearFilters: () => void
  
  // UI State Actions
  setSelectedTask: (task: Task | null) => void
  toggleCommandPalette: () => void
  setCommandPaletteOpen: (open: boolean) => void
  toggleDarkMode: () => void
  
  // Computed Properties
  filteredTasks: () => Task[]
  tasksByStatus: (status: TaskStatus) => Task[]
}
```

### Usage Examples

#### Basic Task Operations
```typescript
import useTodoStore from './stores/todoStore'

function TaskManager() {
  const { 
    addTask, 
    updateTask, 
    deleteTask, 
    tasks 
  } = useTodoStore()

  // Add a new task
  const createTask = () => {
    addTask({
      title: "Fix login bug",
      category: "bug",
      priority: "high",
      status: "todo"
    })
  }

  // Update a task
  const updateTaskTitle = (id: string, newTitle: string) => {
    updateTask(id, { title: newTitle })
  }

  // Delete a task
  const removeTask = (id: string) => {
    deleteTask(id)
  }

  return (
    <div>
      {tasks.map(task => (
        <div key={task.id}>{task.title}</div>
      ))}
    </div>
  )
}
```

#### Search and Filtering
```typescript
function SearchExample() {
  const { 
    setSearchFilters, 
    clearFilters, 
    filteredTasks 
  } = useTodoStore()

  // Search for specific text
  const searchTasks = (query: string) => {
    setSearchFilters({ query })
  }

  // Filter by category and priority
  const filterByBugs = () => {
    setSearchFilters({ 
      category: 'bug', 
      priority: 'high' 
    })
  }

  // Clear all filters
  const resetFilters = () => {
    clearFilters()
  }

  const results = filteredTasks()
  
  return (
    <div>
      <input onChange={(e) => searchTasks(e.target.value)} />
      <button onClick={filterByBugs}>High Priority Bugs</button>
      <button onClick={resetFilters}>Clear Filters</button>
      {results.map(task => (
        <div key={task.id}>{task.title}</div>
      ))}
    </div>
  )
}
```

---

## Data Management Service

The `DataManager` class provides comprehensive data export, import, backup, and validation functionality.

### Class: `DataManager`

#### Export Operations

##### `exportData(): DataExport`
Exports all application data in JSON format.

```typescript
interface DataExport {
  version: string
  exportedAt: string
  tasks: Task[]
  settings: {
    isDarkMode: boolean
    searchFilters: SearchFilters
  }
}
```

**Usage:**
```typescript
import { dataManager } from './services/dataManager'

const exportAppData = () => {
  try {
    const exportData = dataManager.exportData()
    console.log(`Exported ${exportData.tasks.length} tasks`)
    return exportData
  } catch (error) {
    console.error('Export failed:', error)
  }
}
```

##### `exportAsCSV(): string`
Exports tasks in CSV format for spreadsheet applications.

```typescript
const exportToCSV = () => {
  const csvData = dataManager.exportAsCSV()
  dataManager.downloadFile(csvData, 'tasks.csv', 'text/csv')
}
```

#### Import Operations

##### `importData(data: DataExport): DataValidationResult`
Imports data with validation and automatic backup creation.

```typescript
interface DataValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  stats: {
    totalTasks: number
    validTasks: number
    invalidTasks: number
  }
}
```

**Usage:**
```typescript
const importAppData = (jsonData: DataExport) => {
  const result = dataManager.importData(jsonData)
  
  if (result.isValid) {
    console.log(`Successfully imported ${result.stats.validTasks} tasks`)
  } else {
    console.error('Import failed:', result.errors)
  }
  
  return result
}
```

#### Backup Operations

##### `createBackup(name?: string): BackupInfo`
Creates a backup with optional custom name.

```typescript
interface BackupInfo {
  id: string
  name: string
  createdAt: string
  taskCount: number
  size: number
}
```

##### `listBackups(): BackupInfo[]`
Returns all available backups sorted by creation date.

##### `restoreBackup(backupId: string): DataValidationResult`
Restores data from a specific backup.

**Usage:**
```typescript
// Create backup
const backup = dataManager.createBackup('Before major changes')

// List all backups
const backups = dataManager.listBackups()

// Restore from backup
const restoreResult = dataManager.restoreBackup(backup.id)
```

#### Utility Operations

##### `validateImportData(data: any): DataValidationResult`
Validates data structure without importing.

##### `getDataStats(): { taskCount: number; storageSize: number; lastModified: string }`
Returns current data statistics.

##### `cleanupOldBackups(): number`
Removes old backups (keeps latest 10), returns number of deleted backups.

##### `downloadFile(content: string, filename: string, mimeType: string): void`
Triggers file download in browser.

---

## Custom Hooks

### `useKeyboardShortcuts`

A hook that provides application-wide keyboard shortcuts.

#### Interface
```typescript
interface KeyboardShortcutsProps {
  onOpenCommandPalette: () => void
  onNewTask: () => void
  onToggleTheme: () => void
  onFocusSearch: () => void
  onOpenDataManagement: () => void
  onCloseAllModals: () => void
}
```

#### Keyboard Shortcuts
- `Cmd+K` / `Ctrl+K` - Open command palette
- `N` - Create new task
- `T` - Toggle theme
- `/` - Focus search
- `D` - Open data management
- `Escape` - Close all modals

#### Usage
```typescript
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'

function App() {
  const { toggleCommandPalette, toggleDarkMode } = useTodoStore()
  
  useKeyboardShortcuts({
    onOpenCommandPalette: toggleCommandPalette,
    onNewTask: () => console.log('Create new task'),
    onToggleTheme: toggleDarkMode,
    onFocusSearch: () => document.getElementById('search')?.focus(),
    onOpenDataManagement: () => console.log('Open data management'),
    onCloseAllModals: () => console.log('Close all modals')
  })

  return <div>Your app content</div>
}
```

---

## React Components

### UI Components

#### `Button`

A reusable button component with multiple variants and sizes.

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  children: React.ReactNode
}
```

**Usage:**
```tsx
<Button variant="default" size="lg" onClick={handleClick}>
  Save Task
</Button>

<Button variant="destructive" size="sm">
  Delete
</Button>

<Button variant="ghost" size="icon">
  <EditIcon />
</Button>
```

#### `Modal`

A flexible modal component with backdrop click handling.

```typescript
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
  showCloseButton?: boolean
}
```

**Usage:**
```tsx
<Modal 
  isOpen={isModalOpen} 
  onClose={() => setIsModalOpen(false)}
  title="Edit Task"
  showCloseButton={true}
>
  <TaskForm task={selectedTask} />
</Modal>
```

#### `Badge`

A badge component for displaying categories, priorities, and tags.

**Usage:**
```tsx
<Badge variant="default">Feature</Badge>
<Badge variant="destructive">High Priority</Badge>
```

### Feature Components

#### `TaskForm`

A comprehensive form for creating and editing tasks.

```typescript
interface TaskFormProps {
  task?: Task          // Existing task for editing (optional)
  isOpen: boolean      // Modal visibility
  onClose: () => void  // Close handler
}
```

**Features:**
- Rich text editor for descriptions
- Monaco editor for code snippets
- Language selection for syntax highlighting
- Category and priority selection
- Due date picker
- Tag management
- Auto-generated git branch names

**Usage:**
```tsx
<TaskForm 
  task={editingTask}
  isOpen={isFormOpen}
  onClose={() => setIsFormOpen(false)}
/>
```

#### `TaskCard`

Displays individual task information with actions.

```typescript
interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
}
```

**Features:**
- Task title and description
- Category and priority badges
- Code snippet preview
- Due date display
- Edit and delete actions
- Copy branch name functionality

**Usage:**
```tsx
<TaskCard 
  task={task}
  onEdit={(task) => openEditModal(task)}
/>
```

#### `SearchBar`

Advanced search and filtering component.

```typescript
interface SearchBarProps {
  onToggleExpanded?: (expanded: boolean) => void
  onCloseDropdowns?: () => void
}
```

**Features:**
- Text search across title, description, and tags
- Category, priority, and status filters
- Advanced filters (due date, code presence, overdue)
- Filter badges and quick clear

**Usage:**
```tsx
<SearchBar 
  onToggleExpanded={(expanded) => setSearchExpanded(expanded)}
  onCloseDropdowns={() => closeAllDropdowns()}
/>
```

#### `CommandPalette`

Quick action and navigation interface.

```typescript
interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onOpenDataManagement: () => void
}
```

**Features:**
- Fuzzy search for tasks
- Quick actions (create, edit, delete)
- Filtering shortcuts
- Theme toggle
- Data management access

**Usage:**
```tsx
<CommandPalette
  isOpen={paletteOpen}
  onClose={() => setPaletteOpen(false)}
  onOpenDataManagement={() => setDataModalOpen(true)}
/>
```

### Kanban Components

#### `Board`

Main Kanban board with drag-and-drop functionality.

```typescript
interface BoardProps {
  onEdit?: (task: Task) => void
}
```

**Features:**
- Three-column layout (Todo, Doing, Done)
- Drag-and-drop task movement
- Real-time updates
- Filtered task display

**Usage:**
```tsx
<Board onEdit={(task) => openTaskEditor(task)} />
```

#### `Column`

Individual Kanban column component.

```typescript
interface ColumnProps {
  id: string
  title: string
  tasks: Task[]
  onEdit: (task: Task) => void
}
```

#### `DraggableTaskCard`

Wrapper for TaskCard with drag-and-drop functionality.

```typescript
interface DraggableTaskCardProps {
  task: Task
  onEdit: (task: Task) => void
}
```

### Layout Components

#### `Header`

Application header with logo and theme toggle.

#### `EmptyState`

Displays when no tasks are available.

#### `TaskGrid`

Grid layout for task display in list view.

---

## Utility Functions

### `cn(...inputs: ClassValue[]): string`

Utility for merging Tailwind CSS classes with conflict resolution.

```typescript
import { cn } from './lib/utils'

// Merge classes with conflict resolution
const className = cn(
  'px-4 py-2',
  'bg-blue-500 hover:bg-blue-600',
  isActive && 'bg-green-500'
)
```

### `generateBranchName(title: string): string`

Generates git-friendly branch names from task titles.

```typescript
import { generateBranchName } from './lib/utils'

const branchName = generateBranchName("Fix login bug with special chars!")
// Returns: "fix-login-bug-with-special-chars"
```

**Rules:**
- Converts to lowercase
- Removes special characters
- Replaces spaces with hyphens
- Limits to 50 characters
- Removes leading/trailing hyphens

### `formatDate(date: Date | string): string`

Formats dates for display with locale-aware formatting.

```typescript
import { formatDate } from './lib/utils'

const formatted = formatDate(new Date())
// Returns: "Dec 15, 02:30 PM"

const fromString = formatDate("2024-12-15T14:30:00Z")
// Returns: "Dec 15, 02:30 PM"
```

---

## Usage Examples

### Complete Task Management Example

```typescript
import React, { useState } from 'react'
import useTodoStore from './stores/todoStore'
import TaskForm from './components/TaskForm'
import TaskCard from './components/TaskCard'
import SearchBar from './components/SearchBar'
import Board from './components/kanban/Board'

function TaskManager() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  
  const { 
    tasks, 
    filteredTasks, 
    addTask, 
    updateTask,
    deleteTask 
  } = useTodoStore()

  const handleCreateTask = () => {
    setEditingTask(null)
    setIsFormOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingTask(null)
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Task Manager</h1>
        <div className="flex gap-2">
          <button onClick={handleCreateTask}>
            New Task
          </button>
          <button onClick={() => setViewMode(viewMode === 'kanban' ? 'list' : 'kanban')}>
            Toggle View
          </button>
        </div>
      </div>

      {/* Search */}
      <SearchBar />

      {/* Content */}
      {viewMode === 'kanban' ? (
        <Board onEdit={handleEditTask} />
      ) : (
        <div className="grid gap-4">
          {filteredTasks().map(task => (
            <TaskCard 
              key={task.id}
              task={task}
              onEdit={handleEditTask}
            />
          ))}
        </div>
      )}

      {/* Task Form Modal */}
      <TaskForm
        task={editingTask}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
      />
    </div>
  )
}

export default TaskManager
```

### Data Export/Import Example

```typescript
import React from 'react'
import { dataManager } from './services/dataManager'

function DataManagement() {
  const handleExport = () => {
    try {
      const data = dataManager.exportData()
      const jsonString = JSON.stringify(data, null, 2)
      dataManager.downloadFile(
        jsonString, 
        `dotoo-export-${new Date().toISOString().split('T')[0]}.json`,
        'application/json'
      )
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string)
        const result = dataManager.importData(importData)
        
        if (result.isValid) {
          alert(`Successfully imported ${result.stats.validTasks} tasks`)
          window.location.reload() // Refresh to show imported data
        } else {
          alert(`Import failed: ${result.errors.join(', ')}`)
        }
      } catch (error) {
        alert('Invalid JSON file')
      }
    }
    reader.readAsText(file)
  }

  const handleCreateBackup = () => {
    const backup = dataManager.createBackup()
    alert(`Backup created: ${backup.name}`)
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Data Management</h2>
      
      <div className="space-y-4">
        <button onClick={handleExport}>
          Export Data
        </button>
        
        <div>
          <label className="block mb-2">Import Data:</label>
          <input 
            type="file" 
            accept=".json"
            onChange={handleImport}
          />
        </div>
        
        <button onClick={handleCreateBackup}>
          Create Backup
        </button>
      </div>
    </div>
  )
}
```

### Advanced Filtering Example

```typescript
import React from 'react'
import useTodoStore from './stores/todoStore'

function AdvancedFiltering() {
  const { 
    setSearchFilters, 
    clearFilters, 
    filteredTasks,
    tasks
  } = useTodoStore()

  // Find overdue tasks
  const findOverdueTasks = () => {
    setSearchFilters({ isOverdue: true })
  }

  // Find high priority bugs
  const findCriticalBugs = () => {
    setSearchFilters({ 
      category: 'bug', 
      priority: 'critical' 
    })
  }

  // Find tasks with code
  const findTasksWithCode = () => {
    setSearchFilters({ hasCode: true })
  }

  // Find tasks due this week
  const findTasksDueThisWeek = () => {
    const oneWeekFromNow = new Date()
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7)
    
    setSearchFilters({ hasDueDate: true })
    // Note: More complex date filtering would require custom logic
  }

  const results = filteredTasks()
  const stats = {
    total: tasks.length,
    filtered: results.length,
    overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length,
    withCode: tasks.filter(t => t.code).length
  }

  return (
    <div>
      <div className="mb-4">
        <h3>Quick Filters</h3>
        <div className="flex gap-2">
          <button onClick={findOverdueTasks}>
            Overdue ({stats.overdue})
          </button>
          <button onClick={findCriticalBugs}>
            Critical Bugs
          </button>
          <button onClick={findTasksWithCode}>
            With Code ({stats.withCode})
          </button>
          <button onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      </div>

      <div className="mb-4">
        <p>Showing {stats.filtered} of {stats.total} tasks</p>
      </div>

      <div>
        {results.map(task => (
          <div key={task.id} className="border p-2 mb-2">
            <h4>{task.title}</h4>
            <p>Category: {task.category} | Priority: {task.priority}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## Best Practices

### State Management
- Use the store's computed properties (`filteredTasks`, `tasksByStatus`) instead of filtering manually
- Batch related updates when possible
- Use the persistence feature for user preferences

### Component Props
- Keep component interfaces minimal and focused
- Use TypeScript interfaces for all prop types
- Provide default values for optional props

### Error Handling
- Always validate data before importing
- Use try-catch blocks for data operations
- Provide meaningful error messages to users

### Performance
- Use React.memo for expensive components
- Debounce search input changes
- Lazy load large datasets

### Accessibility
- Include proper ARIA labels
- Ensure keyboard navigation works
- Test with screen readers

---

*This documentation covers all public APIs in DoToo v1.0.0. For the latest updates, check the source code and component implementations.*