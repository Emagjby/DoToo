import React, { useState } from 'react'
import { ChevronDown, ChevronUp, SortAsc, SortDesc, Filter, MoreHorizontal, Circle, CheckCircle, AlertTriangle } from 'lucide-react'
import useTodoStore from '../../stores/todoStore'
import useProjectStore from '../../stores/projectStore'
import type { Task, ListViewConfig } from '../../types'
import ListTaskItem from './ListTaskItem'

interface ListViewProps {
  onEdit?: (task: Task) => void
}

export default function ListView({ onEdit }: ListViewProps) {
  const { filteredTasks } = useTodoStore()
  const { activeProject } = useProjectStore()
  const [config, setConfig] = useState<ListViewConfig>({
    sortBy: 'createdAt',
    sortOrder: 'desc',
    groupBy: undefined,
    showCompleted: true,
  })

  const currentProject = activeProject()
  const tasks = filteredTasks()

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <div className="text-lg font-medium mb-2">No Project Selected</div>
          <div className="text-sm">Select a project to view tasks</div>
        </div>
      </div>
    )
  }

  const sortTasks = (tasks: Task[]) => {
    return [...tasks].sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (config.sortBy) {
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'priority':
          const priorityOrder = { low: 1, medium: 2, high: 3, critical: 4 }
          aValue = priorityOrder[a.priority]
          bValue = priorityOrder[b.priority]
          break
        case 'dueDate':
          aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0
          bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0
          break
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        case 'category':
          aValue = a.category
          bValue = b.category
          break
        case 'status':
          const statusOrder = { todo: 1, doing: 2, done: 3 }
          aValue = statusOrder[a.status]
          bValue = statusOrder[b.status]
          break
        default:
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
      }

      if (config.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }

  const groupTasks = (tasks: Task[]) => {
    if (!config.groupBy) return { 'All Tasks': tasks }

    const groups: Record<string, Task[]> = {}

    tasks.forEach(task => {
      let groupKey = 'All Tasks'
      
      switch (config.groupBy) {
        case 'category':
          groupKey = task.category.charAt(0).toUpperCase() + task.category.slice(1)
          break
        case 'priority':
          groupKey = task.priority.charAt(0).toUpperCase() + task.priority.slice(1)
          break
        case 'status':
          groupKey = task.status === 'todo' ? 'To Do' : 
                    task.status === 'doing' ? 'In Progress' : 'Done'
          break
        case 'assignedTo':
          groupKey = task.assignedTo || 'Unassigned'
          break
      }

      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(task)
    })

    return groups
  }

  const filteredAndSortedTasks = sortTasks(tasks.filter(task => 
    config.showCompleted || task.status !== 'done'
  ))
  const groupedTasks = groupTasks(filteredAndSortedTasks)

  const getSortIcon = (field: string) => {
    if (config.sortBy !== field) return null
    return config.sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
  }

  const handleSort = (field: ListViewConfig['sortBy']) => {
    setConfig(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleGroupBy = (groupBy: ListViewConfig['groupBy']) => {
    setConfig(prev => ({
      ...prev,
      groupBy: prev.groupBy === groupBy ? undefined : groupBy
    }))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'todo':
        return <Circle size={14} className="text-muted-foreground" />
      case 'doing':
        return <AlertTriangle size={14} className="text-blue-500" />
      case 'done':
        return <CheckCircle size={14} className="text-green-500" />
      default:
        return <Circle size={14} className="text-muted-foreground" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'todo':
        return 'To Do'
      case 'doing':
        return 'In Progress'
      case 'done':
        return 'Done'
      default:
        return 'To Do'
    }
  }

  return (
    <div className="space-y-6">
      {/* List Controls */}
      <div className="flex items-center justify-between bg-background border border-border rounded-lg p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Sort by:</span>
            <div className="flex items-center gap-1">
              {(['title', 'priority', 'status', 'dueDate', 'createdAt', 'category'] as const).map(field => (
                <button
                  key={field}
                  onClick={() => handleSort(field)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                    config.sortBy === field
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                  {getSortIcon(field)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Group by:</span>
            <div className="flex items-center gap-1">
              {(['category', 'priority', 'status', 'assignedTo'] as const).map(field => (
                <button
                  key={field}
                  onClick={() => handleGroupBy(field)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                    config.groupBy === field
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {field === 'assignedTo' ? 'Assigned To' : 
                   field.charAt(0).toUpperCase() + field.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={config.showCompleted}
              onChange={(e) => setConfig(prev => ({ ...prev, showCompleted: e.target.checked }))}
              className="rounded border-border"
            />
            Show completed
          </label>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-6">
        {Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
          <div key={groupName} className="space-y-3">
            {config.groupBy && (
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-foreground">{groupName}</h3>
                <span className="text-sm text-muted-foreground">({groupTasks.length})</span>
                {config.groupBy === 'status' && (
                  <div className="flex items-center gap-1 ml-2">
                    {getStatusIcon(groupName.toLowerCase())}
                    <span className="text-xs text-muted-foreground">
                      {getStatusLabel(groupName.toLowerCase())}
                    </span>
                  </div>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              {groupTasks.map((task) => (
                <ListTaskItem
                  key={task.id}
                  task={task}
                  onEdit={onEdit || (() => {})}
                />
              ))}
            </div>
          </div>
        ))}

        {filteredAndSortedTasks.length === 0 && (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <div className="text-lg font-medium mb-2">No tasks found</div>
              <div className="text-sm">
                {config.showCompleted ? 'Create your first task to get started' : 'No incomplete tasks found'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 