import { CheckCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react'
import useTodoStore from '../stores/todoStore'
import useProjectStore from '../stores/projectStore'

interface TaskStatsProps {
  isSearchExpanded: boolean
}

export default function TaskStats({ isSearchExpanded }: TaskStatsProps) {
  const { tasks, setSearchFilters } = useTodoStore()
  const { activeProject } = useProjectStore()
  
  // Filter tasks by active project
  const projectTasks = activeProject() ? tasks.filter(task => task.projectId === activeProject()?.id) : tasks
  
  const totalTasks = projectTasks.length
  const completedCount = projectTasks.filter(task => task.status === 'done').length
  const inProgressCount = projectTasks.filter(task => task.status === 'doing').length
  const todoCount = projectTasks.filter(task => task.status === 'todo').length

  const highPriorityCount = projectTasks.filter(task => task.priority === 'high' || task.priority === 'critical').length

  const handleQuickFilter = (status: 'todo' | 'doing' | 'done' | 'high-priority' | 'overdue') => {
    if (status === 'high-priority') {
      setSearchFilters({ priority: 'high' })
    } else if (status === 'overdue') {
      // For now, we'll just show a message since we don't have overdue filter in the store yet
      setSearchFilters({ status: 'todo' })
    } else {
      setSearchFilters({ status })
    }
  }

  // Don't show stats if no tasks or search is not expanded
  if (totalTasks === 0 || !isSearchExpanded) {
    return <div className="hidden" /> // Keep component mounted but hidden
  }

  return (
    <div className="space-y-3">
      {/* Project Indicator */}
      {activeProject() && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp size={14} />
          <span>Showing stats for:</span>
          <div className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded-md">
            <div 
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: activeProject()?.color }}
            />
            <span className="font-medium">{activeProject()?.name}</span>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {/* Total Tasks */}
      <div className="bg-background border border-border rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={14} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Total</span>
        </div>
        <div className="text-xl font-bold text-foreground">{totalTasks}</div>
      </div>

      {/* To Do */}
      <button
        onClick={() => handleQuickFilter('todo')}
        className="bg-background border border-border rounded-lg p-3 hover:border-primary/50 transition-colors text-left"
      >
        <div className="flex items-center gap-2 mb-1">
          <Clock size={14} className="text-blue-500" />
          <span className="text-xs text-muted-foreground">To Do</span>
        </div>
        <div className="text-xl font-bold text-blue-500">{todoCount}</div>
      </button>

      {/* In Progress */}
      <button
        onClick={() => handleQuickFilter('doing')}
        className="bg-background border border-border rounded-lg p-3 hover:border-primary/50 transition-colors text-left"
      >
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle size={14} className="text-orange-500" />
          <span className="text-xs text-muted-foreground">In Progress</span>
        </div>
        <div className="text-xl font-bold text-orange-500">{inProgressCount}</div>
      </button>

      {/* Done */}
      <button
        onClick={() => handleQuickFilter('done')}
        className="bg-background border border-border rounded-lg p-3 hover:border-primary/50 transition-colors text-left"
      >
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle size={14} className="text-green-500" />
          <span className="text-xs text-muted-foreground">Done</span>
        </div>
        <div className="text-xl font-bold text-green-500">{completedCount}</div>
      </button>

      {/* High Priority */}
      <button
        onClick={() => handleQuickFilter('high-priority')}
        className="bg-background border border-border rounded-lg p-3 hover:border-primary/50 transition-colors text-left"
      >
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle size={14} className="text-red-500" />
          <span className="text-xs text-muted-foreground">High Priority</span>
        </div>
        <div className="text-xl font-bold text-red-500">{highPriorityCount}</div>
      </button>
      </div>
    </div>
  )
} 