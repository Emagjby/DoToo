import React, { useState, useRef, useEffect, forwardRef } from 'react'
import { Search, X, Filter, ChevronDown, Tag, AlertTriangle, CheckCircle, Clock, ChevronUp } from 'lucide-react'
import useTodoStore from '../stores/todoStore'
import type { Category, Priority, TaskStatus } from '../types'
import AdvancedFilters from './AdvancedFilters'

const categoryOptions = [
  { value: 'feature', label: 'Feature', icon: '✨' },
  { value: 'bug', label: 'Bug', icon: '🐛' },
  { value: 'docs', label: 'Documentation', icon: '📚' },
  { value: 'refactor', label: 'Refactor', icon: '🔧' },
  { value: 'test', label: 'Test', icon: '🧪' },
  { value: 'chore', label: 'Chore', icon: '📦' },
] as const

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'text-green-500' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-500' },
  { value: 'high', label: 'High', color: 'text-orange-500' },
  { value: 'critical', label: 'Critical', color: 'text-red-500' },
] as const

const statusOptions = [
  { value: 'todo', label: 'To Do', icon: Clock },
  { value: 'doing', label: 'In Progress', icon: AlertTriangle },
  { value: 'done', label: 'Done', icon: CheckCircle },
] as const

interface SearchBarProps {
  onToggleExpanded?: (expanded: boolean) => void
}

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(({ onToggleExpanded }, ref) => {
  const { searchFilters, setSearchFilters, clearFilters, tasks } = useTodoStore()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [isPriorityOpen, setIsPriorityOpen] = useState(false)
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const categoryRef = useRef<HTMLDivElement>(null)
  const priorityRef = useRef<HTMLDivElement>(null)
  const statusRef = useRef<HTMLDivElement>(null)

  // Don't show search if no tasks
  if (tasks.length === 0) {
    return null
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false)
      }
      if (priorityRef.current && !priorityRef.current.contains(event.target as Node)) {
        setIsPriorityOpen(false)
      }
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setIsStatusOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggleExpanded = () => {
    const newExpanded = !isExpanded
    setIsExpanded(newExpanded)
    onToggleExpanded?.(newExpanded)
  }

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchFilters({ query: e.target.value })
  }

  const handleCategorySelect = (category: Category) => {
    setSearchFilters({ category: searchFilters.category === category ? undefined : category })
    setIsCategoryOpen(false)
  }

  const handlePrioritySelect = (priority: Priority) => {
    setSearchFilters({ priority: searchFilters.priority === priority ? undefined : priority })
    setIsPriorityOpen(false)
  }

  const handleStatusSelect = (status: TaskStatus) => {
    setSearchFilters({ status: searchFilters.status === status ? undefined : status })
    setIsStatusOpen(false)
  }

  const hasActiveFilters = searchFilters.query || searchFilters.category || searchFilters.priority || searchFilters.status || 
    searchFilters.tags?.length || searchFilters.hasCode !== undefined || searchFilters.hasDueDate !== undefined || searchFilters.isOverdue

  const selectedCategory = categoryOptions.find(cat => cat.value === searchFilters.category)
  const selectedPriority = priorityOptions.find(pri => pri.value === searchFilters.priority)
  const selectedStatus = statusOptions.find(status => status.value === searchFilters.status)

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Compact Search Toggle */}
      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleExpanded}
            className="mb-4 mt-0 flex items-center gap-3 px-24 py-2 bg-background border border-border rounded-lg hover:border-primary/50 transition-colors min-w-[200px] justify-center"
          >
            <Search size={18} className="text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              {hasActiveFilters ? 'Search & Filters Active' : 'Search & Filters'}
            </span>
            {hasActiveFilters && (
              <div className="w-2 h-2 bg-primary rounded-full"></div>
            )}
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors bg-background border border-border rounded-lg hover:border-primary/50"
            >
              <X size={14} />
              <span>Clear all</span>
            </button>
          )}
        </div>
      </div>

      {/* Expanded Search Content */}
      {isExpanded && (
        <div className="space-y-4">
          {/* Main Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              ref={ref}
              type="text"
              placeholder="Search tasks by title, description, or tags..."
              value={searchFilters.query}
              onChange={handleQueryChange}
              className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
            {searchFilters.query && (
              <button
                onClick={() => setSearchFilters({ query: '' })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Advanced Filters */}
          <AdvancedFilters />

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter size={16} />
              <span>Quick Filters:</span>
            </div>

            {/* Category Filter */}
            <div className="relative" ref={categoryRef}>
              <button
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md border transition-colors ${
                  searchFilters.category
                    ? 'bg-primary/10 border-primary/20 text-primary'
                    : 'bg-background border-border hover:border-primary/50'
                }`}
              >
                <Tag size={14} />
                <span className="text-sm">
                  {selectedCategory ? selectedCategory.label : 'Category'}
                </span>
                <ChevronDown size={14} className={`transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCategoryOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-background border border-border rounded-lg shadow-lg z-50">
                  <div className="p-2">
                    {categoryOptions.map((category) => (
                      <button
                        key={category.value}
                        onClick={() => handleCategorySelect(category.value)}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-sm transition-colors ${
                          searchFilters.category === category.value
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-accent'
                        }`}
                      >
                        <span>{category.icon}</span>
                        <span>{category.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Priority Filter */}
            <div className="relative" ref={priorityRef}>
              <button
                onClick={() => setIsPriorityOpen(!isPriorityOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md border transition-colors ${
                  searchFilters.priority
                    ? 'bg-primary/10 border-primary/20 text-primary'
                    : 'bg-background border-border hover:border-primary/50'
                }`}
              >
                <AlertTriangle size={14} />
                <span className="text-sm">
                  {selectedPriority ? selectedPriority.label : 'Priority'}
                </span>
                <ChevronDown size={14} className={`transition-transform ${isPriorityOpen ? 'rotate-180' : ''}`} />
              </button>

              {isPriorityOpen && (
                <div className="absolute top-full left-0 mt-1 w-32 bg-background border border-border rounded-lg shadow-lg z-50">
                  <div className="p-2">
                    {priorityOptions.map((priority) => (
                      <button
                        key={priority.value}
                        onClick={() => handlePrioritySelect(priority.value)}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-sm transition-colors ${
                          searchFilters.priority === priority.value
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-accent'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${priority.color.replace('text-', 'bg-')}`} />
                        <span>{priority.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Status Filter */}
            <div className="relative" ref={statusRef}>
              <button
                onClick={() => setIsStatusOpen(!isStatusOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md border transition-colors ${
                  searchFilters.status
                    ? 'bg-primary/10 border-primary/20 text-primary'
                    : 'bg-background border-border hover:border-primary/50'
                }`}
              >
                <CheckCircle size={14} />
                <span className="text-sm">
                  {selectedStatus ? selectedStatus.label : 'Status'}
                </span>
                <ChevronDown size={14} className={`transition-transform ${isStatusOpen ? 'rotate-180' : ''}`} />
              </button>

              {isStatusOpen && (
                <div className="absolute top-full left-0 mt-1 w-36 bg-background border border-border rounded-lg shadow-lg z-50">
                  <div className="p-2">
                    {statusOptions.map((status) => {
                      const IconComponent = status.icon
                      return (
                        <button
                          key={status.value}
                          onClick={() => handleStatusSelect(status.value)}
                          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-sm transition-colors ${
                            searchFilters.status === status.value
                              ? 'bg-primary/10 text-primary'
                              : 'hover:bg-accent'
                          }`}
                        >
                          <IconComponent size={14} />
                          <span>{status.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {searchFilters.query && (
                <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-sm">
                  <span>"{searchFilters.query}"</span>
                  <button
                    onClick={() => setSearchFilters({ query: '' })}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              
              {searchFilters.category && (
                <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-sm">
                  <span>{selectedCategory?.icon}</span>
                  <span>{selectedCategory?.label}</span>
                  <button
                    onClick={() => setSearchFilters({ category: undefined })}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              
              {searchFilters.priority && (
                <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-sm">
                  <div className={`w-2 h-2 rounded-full ${selectedPriority?.color.replace('text-', 'bg-')}`} />
                  <span>{selectedPriority?.label}</span>
                  <button
                    onClick={() => setSearchFilters({ priority: undefined })}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              
              {searchFilters.status && (
                <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-sm">
                  {selectedStatus && <selectedStatus.icon size={12} />}
                  <span>{selectedStatus?.label}</span>
                  <button
                    onClick={() => setSearchFilters({ status: undefined })}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              
              {searchFilters.tags?.map(tag => (
                <div key={tag} className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-sm">
                  <Tag size={12} />
                  <span>{tag}</span>
                  <button
                    onClick={() => {
                      const newTags = searchFilters.tags?.filter(t => t !== tag)
                      setSearchFilters({ tags: newTags?.length ? newTags : undefined })
                    }}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              
              {searchFilters.hasCode !== undefined && (
                <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-sm">
                  <span>{searchFilters.hasCode ? 'Has Code' : 'No Code'}</span>
                  <button
                    onClick={() => setSearchFilters({ hasCode: undefined })}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              
              {searchFilters.hasDueDate !== undefined && (
                <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-sm">
                  <span>{searchFilters.hasDueDate ? 'Has Due Date' : 'No Due Date'}</span>
                  <button
                    onClick={() => setSearchFilters({ hasDueDate: undefined })}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              
              {searchFilters.isOverdue && (
                <div className="flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-500 rounded-md text-sm">
                  <Clock size={12} />
                  <span>Overdue</span>
                  <button
                    onClick={() => setSearchFilters({ isOverdue: undefined })}
                    className="hover:bg-red-500/20 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
})

SearchBar.displayName = 'SearchBar'

export default SearchBar 