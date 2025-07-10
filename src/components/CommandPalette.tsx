import { useEffect, useState } from 'react'
import { Command } from 'cmdk'
import { 
  Search, 
  Plus, 
  Sun,
  Moon,
  Database,
  Filter,
  Trash2,
  X,
  Calendar,
  BarChart3,
  Layout,
  List,
  Table,
  Network,
  FolderOpen,
  Edit
} from 'lucide-react'
import useTodoStore from '../stores/todoStore'
import useProjectStore from '../stores/projectStore'
import type { Task, Category, Priority, TaskStatus, ViewType } from '../types'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onOpenDataManagement: () => void
}

const categoryOptions = [
  { value: 'feature', label: 'Feature', icon: '✨' },
  { value: 'bug', label: 'Bug', icon: '🐛' },
  { value: 'docs', label: 'Documentation', icon: '📚' },
  { value: 'refactor', label: 'Refactor', icon: '🔧' },
  { value: 'test', label: 'Test', icon: '🧪' },
  { value: 'chore', label: 'Chore', icon: '📦' },
] as const

const priorityOptions = [
  { value: 'low', label: 'Low Priority', color: 'text-green-500' },
  { value: 'medium', label: 'Medium Priority', color: 'text-yellow-500' },
  { value: 'high', label: 'High Priority', color: 'text-orange-500' },
  { value: 'critical', label: 'Critical Priority', color: 'text-red-500' },
] as const

const statusOptions = [
  { value: 'todo', label: 'To Do', icon: Calendar },
  { value: 'doing', label: 'In Progress', icon: Filter },
  { value: 'done', label: 'Done', icon: X },
] as const

