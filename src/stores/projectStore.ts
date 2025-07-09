import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Project, ProjectType, ViewType, PROJECT_TYPES } from '@/types'

interface ProjectState {
  projects: Project[]
  activeProjectId: string | null
  
  // Actions
  createProject: (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  setActiveProject: (id: string | null) => void
  duplicateProject: (id: string, newName: string) => void
  
  // Computed
  activeProject: () => Project | null
  getProject: (id: string) => Project | null
  getProjectsByType: (type: ProjectType) => Project[]
}

const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      activeProjectId: null,
      
      createProject: (projectData) => {
        const now = new Date()
        const project: Project = {
          ...projectData,
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
          isActive: true,
        }
        
        set((state) => {
          const newProjects = [...state.projects, project]
          
          // If this is the first project, make it active
          const newActiveProjectId = state.activeProjectId || project.id
          
          return {
            projects: newProjects,
            activeProjectId: newActiveProjectId,
          }
        })
      },
      
      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id 
              ? { ...project, ...updates, updatedAt: new Date() }
              : project
          ),
        }))
      },
      
      deleteProject: (id) => {
        set((state) => {
          const newProjects = state.projects.filter((project) => project.id !== id)
          
          // If we're deleting the active project, switch to another one
          let newActiveProjectId = state.activeProjectId
          if (state.activeProjectId === id) {
            newActiveProjectId = newProjects.length > 0 ? newProjects[0].id : null
          }
          
          return {
            projects: newProjects,
            activeProjectId: newActiveProjectId,
          }
        })
      },
      
      setActiveProject: (id) => {
        set({ activeProjectId: id })
      },
      
      duplicateProject: (id, newName) => {
        const originalProject = get().getProject(id)
        if (!originalProject) return
        
        const now = new Date()
        const duplicatedProject: Project = {
          ...originalProject,
          id: crypto.randomUUID(),
          name: newName,
          createdAt: now,
          updatedAt: now,
          isActive: true,
        }
        
        set((state) => ({
          projects: [...state.projects, duplicatedProject],
        }))
      },
      
      // Computed getters
      activeProject: () => {
        const { projects, activeProjectId } = get()
        return projects.find((project) => project.id === activeProjectId) || null
      },
      
      getProject: (id) => {
        const { projects } = get()
        return projects.find((project) => project.id === id) || null
      },
      
      getProjectsByType: (type) => {
        const { projects } = get()
        return projects.filter((project) => project.type === type)
      },
    }),
    {
      name: 'dotoo-projects',
      partialize: (state) => ({ 
        projects: state.projects, 
        activeProjectId: state.activeProjectId 
      }),
    }
  )
)

export default useProjectStore 