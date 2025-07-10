import { Search, Filter, X } from 'lucide-react'
import useTodoStore from '../stores/todoStore'

interface SearchResultsProps {
  onNewTask: () => void
}

export default function SearchResults({ onNewTask }: SearchResultsProps) {
  const { searchFilters, filteredTasks, clearFilters } = useTodoStore()
  
  const hasActiveFilters = searchFilters.query || searchFilters.category || searchFilters.priority || searchFilters.status || 
    searchFilters.tags?.length || searchFilters.hasCode !== undefined || searchFilters.hasDueDate !== undefined || searchFilters.isOverdue
  const filteredCount = filteredTasks().length
  const totalCount = useTodoStore.getState().tasks.length

  if (!hasActiveFilters) {
    return null
  }

  return (
    <div className="bg-background border border-border rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search size={14} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {filteredCount === totalCount 
              ? `Showing all ${totalCount} tasks`
              : `Found ${filteredCount} of ${totalCount} tasks`
            }
          </span>
        </div>
        
        <button
          onClick={clearFilters}
          className="flex items-center gap-1 px-2 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={14} />
          <span>Clear filters</span>
        </button>
      </div>

      {filteredCount === 0 && (
        <div className="text-center py-6">
          <Filter size={32} className="mx-auto text-muted-foreground mb-3" />
          <h3 className="text-base font-medium text-foreground mb-2">No tasks found</h3>
          <p className="text-muted-foreground mb-3 text-sm">
            No tasks match your current search criteria. Try adjusting your filters or create a new task.
          </p>
          <button
            onClick={onNewTask}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
          >
            Create New Task
          </button>
        </div>
      )}
    </div>
  )
} 