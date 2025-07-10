import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Task, TaskStatus, SearchFilters } from '@/types'
import useProjectStore from './projectStore'

interface TodoState {
  tasks: Task[]
  searchFilters: SearchFilters
  selectedTask: Task | null
  isCommandPaletteOpen: boolean
  isDarkMode: boolean
  
  // Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  updateTaskStatus: (id: string, status: TaskStatus) => void
  
  // Filters & Search
  setSearchFilters: (filters: Partial<SearchFilters>) => void
  clearFilters: () => void
  
  // UI State
  setSelectedTask: (task: Task | null) => void
  toggleCommandPalette: () => void
  setCommandPaletteOpen: (open: boolean) => void
  toggleDarkMode: () => void
  
  // Computed
  filteredTasks: () => Task[]
  tasksByStatus: (status: TaskStatus) => Task[]
}

const useTodoStore = create<TodoState>()(
  persist(
    (set, get) => ({
      tasks: [],
      searchFilters: { query: '' },
      selectedTask: null,
      isCommandPaletteOpen: false,
      isDarkMode: true, // Developer preference 😎
      
      addTask: (taskData) => {
        const activeProject = useProjectStore.getState().activeProject()
        if (!activeProject) {
          console.warn('No active project to add task to')
          return
        }
        
        const task: Task = {
          ...taskData,
          projectId: activeProject.id,
          id: crypto.randomUUID(),
          createdAt: new Date(),
        }
        set((state) => ({ tasks: [...state.tasks, task] }))
      },
      
      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        }))
      },
      
      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
          selectedTask: state.selectedTask?.id === id ? null : state.selectedTask,
        }))
      },
      
      updateTaskStatus: (id, status) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, status } : task
          ),
        }))
      },
      
      setSearchFilters: (filters) => {
        set((state) => ({
          searchFilters: { ...state.searchFilters, ...filters },
        }))
      },
      
      clearFilters: () => {
        set({ searchFilters: { 
          query: '', 
          category: undefined, 
          priority: undefined, 
          status: undefined,
          tags: undefined,
          hasCode: undefined,
          hasDueDate: undefined,
          isOverdue: undefined
        } })
      },
      
      setSelectedTask: (task) => set({ selectedTask: task }),
      
      toggleCommandPalette: () => {
        set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen }))
      },
      
      setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
      
      toggleDarkMode: () => {
        set((state) => ({ isDarkMode: !state.isDarkMode }))
      },
      
      // Computed getters
      filteredTasks: () => {
        const { tasks, searchFilters } = get()
        const activeProject = useProjectStore.getState().activeProject()
        
        return tasks.filter((task) => {
          // Filter by active project
          const matchesProject = !activeProject || task.projectId === activeProject.id
          
          // Text search across title, description, and tags
          const matchesQuery = !searchFilters.query || (() => {
            const query = searchFilters.query.toLowerCase()
            const searchableText = [
              task.title.toLowerCase(),
              task.description?.toLowerCase() || '',
              task.tags?.join(' ').toLowerCase() || '',
              task.branchName?.toLowerCase() || ''
            ].join(' ')
            return searchableText.includes(query)
          })()
          
          const matchesCategory = !searchFilters.category || task.category === searchFilters.category
          const matchesPriority = !searchFilters.priority || task.priority === searchFilters.priority
          const matchesStatus = !searchFilters.status || task.status === searchFilters.status
          
          // Tag filtering
          const matchesTags = !searchFilters.tags || searchFilters.tags.length === 0 || 
            searchFilters.tags.some(tag => task.tags?.includes(tag))
          
          // Code filtering
          const matchesHasCode = searchFilters.hasCode === undefined || 
            (searchFilters.hasCode ? !!task.code : !task.code)
          
          // Due date filtering
          const matchesHasDueDate = searchFilters.hasDueDate === undefined || 
            (searchFilters.hasDueDate ? !!task.dueDate : !task.dueDate)
          
          // Overdue filtering
          const matchesIsOverdue = searchFilters.isOverdue === undefined || (() => {
            if (!searchFilters.isOverdue) return true
            if (!task.dueDate) return false
            return new Date(task.dueDate) < new Date() && task.status !== 'done'
          })()
          
          // Project filtering
          const matchesProjectFilter = !searchFilters.projectId || task.projectId === searchFilters.projectId
          
          // Assigned to filtering
          const matchesAssignedTo = !searchFilters.assignedTo || task.assignedTo === searchFilters.assignedTo
          
          return matchesProject && matchesQuery && matchesCategory && matchesPriority && matchesStatus && 
                 matchesTags && matchesHasCode && matchesHasDueDate && matchesIsOverdue && 
                 matchesProjectFilter && matchesAssignedTo
        })
      },
      
      tasksByStatus: (status) => {
        return get().filteredTasks().filter((task) => task.status === status)
      },
    }),
    {
      name: 'dotoo-storage',
      partialize: (state) => ({ 
        tasks: state.tasks, 
        isDarkMode: state.isDarkMode 
      }),
    }
  )
)

export default useTodoStore 