export type Priority = 'low' | 'medium' | 'high' | 'critical'
export type TaskStatus = 'todo' | 'doing' | 'done'
export type Category = 'feature' | 'bug' | 'docs' | 'refactor' | 'test' | 'chore'

export interface Task {
  id: string
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