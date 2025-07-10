export type Priority = 'low' | 'medium' | 'high' | 'critical'
export type TaskStatus = 'todo' | 'doing' | 'done'
export type Category = 'feature' | 'bug' | 'docs' | 'refactor' | 'test' | 'chore'

// New types for multi-project system
export type ViewType = 'kanban' | 'list' | 'calendar' | 'gantt' | 'table' | 'mindmap'
export type ProjectType = 'development' | 'design' | 'marketing' | 'research' | 'personal' | 'other'

export interface Project {
  id: string
  name: string
  description?: string
  type: ProjectType
  viewType: ViewType
  color: string
  icon: string
  createdAt: Date
  updatedAt: Date
  isActive: boolean
  settings: ProjectSettings
}

export interface ProjectSettings {
  theme?: string
  defaultCategory?: Category
  defaultPriority?: Priority
  enableGitIntegration?: boolean
  enableCodeSnippets?: boolean
  enableTimeTracking?: boolean
  customFields?: Record<string, any>
}

export interface Task {
  id: string
  projectId: string // Reference to project
  title: string
  description?: string
  code?: string
  language?: string
  category: Category
  priority: Priority
  status: TaskStatus
  createdAt: Date
  dueDate?: Date
  branchName?: string
  tags?: string[]
  // New fields for enhanced functionality
  assignedTo?: string
  estimatedHours?: number
  actualHours?: number
  dependencies?: string[] // Task IDs this task depends on
  parentTaskId?: string // For subtasks
  order?: number // For custom ordering in list/table views
}

export interface CategoryInfo {
  value: Category
  label: string
  color: string
  icon: string
}

export interface PriorityInfo {
  value: Priority
  label: string
  color: string
}

export interface SearchFilters {
  query: string
  category?: Category
  priority?: Priority
  status?: TaskStatus
  tags?: string[]
  hasCode?: boolean
  hasDueDate?: boolean
  isOverdue?: boolean
  projectId?: string // Filter by specific project
  assignedTo?: string
}

export interface ThemeConfig {
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
  }
}

// View-specific interfaces
export interface ListViewConfig {
  sortBy: 'title' | 'priority' | 'status' | 'dueDate' | 'createdAt' | 'category'
  sortOrder: 'asc' | 'desc'
  groupBy?: 'category' | 'priority' | 'status' | 'assignedTo'
  showCompleted: boolean
}

export interface CalendarViewConfig {
  viewMode: 'month' | 'week' | 'year'
  showCompleted: boolean
  showOverdue: boolean
  colorBy: 'category' | 'priority'
}

export interface TableViewConfig {
  columns: string[]
  sortBy: string
  sortOrder: 'asc' | 'desc'
  filters: Record<string, any>
}

export interface GanttViewConfig {
  startDate: Date
  endDate: Date
  showDependencies: boolean
  showProgress: boolean
  groupBy: 'category' | 'priority' | 'assignedTo'
}

export interface MindMapViewConfig {
  rootTaskId?: string
  showCompleted: boolean
  layout: 'hierarchical' | 'radial' | 'organic'
  depth: number
}

// Project type configurations
export const PROJECT_TYPES = {
  development: {
    label: 'Development',
    icon: '💻',
    color: '#3B82F6',
    defaultViewType: 'kanban' as ViewType,
    defaultSettings: {
      enableGitIntegration: true,
      enableCodeSnippets: true,
      defaultCategory: 'feature' as Category,
      defaultPriority: 'medium' as Priority,
    }
  },
  design: {
    label: 'Design',
    icon: '🎨',
    color: '#8B5CF6',
    defaultViewType: 'kanban' as ViewType,
    defaultSettings: {
      enableGitIntegration: false,
      enableCodeSnippets: false,
      defaultCategory: 'feature' as Category,
      defaultPriority: 'medium' as Priority,
    }
  },
  marketing: {
    label: 'Marketing',
    icon: '📢',
    color: '#10B981',
    defaultViewType: 'calendar' as ViewType,
    defaultSettings: {
      enableGitIntegration: false,
      enableCodeSnippets: false,
      defaultCategory: 'chore' as Category,
      defaultPriority: 'medium' as Priority,
    }
  },
  research: {
    label: 'Research',
    icon: '🔬',
    color: '#F59E0B',
    defaultViewType: 'list' as ViewType,
    defaultSettings: {
      enableGitIntegration: false,
      enableCodeSnippets: true,
      defaultCategory: 'docs' as Category,
      defaultPriority: 'low' as Priority,
    }
  },
  personal: {
    label: 'Personal',
    icon: '👤',
    color: '#EF4444',
    defaultViewType: 'list' as ViewType,
    defaultSettings: {
      enableGitIntegration: false,
      enableCodeSnippets: false,
      defaultCategory: 'chore' as Category,
      defaultPriority: 'medium' as Priority,
    }
  },
  other: {
    label: 'Other',
    icon: '📁',
    color: '#6B7280',
    defaultViewType: 'kanban' as ViewType,
    defaultSettings: {
      enableGitIntegration: false,
      enableCodeSnippets: false,
      defaultCategory: 'chore' as Category,
      defaultPriority: 'medium' as Priority,
    }
  }
} as const 