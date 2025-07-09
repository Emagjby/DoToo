import useTodoStore from '../stores/todoStore'
import useProjectStore from '../stores/projectStore'
import { PROJECT_TYPES } from '../types'

export function migrateToMultiProject() {
  const { tasks } = useTodoStore.getState()
  const { projects, createProject } = useProjectStore.getState()
  
  // If there are no projects but there are tasks, create a default project
  if (projects.length === 0 && tasks.length > 0) {
    const defaultProjectType = PROJECT_TYPES.development
    
    createProject({
      name: 'Default Project',
      description: 'Migrated from existing tasks',
      type: 'development',
      viewType: defaultProjectType.defaultViewType,
      color: defaultProjectType.color,
      icon: defaultProjectType.icon,
      settings: defaultProjectType.defaultSettings,
    })
    
    // Update all existing tasks to belong to the default project
    const defaultProject = useProjectStore.getState().activeProject()
    if (defaultProject) {
      const { updateTask } = useTodoStore.getState()
      
      tasks.forEach(task => {
        if (!task.projectId) {
          updateTask(task.id, { projectId: defaultProject.id })
        }
      })
    }
  }
}

export function initializeDefaultProject() {
  const { projects, createProject } = useProjectStore.getState()
  
  // If no projects exist, create a welcome project
  if (projects.length === 0) {
    const welcomeProjectType = PROJECT_TYPES.development
    
    createProject({
      name: 'Welcome to DoToo',
      description: 'Your first project to get started',
      type: 'development',
      viewType: welcomeProjectType.defaultViewType,
      color: welcomeProjectType.color,
      icon: welcomeProjectType.icon,
      settings: welcomeProjectType.defaultSettings,
    })
  }
} 