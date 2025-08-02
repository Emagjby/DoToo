# DoToo Component Reference Guide

> **Detailed reference for all React components in DoToo**

This guide provides comprehensive documentation for every React component in the DoToo application, including their props, events, styling options, and usage patterns.

## Table of Contents

1. [UI Components](#ui-components)
2. [Form Components](#form-components)
3. [Kanban Components](#kanban-components)
4. [Layout Components](#layout-components)
5. [Feature Components](#feature-components)
6. [Styling Guide](#styling-guide)

---

## UI Components

### Button

A flexible button component with multiple variants and sizes, built with Tailwind CSS.

#### Props

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  children: React.ReactNode
  className?: string
}
```

#### Variants

- **default**: Primary button with background color
- **destructive**: Red button for dangerous actions
- **outline**: Transparent button with border
- **secondary**: Subtle background button
- **ghost**: Invisible button that shows on hover
- **link**: Text button with underline

#### Sizes

- **default**: Standard height (40px)
- **sm**: Small button (36px)
- **lg**: Large button (44px)
- **icon**: Square button for icons (40x40px)

#### Usage Examples

```tsx
// Primary action button
<Button variant="default" size="lg" onClick={handleSave}>
  Save Task
</Button>

// Dangerous action
<Button variant="destructive" onClick={handleDelete}>
  Delete Task
</Button>

// Icon button
<Button variant="ghost" size="icon" onClick={handleEdit}>
  <EditIcon size={16} />
</Button>

// Custom styling
<Button 
  variant="outline" 
  className="w-full justify-center"
  disabled={isLoading}
>
  {isLoading ? 'Saving...' : 'Save'}
</Button>
```

#### Accessibility

- Supports all standard button attributes
- Proper focus management with visible focus rings
- Disabled state handling
- ARIA attributes support

---

### Modal

A flexible modal dialog with backdrop click handling and smooth animations.

#### Props

```typescript
interface ModalProps {
  isOpen: boolean                    // Controls modal visibility
  onClose: () => void               // Called when modal should close
  title?: string                    // Optional modal title
  children: React.ReactNode         // Modal content
  className?: string                // Additional CSS classes
  showCloseButton?: boolean         // Show X button (default: true)
}
```

#### Features

- **Backdrop Click**: Closes modal when clicking outside
- **Escape Key**: Automatically closes on Escape key
- **Focus Management**: Traps focus within modal
- **Scroll Lock**: Prevents body scroll when open
- **Responsive**: Adapts to different screen sizes

#### Usage Examples

```tsx
// Basic modal
<Modal 
  isOpen={isOpen} 
  onClose={() => setIsOpen(false)}
  title="Edit Task"
>
  <TaskForm task={selectedTask} />
</Modal>

// Full-width modal without title
<Modal 
  isOpen={isDataModalOpen}
  onClose={closeDataModal}
  className="max-w-4xl"
  showCloseButton={false}
>
  <DataManagementPanel />
</Modal>

// Custom modal with actions
<Modal isOpen={confirmDelete} onClose={cancelDelete}>
  <div className="text-center">
    <h3>Confirm Deletion</h3>
    <p>Are you sure you want to delete this task?</p>
    <div className="flex gap-2 mt-4">
      <Button variant="outline" onClick={cancelDelete}>
        Cancel
      </Button>
      <Button variant="destructive" onClick={confirmDeleteAction}>
        Delete
      </Button>
    </div>
  </div>
</Modal>
```

#### Styling

```css
/* Modal backdrop */
.modal-backdrop {
  @apply fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4;
}

/* Modal content */
.modal-content {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto;
}
```

---

### Badge

A small component for displaying categories, priorities, and tags.

#### Props

```typescript
interface BadgeProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  className?: string
  children: React.ReactNode
}
```

#### Usage Examples

```tsx
// Category badges
<Badge variant="default">Feature</Badge>
<Badge variant="destructive">Bug</Badge>

// Priority indicators
<Badge className="bg-red-100 text-red-800">High Priority</Badge>
<Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>

// Custom content
<Badge variant="outline">
  <CodeIcon size={12} className="mr-1" />
  JavaScript
</Badge>
```

---

## Form Components

### TaskForm

A comprehensive form component for creating and editing tasks with rich features.

#### Props

```typescript
interface TaskFormProps {
  task?: Task                       // Existing task for editing
  isOpen: boolean                   // Form visibility
  onClose: () => void              // Close handler
}
```

#### Features

- **Rich Text Editor**: Monaco editor for descriptions
- **Code Editor**: Syntax-highlighted code snippets
- **Language Selection**: Support for 15+ programming languages
- **Category Selection**: Visual category picker
- **Priority Selection**: Priority level with icons
- **Due Date Picker**: Date selection with validation
- **Tag Management**: Add/remove tags with suggestions
- **Branch Name Generation**: Auto-generated git branch names
- **Validation**: Real-time form validation
- **Auto-save**: Drafts saved to localStorage

#### Form Fields

```typescript
interface FormData {
  title: string                     // Required, max 100 chars
  description?: string              // Optional rich text
  code?: string                     // Optional code snippet
  language?: string                 // Programming language
  category: Category                // Required selection
  priority: Priority                // Required selection
  dueDate?: Date                   // Optional due date
  tags?: string[]                  // Optional tag list
}
```

#### Usage Examples

```tsx
// Create new task
<TaskForm 
  isOpen={isCreateModalOpen}
  onClose={() => setIsCreateModalOpen(false)}
/>

// Edit existing task
<TaskForm 
  task={selectedTask}
  isOpen={isEditModalOpen}
  onClose={() => setIsEditModalOpen(false)}
/>
```

#### Events

```typescript
// Form submission
const handleSubmit = (formData: Omit<Task, 'id' | 'createdAt'>) => {
  if (task) {
    updateTask(task.id, formData)
  } else {
    addTask(formData)
  }
  onClose()
}

// Form validation
const validateForm = (data: FormData): string[] => {
  const errors = []
  if (!data.title.trim()) errors.push('Title is required')
  if (data.title.length > 100) errors.push('Title too long')
  if (data.dueDate && data.dueDate < new Date()) errors.push('Due date must be in future')
  return errors
}
```

---

### SearchBar

An advanced search and filtering component with multiple filter options.

#### Props

```typescript
interface SearchBarProps {
  onToggleExpanded?: (expanded: boolean) => void
  onCloseDropdowns?: () => void
}
```

#### Features

- **Text Search**: Searches title, description, tags, and branch names
- **Category Filter**: Filter by task category
- **Priority Filter**: Filter by priority level
- **Status Filter**: Filter by Kanban status
- **Advanced Filters**: Code presence, due dates, overdue tasks
- **Filter Badges**: Visual representation of active filters
- **Quick Clear**: One-click filter clearing
- **Responsive Design**: Collapsible on mobile

#### Usage Examples

```tsx
// Basic search bar
<SearchBar />

// With event handlers
<SearchBar 
  onToggleExpanded={(expanded) => setSearchExpanded(expanded)}
  onCloseDropdowns={() => setDropdownsOpen(false)}
/>

// With ref for focus management
const searchRef = useRef<HTMLInputElement>(null)
<SearchBar ref={searchRef} />
```

#### Search Filters

```typescript
interface SearchFilters {
  query: string                     // Text search
  category?: Category              // Category filter
  priority?: Priority              // Priority filter
  status?: TaskStatus              // Status filter
  tags?: string[]                  // Tag filter
  hasCode?: boolean                // Code presence
  hasDueDate?: boolean             // Due date presence
  isOverdue?: boolean              // Overdue status
}
```

---

## Kanban Components

### Board

The main Kanban board component with drag-and-drop functionality.

#### Props

```typescript
interface BoardProps {
  onEdit?: (task: Task) => void    // Task edit handler
}
```

#### Features

- **Three Columns**: Todo, Doing, Done
- **Drag & Drop**: Powered by @dnd-kit
- **Real-time Updates**: Immediate state synchronization
- **Filtered Display**: Shows only filtered tasks
- **Touch Support**: Works on mobile devices
- **Accessibility**: Keyboard navigation support

#### Usage Examples

```tsx
// Basic board
<Board onEdit={handleEditTask} />

// With custom styling
<div className="h-screen p-4">
  <Board onEdit={openTaskEditor} />
</div>
```

#### Drag & Drop Events

```typescript
// Drag start
const handleDragStart = (event: DragStartEvent) => {
  const task = findTaskById(event.active.id)
  setActiveTask(task)
}

// Drag end
const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event
  if (over && active.id !== over.id) {
    const newStatus = getColumnStatus(over.id)
    updateTaskStatus(active.id as string, newStatus)
  }
  setActiveTask(null)
}
```

---

### Column

Individual Kanban column component with drop zone functionality.

#### Props

```typescript
interface ColumnProps {
  id: string                       // Column identifier
  title: string                    // Column header text
  tasks: Task[]                    // Tasks in this column
  onEdit: (task: Task) => void     // Task edit handler
}
```

#### Features

- **Drop Zone**: Accepts dragged tasks
- **Task Count**: Shows number of tasks
- **Empty State**: Placeholder when no tasks
- **Smooth Animations**: Task addition/removal animations

#### Usage Examples

```tsx
<Column
  id="todo"
  title="To Do"
  tasks={todoTasks}
  onEdit={handleEditTask}
/>
```

---

### DraggableTaskCard

Wrapper component that makes TaskCard draggable.

#### Props

```typescript
interface DraggableTaskCardProps {
  task: Task
  onEdit: (task: Task) => void
}
```

#### Features

- **Drag Handle**: Entire card is draggable
- **Visual Feedback**: Opacity change during drag
- **Touch Support**: Mobile-friendly dragging
- **Accessibility**: Keyboard drag support

---

## Layout Components

### Header

Application header with branding and global actions.

#### Features

- **DoToo Logo**: Animated logo component
- **Theme Toggle**: Dark/light mode switcher
- **Responsive**: Adapts to screen size
- **Fixed Position**: Stays at top when scrolling

#### Usage Examples

```tsx
<Header />

// With custom actions
<Header>
  <Button variant="ghost" size="icon" onClick={openSettings}>
    <SettingsIcon />
  </Button>
</Header>
```

---

### EmptyState

Displays when no tasks are available with call-to-action.

#### Features

- **Friendly Message**: Encouraging empty state text
- **Action Button**: Direct task creation
- **Illustration**: Visual enhancement
- **Responsive**: Adapts to container size

#### Usage Examples

```tsx
// Basic empty state
{tasks.length === 0 && <EmptyState />}

// Conditional with search
{filteredTasks.length === 0 && hasSearchFilters && (
  <EmptyState 
    title="No matching tasks"
    message="Try adjusting your search filters"
  />
)}
```

---

### TaskGrid

Grid layout component for list view of tasks.

#### Props

```typescript
interface TaskGridProps {
  children: React.ReactNode
}
```

#### Features

- **Responsive Grid**: 1-3 columns based on screen size
- **Equal Heights**: Cards stretch to match tallest
- **Gap Management**: Consistent spacing

---

## Feature Components

### CommandPalette

Quick action interface with fuzzy search and commands.

#### Props

```typescript
interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onOpenDataManagement: () => void
}
```

#### Features

- **Fuzzy Search**: Intelligent task searching
- **Quick Actions**: Create, edit, delete tasks
- **Filter Shortcuts**: Quick filter application
- **Theme Toggle**: Instant theme switching
- **Keyboard Navigation**: Full keyboard support

#### Commands

```typescript
interface Command {
  id: string
  label: string
  description?: string
  icon: React.ReactNode
  action: () => void
  keywords: string[]
}
```

#### Usage Examples

```tsx
<CommandPalette
  isOpen={isCommandPaletteOpen}
  onClose={() => setIsCommandPaletteOpen(false)}
  onOpenDataManagement={() => setDataModalOpen(true)}
/>
```

---

### TaskCard

Individual task display component with actions and information.

#### Props

```typescript
interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
}
```

#### Features

- **Rich Display**: Title, description, code preview
- **Status Badges**: Category and priority indicators
- **Action Buttons**: Edit, delete, copy branch name
- **Code Highlighting**: Syntax-highlighted code snippets
- **Due Date Display**: Formatted due date with overdue indication
- **Tag Display**: Visual tag representation

#### Usage Examples

```tsx
// Basic card
<TaskCard 
  task={task}
  onEdit={handleEditTask}
/>

// In grid layout
<div className="grid gap-4">
  {tasks.map(task => (
    <TaskCard key={task.id} task={task} onEdit={handleEditTask} />
  ))}
</div>
```

#### Actions

```typescript
// Edit task
const handleEdit = () => onEdit(task)

// Delete task
const handleDelete = () => {
  if (confirm('Delete this task?')) {
    deleteTask(task.id)
  }
}

// Copy branch name
const handleCopyBranch = () => {
  navigator.clipboard.writeText(task.branchName)
  showToast('Branch name copied!')
}
```

---

### DataManagement

Comprehensive data import/export interface.

#### Features

- **JSON Export**: Full data export with metadata
- **CSV Export**: Spreadsheet-compatible format
- **Import Validation**: Data structure validation
- **Backup Management**: Create and restore backups
- **Data Statistics**: Storage usage and task counts
- **Error Handling**: User-friendly error messages

#### Usage Examples

```tsx
<DataManagement />

// As modal content
<Modal isOpen={isDataModalOpen} onClose={closeDataModal}>
  <DataManagement />
</Modal>
```

---

## Styling Guide

### Theme System

DoToo uses a CSS custom property system for theming:

```css
:root {
  --primary: 222.2 84% 4.9%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --accent: 210 40% 96%;
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
}

.dark {
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 84% 4.9%;
  --secondary: 217.2 32.6% 17.5%;
  --accent: 217.2 32.6% 17.5%;
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
}
```

### Component Classes

```css
/* Button variants */
.btn-primary { @apply bg-primary text-primary-foreground hover:bg-primary/90; }
.btn-secondary { @apply bg-secondary text-secondary-foreground hover:bg-secondary/80; }
.btn-destructive { @apply bg-destructive text-destructive-foreground hover:bg-destructive/90; }

/* Card styles */
.task-card {
  @apply bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow;
}

/* Modal styles */
.modal-overlay {
  @apply fixed inset-0 bg-black/50 flex items-center justify-center z-50;
}

.modal-content {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto;
}
```

### Responsive Breakpoints

```css
/* Mobile first approach */
.container {
  @apply px-4;
}

@media (min-width: 640px) {
  .container { @apply px-6; }
}

@media (min-width: 768px) {
  .container { @apply px-8; }
}

@media (min-width: 1024px) {
  .container { @apply px-12; }
}
```

### Animation Classes

```css
/* Smooth transitions */
.transition-smooth { @apply transition-all duration-200 ease-in-out; }

/* Fade animations */
.fade-in { @apply animate-in fade-in duration-200; }
.fade-out { @apply animate-out fade-out duration-200; }

/* Slide animations */
.slide-in-up { @apply animate-in slide-in-from-bottom-4 duration-300; }
.slide-out-down { @apply animate-out slide-out-to-bottom-4 duration-300; }
```

---

*This component reference covers all React components in DoToo v1.0.0. Each component is designed to be reusable, accessible, and well-documented for easy integration and customization.*