export default function CommandPalette({ isOpen, onClose, onOpenDataManagement }: CommandPaletteProps) {
  const { 
    tasks, 
    isDarkMode, 
    toggleDarkMode, 
    searchFilters, 
    setSearchFilters, 
    clearFilters,
    deleteTask,
    setSelectedTask
  } = useTodoStore()
  
  const { 
    projects, 
    activeProject, 
    setActiveProject, 
    updateProject 
  } = useProjectStore()
  
  const [search, setSearch] = useState('')

  // Note: Escape handling is now done globally in App.tsx

  // Reset search when opening and focus the input
  useEffect(() => {
    if (isOpen) {
      setSearch('')
      // Focus the search input after a short delay to ensure the modal is rendered
      setTimeout(() => {
        const searchInput = document.querySelector('[data-command-palette-search]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        }
      }, 100)
    }
  }, [isOpen])

  const handleNewTask = () => {
    onClose()
    // Trigger new task creation (you'll need to add this to your store or pass it as prop)
    window.dispatchEvent(new CustomEvent('new-task'))
  }

  const handleToggleTheme = () => {
    toggleDarkMode()
    onClose()
  }

  const handleOpenDataManagement = () => {
    onOpenDataManagement()
    onClose()
  }

  const handleFilterByCategory = (category: Category) => {
    setSearchFilters({ category })
    onClose()
  }

  const handleFilterByPriority = (priority: Priority) => {
    setSearchFilters({ priority })
    onClose()
  }

  const handleFilterByStatus = (status: TaskStatus) => {
    setSearchFilters({ status })
    onClose()
  }

  const handleClearFilters = () => {
    clearFilters()
    onClose()
  }

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId)
    onClose()
  }

  const handleViewTask = (task: Task) => {
    setSelectedTask(task)
    onClose()
  }

  const handleEditTask = (task: Task) => {
    setSelectedTask(task)
    // Trigger edit mode (you'll need to add this to your store or pass it as prop)
    window.dispatchEvent(new CustomEvent('edit-task', { detail: task }))
    onClose()
  }

  const handleSwitchProject = (projectId: string) => {
    setActiveProject(projectId)
    onClose()
  }

  const handleSwitchView = (viewType: ViewType) => {
    const currentProject = activeProject()
    if (currentProject) {
      updateProject(currentProject.id, { viewType })
    }
    onClose()
  }

  const handleCreateProject = () => {
    onClose()
    // Trigger project creation
    window.dispatchEvent(new CustomEvent('create-project'))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl">
          <Command className="bg-background border border-border rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center border-b border-border px-4 py-3 bg-muted/30">
              <Search className="mr-3 h-5 w-5 shrink-0 opacity-50" />
              <Command.Input
                value={search}
                onValueChange={setSearch}
                placeholder="Search commands, tasks, or filters..."
                className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 font-medium"
                data-command-palette-search
              />
            </div>
            <Command.List className="max-h-[400px] overflow-y-auto p-2">
              <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <Search className="h-8 w-8 opacity-30" />
                  <span>No results found</span>
                  <span className="text-xs">Try a different search term</span>
                </div>
              </Command.Empty>

              {/* Quick Actions */}
              <Command.Group className="px-3 pt-4 pb-2">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-2">
                  Quick Actions
                </div>
                <div className="h-px bg-border mx-2 mb-3"></div>
                <Command.Item
                  onSelect={handleNewTask}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg cursor-pointer hover:bg-accent transition-colors mx-2"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10">
                    <Plus size={16} className="text-primary" />
                  </div>
                  <span className="font-medium">Create New Task</span>
                  <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-1 rounded">N</span>
                </Command.Item>
                
                <Command.Item
                  onSelect={handleToggleTheme}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg cursor-pointer hover:bg-accent transition-colors mx-2"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10">
                    {isDarkMode ? <Sun size={16} className="text-primary" /> : <Moon size={16} className="text-primary" />}
                  </div>
                  <span className="font-medium">Toggle Theme</span>
                  <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-1 rounded">T</span>
                </Command.Item>

                <Command.Item
                  onSelect={handleOpenDataManagement}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg cursor-pointer hover:bg-accent transition-colors mx-2"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10">
                    <Database size={16} className="text-primary" />
                  </div>
                  <span className="font-medium">Data Management</span>
                  <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-1 rounded">D</span>
                </Command.Item>
              </Command.Group>

              {/* Projects */}
              {projects.length > 0 && (
                <Command.Group className="px-3 py-2">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-2">
                    Switch Project
                  </div>
                  <div className="h-px bg-border mx-2 mb-3"></div>
                  {projects.map((project) => {
                    const isActive = activeProject()?.id === project.id
                    const projectTasks = tasks.filter(task => task.projectId === project.id)
                    return (
                      <Command.Item
                        key={project.id}
                        onSelect={() => handleSwitchProject(project.id)}
                        className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg cursor-pointer hover:bg-accent transition-colors mx-2 ${
                          isActive ? 'bg-primary/10 border border-primary/20' : ''
                        }`}
                      >
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                          style={{ backgroundColor: project.color }}
                        >
                          {project.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium truncate block">{project.name}</span>
                          <span className="text-xs text-muted-foreground">{projectTasks.length} tasks</span>
                        </div>
                        {isActive && (
                          <span className="text-xs text-primary font-medium">Active</span>
                        )}
                      </Command.Item>
                    )
                  })}
                </Command.Group>
              )}

              {/* View Types */}
              {activeProject() && (
                <Command.Group className="px-3 py-2">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-2">
                    Switch View
                  </div>
                  <div className="h-px bg-border mx-2 mb-3"></div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'kanban', label: 'Kanban Board', icon: Layout, color: '#3B82F6' },
                      { key: 'list', label: 'List View', icon: List, color: '#10B981' },
                      { key: 'calendar', label: 'Calendar View', icon: Calendar, color: '#F59E0B' },
                      { key: 'gantt', label: 'Gantt Chart', icon: BarChart3, color: '#8B5CF6' },
                      { key: 'table', label: 'Table View', icon: Table, color: '#EF4444' },
                      { key: 'mindmap', label: 'Mind Map', icon: Network, color: '#06B6D4' }
                    ].map((view) => {
                      const IconComponent = view.icon
                      const isActive = activeProject()?.viewType === view.key
                      return (
                        <Command.Item
                          key={view.key}
                          onSelect={() => handleSwitchView(view.key as ViewType)}
                          className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                            isActive ? 'bg-primary/10 border border-primary/20' : ''
                          }`}
                        >
                          <div 
                            className="w-6 h-6 rounded-md flex items-center justify-center text-white"
                            style={{ backgroundColor: view.color }}
                          >
                            <IconComponent size={14} />
                          </div>
                          <span className="font-medium">{view.label}</span>
                          {isActive && (
                            <span className="ml-auto text-xs text-primary font-medium">Active</span>
                          )}
                        </Command.Item>
                      )
                    })}
                  </div>
                </Command.Group>
              )}

              {/* Create Project */}
              <Command.Group className="px-3 py-2">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-2">
                  Project Management
                </div>
                <div className="h-px bg-border mx-2 mb-3"></div>
                <Command.Item
                  onSelect={handleCreateProject}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg cursor-pointer hover:bg-accent transition-colors mx-2"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10">
                    <FolderOpen size={16} className="text-primary" />
                  </div>
                  <span className="font-medium">Create New Project</span>
                </Command.Item>
              </Command.Group>

              {/* Filters */}
              <Command.Group className="px-3 py-2">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-2">
                  Filter by Category
                </div>
                <div className="h-px bg-border mx-2 mb-3"></div>
                <div className="grid grid-cols-2 gap-2">
                  {categoryOptions.map((category) => (
                    <Command.Item
                      key={category.value}
                      onSelect={() => handleFilterByCategory(category.value)}
                      className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                        searchFilters.category === category.value 
                          ? 'bg-primary/10 border border-primary/20' 
                          : ''
                      }`}
                    >
                      <span className="text-lg">{category.icon}</span>
                      <span className="font-medium">{category.label}</span>
                      {searchFilters.category === category.value && (
                        <span className="ml-auto text-xs text-primary font-medium">Active</span>
                      )}
                    </Command.Item>
                  ))}
                </div>
              </Command.Group>

              <Command.Group className="px-3 py-2">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-2">
                  Filter by Priority
                </div>
                <div className="h-px bg-border mx-2 mb-3"></div>
                <div className="grid grid-cols-2 gap-2">
                  {priorityOptions.map((priority) => (
                    <Command.Item
                      key={priority.value}
                      onSelect={() => handleFilterByPriority(priority.value)}
                      className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                        searchFilters.priority === priority.value 
                          ? 'bg-primary/10 border border-primary/20' 
                          : ''
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full ${priority.color.replace('text-', 'bg-')}`} />
                      <span className="font-medium">{priority.label}</span>
                      {searchFilters.priority === priority.value && (
                        <span className="ml-auto text-xs text-primary font-medium">Active</span>
                      )}
                    </Command.Item>
                  ))}
                </div>
              </Command.Group>

              <Command.Group className="px-3 py-2">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-2">
                  Filter by Status
                </div>
                <div className="h-px bg-border mx-2 mb-3"></div>
                <div className="grid grid-cols-3 gap-2">
                  {statusOptions.map((status) => {
                    const IconComponent = status.icon
                    return (
                      <Command.Item
                        key={status.value}
                        onSelect={() => handleFilterByStatus(status.value)}
                        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                          searchFilters.status === status.value 
                            ? 'bg-primary/10 border border-primary/20' 
                            : ''
                        }`}
                      >
                        <IconComponent size={16} className="text-muted-foreground" />
                        <span className="font-medium">{status.label}</span>
                        {searchFilters.status === status.value && (
                          <span className="ml-auto text-xs text-primary font-medium">Active</span>
                        )}
                      </Command.Item>
                    )
                  })}
                </div>
              </Command.Group>

              {/* Active Filters */}
              {(searchFilters.category || searchFilters.priority || searchFilters.status) && (
                <Command.Group className="px-3 py-2">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-2">
                    Active Filters
                  </div>
                  <div className="h-px bg-border mx-2 mb-3"></div>
                  <Command.Item
                    onSelect={handleClearFilters}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg cursor-pointer hover:bg-accent transition-colors mx-2 text-red-500"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-red-500/10">
                      <Trash2 size={16} className="text-red-500" />
                    </div>
                    <span className="font-medium">Clear All Filters</span>
                  </Command.Item>
                </Command.Group>
              )}

              {/* Tasks */}
              {tasks.length > 0 && (
                <Command.Group className="px-3 py-2">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-2">
                    Recent Tasks ({tasks.length})
                  </div>
                  <div className="h-px bg-border mx-2 mb-3"></div>
                  {tasks.slice(0, 8).map((task) => (
                    <Command.Item
                      key={task.id}
                      onSelect={() => handleViewTask(task)}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg cursor-pointer hover:bg-accent transition-colors mx-2"
                    >
                      <div className="flex items-center justify-center w-16 h-8 rounded-md bg-muted/50">
                        <span className="text-xs font-mono text-muted-foreground">#{task.id.slice(0, 6)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium truncate block">{task.title}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-muted px-2 py-1 rounded">{task.status}</span>
                          <span className="text-xs text-muted-foreground">{task.category}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditTask(task)
                          }}
                          className="p-1.5 hover:bg-accent/50 rounded-md transition-colors"
                          title="Edit task"
                        >
                          <Edit size={14} className="text-muted-foreground" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteTask(task.id)
                          }}
                          className="p-1.5 hover:bg-red-500/10 rounded-md transition-colors"
                          title="Delete task"
                        >
                          <Trash2 size={14} className="text-red-500" />
                        </button>
                      </div>
                    </Command.Item>
                  ))}
                  {tasks.length > 8 && (
                    <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                      ... and {tasks.length - 8} more tasks
                    </div>
                  )}
                </Command.Group>
              )}
            </Command.List>
          </Command>
        </div>
      </div>
    </div>
  )
} 