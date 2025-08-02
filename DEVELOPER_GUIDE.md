# DoToo Developer Guide

> **Complete guide for developers working with DoToo's APIs and components**

This guide provides comprehensive information for developers who want to integrate with, extend, or contribute to the DoToo application. It covers integration patterns, customization options, testing strategies, and best practices.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Architecture Overview](#architecture-overview)
3. [Integration Patterns](#integration-patterns)
4. [Customization Guide](#customization-guide)
5. [Testing Strategies](#testing-strategies)
6. [Performance Optimization](#performance-optimization)
7. [Extension Points](#extension-points)
8. [Deployment Guide](#deployment-guide)
9. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager
- TypeScript 5.0+ knowledge
- React 18+ experience
- Tailwind CSS familiarity

### Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd DoToo

# Install dependencies
npm install

# Start development server
npm run dev

# Run type checking
npm run build

# Run linting
npm run lint
```

### Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Base UI components
│   ├── kanban/         # Kanban-specific components
│   ├── layout/         # Layout components
│   └── *.tsx           # Feature components
├── hooks/              # Custom React hooks
├── services/           # Business logic and APIs
├── stores/             # State management (Zustand)
├── types/              # TypeScript type definitions
├── lib/                # Utility functions
└── assets/             # Static assets
```

### Tech Stack Details

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite 7.0
- **Styling**: Tailwind CSS 3.4
- **State Management**: Zustand 5.0 with persistence
- **Drag & Drop**: @dnd-kit suite
- **Code Editor**: Monaco Editor (VS Code editor)
- **Icons**: Lucide React
- **Command Interface**: cmdk
- **Syntax Highlighting**: react-syntax-highlighter

---

## Architecture Overview

### State Management Architecture

DoToo uses Zustand for state management with the following patterns:

```typescript
// Store structure
interface TodoState {
  // Data layer
  tasks: Task[]
  
  // UI state
  searchFilters: SearchFilters
  selectedTask: Task | null
  isCommandPaletteOpen: boolean
  isDarkMode: boolean
  
  // Actions (pure functions)
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  
  // Computed values (derived state)
  filteredTasks: () => Task[]
  tasksByStatus: (status: TaskStatus) => Task[]
}
```

### Component Architecture

```
App (root)
├── Header (global nav)
├── SearchBar (filtering)
├── Board (kanban view)
│   ├── Column (status columns)
│   └── DraggableTaskCard (individual tasks)
├── TaskForm (modal for CRUD)
├── CommandPalette (quick actions)
└── DataManagement (import/export)
```

### Data Flow Patterns

1. **User Action** → Component Event Handler
2. **Event Handler** → Store Action
3. **Store Action** → State Update
4. **State Update** → Component Re-render
5. **Persistence** → localStorage (automatic)

---

## Integration Patterns

### Using DoToo Components in Your Project

#### 1. Individual Component Integration

```typescript
import { TaskCard, Button, Modal } from '@dotoo/components'
import { Task } from '@dotoo/types'

function MyTaskList({ tasks }: { tasks: Task[] }) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  
  return (
    <div>
      {tasks.map(task => (
        <TaskCard 
          key={task.id}
          task={task}
          onEdit={setSelectedTask}
        />
      ))}
      
      <Modal 
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        title="Edit Task"
      >
        {selectedTask && (
          <TaskForm 
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
          />
        )}
      </Modal>
    </div>
  )
}
```

#### 2. Store Integration

```typescript
import { useTodoStore } from '@dotoo/stores'

function CustomTaskManager() {
  const { 
    tasks, 
    addTask, 
    filteredTasks,
    setSearchFilters 
  } = useTodoStore()
  
  // Use store actions and computed values
  const handleCreateTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    addTask(taskData)
  }
  
  const searchTasks = (query: string) => {
    setSearchFilters({ query })
  }
  
  return (
    <div>
      <input 
        placeholder="Search tasks..."
        onChange={(e) => searchTasks(e.target.value)}
      />
      {filteredTasks().map(task => (
        <div key={task.id}>{task.title}</div>
      ))}
    </div>
  )
}
```

#### 3. Service Layer Integration

```typescript
import { dataManager } from '@dotoo/services'

function BackupManager() {
  const [backups, setBackups] = useState([])
  
  useEffect(() => {
    setBackups(dataManager.listBackups())
  }, [])
  
  const createBackup = async () => {
    const backup = dataManager.createBackup('Manual backup')
    setBackups(prev => [backup, ...prev])
  }
  
  const exportData = () => {
    const data = dataManager.exportData()
    const jsonString = JSON.stringify(data, null, 2)
    dataManager.downloadFile(
      jsonString,
      `tasks-${new Date().toISOString()}.json`,
      'application/json'
    )
  }
  
  return (
    <div>
      <button onClick={createBackup}>Create Backup</button>
      <button onClick={exportData}>Export Data</button>
      
      <ul>
        {backups.map(backup => (
          <li key={backup.id}>
            {backup.name} - {backup.taskCount} tasks
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### Custom Hook Integration

```typescript
import { useKeyboardShortcuts } from '@dotoo/hooks'

function MyApp() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  useKeyboardShortcuts({
    onOpenCommandPalette: () => console.log('Open palette'),
    onNewTask: () => setIsModalOpen(true),
    onToggleTheme: () => document.body.classList.toggle('dark'),
    onFocusSearch: () => document.getElementById('search')?.focus(),
    onOpenDataManagement: () => console.log('Open data management'),
    onCloseAllModals: () => setIsModalOpen(false)
  })
  
  return <div>Your app content</div>
}
```

---

## Customization Guide

### Theme Customization

#### 1. CSS Custom Properties

```css
/* Custom theme */
:root {
  --primary: 220 100% 50%;        /* Blue primary */
  --secondary: 220 20% 95%;       /* Light gray */
  --accent: 45 100% 60%;          /* Yellow accent */
  --destructive: 0 100% 50%;      /* Red for destructive actions */
  --background: 0 0% 100%;        /* White background */
  --foreground: 220 20% 10%;      /* Dark text */
}

.dark {
  --primary: 220 100% 60%;
  --background: 220 20% 10%;
  --foreground: 0 0% 95%;
}
```

#### 2. Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'hsl(var(--primary))',
        secondary: 'hsl(var(--secondary))',
        accent: 'hsl(var(--accent))',
        destructive: 'hsl(var(--destructive))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        
        // Custom brand colors
        brand: {
          50: '#f0f9ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    }
  }
}
```

### Component Customization

#### 1. Extending Button Component

```typescript
// custom-button.tsx
import { Button, ButtonProps } from '@dotoo/components'
import { cn } from '@dotoo/lib/utils'

interface CustomButtonProps extends ButtonProps {
  gradient?: boolean
  pulse?: boolean
}

export function CustomButton({ 
  gradient, 
  pulse, 
  className, 
  ...props 
}: CustomButtonProps) {
  return (
    <Button
      className={cn(
        gradient && 'bg-gradient-to-r from-blue-500 to-purple-600',
        pulse && 'animate-pulse',
        className
      )}
      {...props}
    />
  )
}
```

#### 2. Custom Task Categories

```typescript
// types/custom-categories.ts
export type CustomCategory = 
  | 'feature' 
  | 'bug' 
  | 'docs' 
  | 'refactor' 
  | 'test' 
  | 'chore'
  | 'research'     // Custom category
  | 'design'       // Custom category
  | 'deployment'   // Custom category

// components/custom-category-config.tsx
export const customCategoryConfig: Record<CustomCategory, CategoryInfo> = {
  ...defaultCategoryConfig,
  research: {
    value: 'research',
    label: 'Research',
    color: 'bg-indigo-500',
    icon: '🔍'
  },
  design: {
    value: 'design',
    label: 'Design',
    color: 'bg-pink-500',
    icon: '🎨'
  },
  deployment: {
    value: 'deployment',
    label: 'Deployment',
    color: 'bg-emerald-500',
    icon: '🚀'
  }
}
```

#### 3. Custom Task Fields

```typescript
// types/extended-task.ts
export interface ExtendedTask extends Task {
  estimatedHours?: number
  assignee?: string
  epic?: string
  labels?: string[]
  dependencies?: string[]
}

// stores/extended-todo-store.ts
interface ExtendedTodoState extends TodoState {
  tasks: ExtendedTask[]
  
  updateTaskEstimate: (id: string, hours: number) => void
  assignTask: (id: string, assignee: string) => void
  linkTasks: (parentId: string, childId: string) => void
}
```

### Custom Validation Rules

```typescript
// services/custom-validation.ts
export interface CustomValidationRule {
  field: keyof Task
  validator: (value: any) => string | null
  message: string
}

export const customValidationRules: CustomValidationRule[] = [
  {
    field: 'title',
    validator: (title: string) => 
      title.length < 5 ? 'Title too short' : null,
    message: 'Title must be at least 5 characters'
  },
  {
    field: 'dueDate',
    validator: (date: Date) => 
      date < new Date() ? 'Due date in past' : null,
    message: 'Due date must be in the future'
  }
]

export function validateTaskWithCustomRules(task: Partial<Task>): string[] {
  const errors: string[] = []
  
  customValidationRules.forEach(rule => {
    const value = task[rule.field]
    const error = rule.validator(value)
    if (error) {
      errors.push(rule.message)
    }
  })
  
  return errors
}
```

---

## Testing Strategies

### Unit Testing Components

```typescript
// __tests__/components/TaskCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { TaskCard } from '@/components/TaskCard'
import { mockTask } from '@/test-utils/fixtures'

describe('TaskCard', () => {
  const mockOnEdit = jest.fn()
  
  beforeEach(() => {
    mockOnEdit.mockClear()
  })
  
  it('renders task information correctly', () => {
    render(<TaskCard task={mockTask} onEdit={mockOnEdit} />)
    
    expect(screen.getByText(mockTask.title)).toBeInTheDocument()
    expect(screen.getByText(mockTask.category)).toBeInTheDocument()
    expect(screen.getByText(mockTask.priority)).toBeInTheDocument()
  })
  
  it('calls onEdit when edit button is clicked', () => {
    render(<TaskCard task={mockTask} onEdit={mockOnEdit} />)
    
    fireEvent.click(screen.getByRole('button', { name: /edit/i }))
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockTask)
  })
  
  it('displays code snippet when present', () => {
    const taskWithCode = { ...mockTask, code: 'console.log("test")' }
    render(<TaskCard task={taskWithCode} onEdit={mockOnEdit} />)
    
    expect(screen.getByText('console.log("test")')).toBeInTheDocument()
  })
})
```

### Integration Testing Store

```typescript
// __tests__/stores/todoStore.test.ts
import { act, renderHook } from '@testing-library/react'
import { useTodoStore } from '@/stores/todoStore'
import { mockTask } from '@/test-utils/fixtures'

describe('useTodoStore', () => {
  beforeEach(() => {
    // Clear store before each test
    useTodoStore.setState({ tasks: [] })
  })
  
  it('adds task correctly', () => {
    const { result } = renderHook(() => useTodoStore())
    
    act(() => {
      result.current.addTask({
        title: 'Test task',
        category: 'feature',
        priority: 'medium',
        status: 'todo'
      })
    })
    
    expect(result.current.tasks).toHaveLength(1)
    expect(result.current.tasks[0].title).toBe('Test task')
  })
  
  it('filters tasks correctly', () => {
    const { result } = renderHook(() => useTodoStore())
    
    // Add multiple tasks
    act(() => {
      result.current.addTask({ ...mockTask, category: 'bug' })
      result.current.addTask({ ...mockTask, category: 'feature' })
    })
    
    // Filter by category
    act(() => {
      result.current.setSearchFilters({ category: 'bug' })
    })
    
    const filtered = result.current.filteredTasks()
    expect(filtered).toHaveLength(1)
    expect(filtered[0].category).toBe('bug')
  })
})
```

### E2E Testing with Playwright

```typescript
// e2e/task-management.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Task Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })
  
  test('can create a new task', async ({ page }) => {
    // Open task form
    await page.click('[data-testid="new-task-button"]')
    
    // Fill form
    await page.fill('[data-testid="task-title"]', 'Test Task')
    await page.selectOption('[data-testid="task-category"]', 'feature')
    await page.selectOption('[data-testid="task-priority"]', 'high')
    
    // Submit form
    await page.click('[data-testid="save-task-button"]')
    
    // Verify task appears
    await expect(page.locator('[data-testid="task-card"]')).toContainText('Test Task')
  })
  
  test('can drag task between columns', async ({ page }) => {
    // Create a task first
    await page.click('[data-testid="new-task-button"]')
    await page.fill('[data-testid="task-title"]', 'Draggable Task')
    await page.click('[data-testid="save-task-button"]')
    
    // Drag from todo to doing
    await page.dragAndDrop(
      '[data-testid="task-card"]:has-text("Draggable Task")',
      '[data-testid="column-doing"]'
    )
    
    // Verify task moved
    const doingColumn = page.locator('[data-testid="column-doing"]')
    await expect(doingColumn).toContainText('Draggable Task')
  })
})
```

### Test Utilities

```typescript
// test-utils/fixtures.ts
export const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  description: 'Test description',
  category: 'feature',
  priority: 'medium',
  status: 'todo',
  createdAt: new Date('2024-01-01'),
  tags: ['test', 'example']
}

export const mockTasks: Task[] = [
  mockTask,
  { ...mockTask, id: '2', title: 'Bug Fix', category: 'bug' },
  { ...mockTask, id: '3', title: 'Documentation', category: 'docs' }
]

// test-utils/store-provider.tsx
export function TestStoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <div data-testid="test-store-provider">
      {children}
    </div>
  )
}

// test-utils/render-with-store.tsx
export function renderWithStore(ui: React.ReactElement, initialState?: Partial<TodoState>) {
  if (initialState) {
    useTodoStore.setState(initialState)
  }
  
  return render(ui, { wrapper: TestStoreProvider })
}
```

---

## Performance Optimization

### Component Optimization

#### 1. Memoization Strategies

```typescript
// Memo for expensive components
export const TaskCard = React.memo(({ task, onEdit }: TaskCardProps) => {
  return (
    <div className="task-card">
      {/* Component content */}
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.task.id === nextProps.task.id &&
         prevProps.task.updatedAt === nextProps.task.updatedAt
})

// Memo for computed values
const ExpensiveTaskList = () => {
  const tasks = useTodoStore(state => state.tasks)
  
  const expensiveComputation = useMemo(() => {
    return tasks
      .filter(task => task.status === 'doing')
      .sort((a, b) => a.priority.localeCompare(b.priority))
  }, [tasks])
  
  return (
    <div>
      {expensiveComputation.map(task => (
        <TaskCard key={task.id} task={task} onEdit={handleEdit} />
      ))}
    </div>
  )
}
```

#### 2. Virtual Scrolling for Large Lists

```typescript
// components/VirtualTaskList.tsx
import { FixedSizeList as List } from 'react-window'

interface VirtualTaskListProps {
  tasks: Task[]
  onEdit: (task: Task) => void
}

const TaskItem = ({ index, style, data }: ListChildComponentProps) => (
  <div style={style}>
    <TaskCard task={data.tasks[index]} onEdit={data.onEdit} />
  </div>
)

export function VirtualTaskList({ tasks, onEdit }: VirtualTaskListProps) {
  return (
    <List
      height={600}
      itemCount={tasks.length}
      itemSize={200}
      itemData={{ tasks, onEdit }}
    >
      {TaskItem}
    </List>
  )
}
```

#### 3. Debounced Search

```typescript
// hooks/useDebouncedsearch.ts
export function useDebouncedSearch(delay: number = 300) {
  const { setSearchFilters } = useTodoStore()
  const [query, setQuery] = useState('')
  
  const debouncedQuery = useMemo(() => {
    return debounce((searchQuery: string) => {
      setSearchFilters({ query: searchQuery })
    }, delay)
  }, [delay, setSearchFilters])
  
  useEffect(() => {
    debouncedQuery(query)
    return () => debouncedQuery.cancel()
  }, [query, debouncedQuery])
  
  return [query, setQuery] as const
}

// Usage in component
function SearchInput() {
  const [query, setQuery] = useDebouncedSearch(300)
  
  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search tasks..."
    />
  )
}
```

### Bundle Optimization

```typescript
// vite.config.ts optimization
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          editor: ['@monaco-editor/react'],
          dnd: ['@dnd-kit/core', '@dnd-kit/sortable'],
          ui: ['lucide-react', 'cmdk']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react-syntax-highlighter']
  }
})
```

---

## Extension Points

### Custom Commands for Command Palette

```typescript
// extensions/custom-commands.ts
import { Command } from '@/types'

export const customCommands: Command[] = [
  {
    id: 'export-csv',
    label: 'Export as CSV',
    description: 'Export all tasks to CSV file',
    icon: <DownloadIcon />,
    action: () => {
      const csvData = dataManager.exportAsCSV()
      dataManager.downloadFile(csvData, 'tasks.csv', 'text/csv')
    },
    keywords: ['export', 'csv', 'download']
  },
  {
    id: 'bulk-delete',
    label: 'Delete All Completed',
    description: 'Remove all completed tasks',
    icon: <TrashIcon />,
    action: () => {
      const { tasks, deleteTask } = useTodoStore.getState()
      tasks
        .filter(task => task.status === 'done')
        .forEach(task => deleteTask(task.id))
    },
    keywords: ['delete', 'bulk', 'completed', 'clean']
  }
]

// Register custom commands
export function registerCustomCommands() {
  const commandRegistry = useCommandRegistry()
  customCommands.forEach(command => {
    commandRegistry.register(command)
  })
}
```

### Custom Task Renderers

```typescript
// extensions/custom-task-renderer.tsx
interface CustomTaskRendererProps {
  task: Task
  variant?: 'card' | 'list' | 'minimal'
}

export function CustomTaskRenderer({ task, variant = 'card' }: CustomTaskRendererProps) {
  switch (variant) {
    case 'minimal':
      return (
        <div className="flex items-center gap-2 p-2">
          <input type="checkbox" checked={task.status === 'done'} />
          <span className={task.status === 'done' ? 'line-through' : ''}>
            {task.title}
          </span>
        </div>
      )
    
    case 'list':
      return (
        <div className="flex justify-between items-center p-3 border-b">
          <div>
            <h4 className="font-medium">{task.title}</h4>
            <p className="text-sm text-gray-600">{task.category}</p>
          </div>
          <Badge variant={getPriorityVariant(task.priority)}>
            {task.priority}
          </Badge>
        </div>
      )
    
    default:
      return <TaskCard task={task} onEdit={() => {}} />
  }
}
```

### Plugin System

```typescript
// types/plugin.ts
export interface Plugin {
  id: string
  name: string
  version: string
  init: (api: PluginAPI) => void
  cleanup?: () => void
}

export interface PluginAPI {
  store: typeof useTodoStore
  components: {
    TaskCard: typeof TaskCard
    Modal: typeof Modal
    Button: typeof Button
  }
  utils: {
    generateBranchName: typeof generateBranchName
    formatDate: typeof formatDate
  }
  registerCommand: (command: Command) => void
  registerTaskRenderer: (renderer: TaskRenderer) => void
}

// services/plugin-manager.ts
export class PluginManager {
  private plugins: Map<string, Plugin> = new Map()
  private api: PluginAPI
  
  constructor() {
    this.api = this.createAPI()
  }
  
  register(plugin: Plugin) {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin ${plugin.id} already registered`)
    }
    
    this.plugins.set(plugin.id, plugin)
    plugin.init(this.api)
  }
  
  unregister(pluginId: string) {
    const plugin = this.plugins.get(pluginId)
    if (plugin) {
      plugin.cleanup?.()
      this.plugins.delete(pluginId)
    }
  }
  
  private createAPI(): PluginAPI {
    return {
      store: useTodoStore,
      components: { TaskCard, Modal, Button },
      utils: { generateBranchName, formatDate },
      registerCommand: (command) => this.registerCommand(command),
      registerTaskRenderer: (renderer) => this.registerTaskRenderer(renderer)
    }
  }
}
```

---

## Deployment Guide

### Building for Production

```bash
# Build the application
npm run build

# Preview the build
npm run preview

# Analyze bundle size
npm run build:analyze
```

### Environment Variables

```bash
# .env.production
VITE_APP_VERSION=1.0.0
VITE_APP_BUILD_DATE=2024-12-15
VITE_ENABLE_ANALYTICS=true
VITE_API_BASE_URL=https://api.dotoo.app
```

### Static Deployment (Netlify/Vercel)

```json
// netlify.toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

// vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ]
}
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Progressive Web App (PWA)

```typescript
// vite.config.ts PWA setup
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'DoToo - Developer Todo App',
        short_name: 'DoToo',
        description: 'A modern todo app for developers',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
```

---

## Troubleshooting

### Common Issues

#### 1. Build Errors

```bash
# TypeScript errors
error TS2307: Cannot find module '@/components/TaskCard'

# Solution: Check tsconfig.json paths
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

#### 2. Performance Issues

```typescript
// Problem: Component re-renders too often
const TaskList = () => {
  const tasks = useTodoStore(state => state.tasks) // Re-renders on any store change
  
  // Solution: Select only needed data
  const tasks = useTodoStore(state => state.filteredTasks())
}

// Problem: Large list performance
// Solution: Implement virtualization or pagination
```

#### 3. State Persistence Issues

```typescript
// Problem: State not persisting
// Check localStorage availability
const isStorageAvailable = () => {
  try {
    const test = '__test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

// Fallback to memory storage
const storage = isStorageAvailable() ? localStorage : new Map()
```

### Debugging Techniques

#### 1. Store Debugging

```typescript
// Enable store debugging
if (process.env.NODE_ENV === 'development') {
  useTodoStore.subscribe((state) => {
    console.log('Store updated:', state)
  })
}

// Add store dev tools
import { devtools } from 'zustand/middleware'

const useTodoStore = create<TodoState>()(
  devtools(
    persist(
      (set, get) => ({
        // Store implementation
      }),
      { name: 'dotoo-storage' }
    ),
    { name: 'TodoStore' }
  )
)
```

#### 2. Performance Profiling

```typescript
// React DevTools Profiler
import { Profiler } from 'react'

function onRenderCallback(id, phase, actualDuration, baseDuration, startTime, commitTime) {
  console.log('Component render:', {
    id,
    phase,
    actualDuration,
    baseDuration
  })
}

<Profiler id="TaskList" onRender={onRenderCallback}>
  <TaskList />
</Profiler>
```

#### 3. Error Boundaries

```typescript
// error-boundary.tsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true }
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    // Send to error reporting service
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />
    }
    
    return this.props.children
  }
}
```

### Getting Help

1. **Documentation**: Check API documentation and component references
2. **TypeScript**: Use TypeScript's IntelliSense for API discovery
3. **Dev Tools**: Use React DevTools and browser debugging tools
4. **Community**: Join the DoToo developer community
5. **Issues**: Report bugs and feature requests on GitHub

---

*This developer guide covers comprehensive integration patterns, customization options, and best practices for working with DoToo. For the latest updates and community resources, visit the project repository.*