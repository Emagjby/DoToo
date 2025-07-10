import { useState } from 'react'
import { Code, Calendar, Clock, Tag, ChevronDown, ChevronUp } from 'lucide-react'
import useTodoStore from '../stores/todoStore'

export default function AdvancedFilters() {
  const { searchFilters, setSearchFilters, tasks } = useTodoStore()
  const [isExpanded, setIsExpanded] = useState(false)

  // Get all unique tags from tasks
  const allTags = Array.from(new Set(
    tasks.flatMap(task => task.tags || [])
  )).sort()

  const handleTagToggle = (tag: string) => {
    const currentTags = searchFilters.tags || []
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag]
    
    setSearchFilters({ tags: newTags.length > 0 ? newTags : undefined })
  }

  const handleCodeFilter = (hasCode: boolean) => {
    setSearchFilters({ hasCode: searchFilters.hasCode === hasCode ? undefined : hasCode })
  }

  const handleDueDateFilter = (hasDueDate: boolean) => {
    setSearchFilters({ hasDueDate: searchFilters.hasDueDate === hasDueDate ? undefined : hasDueDate })
  }

  const handleOverdueFilter = () => {
    setSearchFilters({ isOverdue: searchFilters.isOverdue === true ? undefined : true })
  }

  const hasAdvancedFilters = searchFilters.tags?.length || 
    searchFilters.hasCode !== undefined || 
    searchFilters.hasDueDate !== undefined || 
    searchFilters.isOverdue

  return (
    <div className="bg-background border border-border rounded-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Tag size={16} className="text-muted-foreground" />
          <span className="text-sm font-medium">Advanced Filters</span>
          {hasAdvancedFilters && (
            <div className="w-2 h-2 bg-primary rounded-full"></div>
          )}
        </div>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isExpanded && (
        <div className="border-t border-border p-4 space-y-4">
          {/* Tags */}
          {allTags.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-2 py-1 rounded-md text-xs transition-colors ${
                      searchFilters.tags?.includes(tag)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-accent text-foreground hover:bg-accent/80'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Code Filter */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Code</h4>
            <div className="flex gap-2">
              <button
                onClick={() => handleCodeFilter(true)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  searchFilters.hasCode === true
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'bg-accent hover:bg-accent/80'
                }`}
              >
                <Code size={14} />
                <span>Has Code</span>
              </button>
              <button
                onClick={() => handleCodeFilter(false)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  searchFilters.hasCode === false
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'bg-accent hover:bg-accent/80'
                }`}
              >
                <span>No Code</span>
              </button>
            </div>
          </div>

          {/* Due Date Filter */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Due Date</h4>
            <div className="flex gap-2">
              <button
                onClick={() => handleDueDateFilter(true)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  searchFilters.hasDueDate === true
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'bg-accent hover:bg-accent/80'
                }`}
              >
                <Calendar size={14} />
                <span>Has Due Date</span>
              </button>
              <button
                onClick={() => handleDueDateFilter(false)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  searchFilters.hasDueDate === false
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'bg-accent hover:bg-accent/80'
                }`}
              >
                <span>No Due Date</span>
              </button>
            </div>
          </div>

          {/* Overdue Filter */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Status</h4>
            <button
              onClick={handleOverdueFilter}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                searchFilters.isOverdue
                  ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                  : 'bg-accent hover:bg-accent/80'
              }`}
            >
              <Clock size={14} />
              <span>Overdue</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 