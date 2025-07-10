import { Plus, FolderOpen } from 'lucide-react'
import Button from '../ui/Button'
import useProjectStore from '../../stores/projectStore'

interface EmptyStateProps {
  onNewTask: () => void
}

export default function EmptyState({ onNewTask }: EmptyStateProps) {
  const { activeProject } = useProjectStore()
  const currentProject = activeProject()

  if (!currentProject) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="text-muted-foreground mb-4">
          <FolderOpen size={48} className="mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          No Project Selected
        </h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Select a project from the dropdown above to start managing your tasks
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <div className="text-muted-foreground mb-4">
        <Plus size={48} className="mx-auto" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">
        No tasks in {currentProject.name}
      </h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Create your first task to get started with your project management
      </p>
      <Button onClick={onNewTask} size="default" className="gap-2">
        <Plus size={16} />
        Create Task
      </Button>
    </div>
  )
} 