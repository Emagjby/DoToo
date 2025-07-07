import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Task, TaskStatus, Category, Priority, SearchFilters } from '@/types'

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
        const task: Task = {
          ...taskData,
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
        set({ searchFilters: { query: '' } })
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
        return tasks.filter((task) => {
          const matchesQuery = !searchFilters.query || 
            task.title.toLowerCase().includes(searchFilters.query.toLowerCase()) ||
            task.description?.toLowerCase().includes(searchFilters.query.toLowerCase())
          
          const matchesCategory = !searchFilters.category || task.category === searchFilters.category
          const matchesPriority = !searchFilters.priority || task.priority === searchFilters.priority
          const matchesStatus = !searchFilters.status || task.status === searchFilters.status
          
          return matchesQuery && matchesCategory && matchesPriority && matchesStatus
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