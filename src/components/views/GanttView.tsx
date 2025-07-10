import { useState, useMemo, useRef, useEffect, useLayoutEffect } from 'react'
import { BarChart3, Calendar, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'
import useTodoStore from '../../stores/todoStore'
import useProjectStore from '../../stores/projectStore'
import type { Task, TaskStatus, Priority } from '../../types'
import Badge from '../ui/Badge'

interface GanttViewProps {
  onEdit?: (task: Task) => void
}

interface TimelineColumn {
  date: Date
  label: string
  isToday: boolean
  isWeekend?: boolean
  id: string
}

interface GanttTask {
  task: Task
  startDate: Date
  endDate: Date
  durationDays: number
  startColumnId: string
  endColumnId: string
  leftOffset: number
  width: number
}

// Helper function to parse any date format and ensure proper year
function parseDate(dateInput: Date | string): Date {
  if (!dateInput) return new Date()
  
  let result: Date
  
  if (dateInput instanceof Date) {
    result = new Date(dateInput)
  } else {
    // Handle string dates - ensure we get the right year
    const dateStr = dateInput.toString()
    if (dateStr.includes('-')) {
      // YYYY-MM-DD format - but force current year if it's wrong
      const [yearStr, monthStr, dayStr] = dateStr.split('-')
      let year = parseInt(yearStr)
      const month = parseInt(monthStr) - 1 // JS months are 0-indexed
      const day = parseInt(dayStr)
      
      // Force current year (2024) if year is clearly wrong
      const currentYear = new Date().getFullYear()
      if (year !== currentYear) {
        year = currentYear
      }
      
      result = new Date(year, month, day, 12, 0, 0)
    } else {
      result = new Date(dateInput)
    }
  }
  
  // Always set to noon to avoid timezone issues
  result.setHours(12, 0, 0, 0)
  return result
}

// Helper function to find the closest column for a date
function findClosestColumn(targetDate: Date, columns: TimelineColumn[]): string {
  let closestColumn = columns[0]
  let minDiff = Math.abs(targetDate.getTime() - columns[0].date.getTime())
  
  for (const column of columns) {
    const diff = Math.abs(targetDate.getTime() - column.date.getTime())
    if (diff < minDiff) {
      minDiff = diff
      closestColumn = column
    }
  }
  
  return closestColumn.id
}

export default function GanttView({ onEdit }: GanttViewProps) {
  const { filteredTasks, updateTask, updateTaskStatus } = useTodoStore()
  const { activeProject } = useProjectStore()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [statusDropdowns, setStatusDropdowns] = useState<Set<string>>(new Set())
  const [priorityDropdowns, setPriorityDropdowns] = useState<Set<string>>(new Set())
  const timelineRef = useRef<HTMLDivElement>(null)
  const [columnPositions, setColumnPositions] = useState<Map<string, { left: number, width: number }>>(new Map())

  const currentProject = activeProject()
  const tasks = filteredTasks().filter(task => task.dueDate)

  // Generate timeline columns for daily view
  const timelineData = useMemo(() => {
    const today = new Date()
    today.setHours(12, 0, 0, 0)
    
    // Show 4 weeks starting 4 days before today
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - 4)
    startDate.setHours(12, 0, 0, 0)
    
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 28) // 4 weeks from start
    endDate.setHours(12, 0, 0, 0)

    const columns: TimelineColumn[] = []

    // Generate daily columns
    const current = new Date(startDate)
    let columnIndex = 0
    while (current <= endDate) {
      const isToday = current.toDateString() === today.toDateString()
      const isWeekend = current.getDay() === 0 || current.getDay() === 6
      
      columns.push({
        date: new Date(current),
        label: current.getDate().toString(),
        isToday,
        isWeekend,
        id: `col-day-${columnIndex}`
      })
      
      current.setDate(current.getDate() + 1)
      columnIndex++
    }

    return { startDate, endDate, columns }
  }, [currentDate])

  // Calculate column positions after render
  useLayoutEffect(() => {
    const calculatePositions = () => {
      if (!timelineRef.current || timelineData.columns.length === 0) {
        console.log('Cannot calculate positions:', { 
          hasTimelineRef: !!timelineRef.current, 
          columnsCount: timelineData.columns.length 
        })
        return
      }
      
      const newPositions = new Map()
      let foundElements = 0
      
      timelineData.columns.forEach(column => {
        const element = document.getElementById(column.id)
        if (element && timelineRef.current) {
          const timelineRect = timelineRef.current.getBoundingClientRect()
          const columnRect = element.getBoundingClientRect()
          
          newPositions.set(column.id, {
            left: columnRect.left - timelineRect.left,
            width: columnRect.width
          })
          foundElements++
        } else {
          console.log('Missing element for column:', column.id)
        }
      })
      
      console.log('Position calculation:', { 
        totalColumns: timelineData.columns.length, 
        foundElements, 
        calculatedPositions: newPositions.size 
      })
      
      setColumnPositions(newPositions)
    }

    // Calculate positions immediately and after a short delay
    calculatePositions()
    const timeoutId = setTimeout(calculatePositions, 100)
    
    // Recalculate on window resize
    window.addEventListener('resize', calculatePositions)
    return () => {
      window.removeEventListener('resize', calculatePositions)
      clearTimeout(timeoutId)
    }
  }, [timelineData])

  // Convert tasks to Gantt format using column positions
  const ganttTasks = useMemo(() => {
    if (timelineData.columns.length === 0) return []
    
    // If positions aren't calculated yet, show tasks anyway but with basic positioning
    if (columnPositions.size === 0) {
      console.log('Positions not calculated yet, showing basic layout')
      return tasks.map(task => {
        const endDate = parseDate(task.dueDate!)
        const startDate = task.createdAt ? parseDate(task.createdAt) : new Date(endDate.getTime() - 3 * 24 * 60 * 60 * 1000)
        
        return {
          task,
          startDate,
          endDate,
          durationDays: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
          startColumnId: '',
          endColumnId: '',
          leftOffset: 0,
          width: 100
        }
      })
    }
    
    return tasks.map(task => {
      // Parse dates using helper function
      const endDate = parseDate(task.dueDate!)
      const startDate = task.createdAt ? parseDate(task.createdAt) : new Date(endDate.getTime() - 3 * 24 * 60 * 60 * 1000)

      // Ensure minimum duration of 1 day
      if (endDate <= startDate) {
        endDate.setTime(startDate.getTime() + 24 * 60 * 60 * 1000)
      }

      const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      
      // Find the closest columns for start and end dates
      const startColumnId = findClosestColumn(startDate, timelineData.columns)
      const endColumnId = findClosestColumn(endDate, timelineData.columns)
      
      // Get column positions
      const startColumnPos = columnPositions.get(startColumnId)
      const endColumnPos = columnPositions.get(endColumnId)
      
      if (!startColumnPos || !endColumnPos) {
        return null // Skip if positions not calculated yet
      }
      
      // Calculate task bar position and width
      const leftOffset = startColumnPos.left
      const rightOffset = endColumnPos.left + endColumnPos.width
      const width = Math.max(20, rightOffset - leftOffset) // Minimum 20px width

      return {
        task,
        startDate,
        endDate,
        durationDays,
        startColumnId,
        endColumnId,
        leftOffset,
        width
      }
    }).filter(Boolean) as GanttTask[]
  }, [tasks, timelineData, columnPositions])

  const navigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7)) // Navigate by week
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateTaskStatus(taskId, newStatus)
    setStatusDropdowns(prev => {
      const newSet = new Set(prev)
      newSet.delete(taskId)
      return newSet
    })
  }

  const handlePriorityChange = (taskId: string, newPriority: Priority) => {
    updateTask(taskId, { priority: newPriority })
    setPriorityDropdowns(prev => {
      const newSet = new Set(prev)
      newSet.delete(taskId)
      return newSet
    })
  }

  const toggleStatusDropdown = (taskId: string) => {
    setStatusDropdowns(prev => {
      const newSet = new Set(prev)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      } else {
        newSet.add(taskId)
      }
      return newSet
    })
    // Close priority dropdown if open
    setPriorityDropdowns(prev => {
      const newSet = new Set(prev)
      newSet.delete(taskId)
      return newSet
    })
  }

  const togglePriorityDropdown = (taskId: string) => {
    setPriorityDropdowns(prev => {
      const newSet = new Set(prev)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      } else {
        newSet.add(taskId)
      }
      return newSet
    })
    // Close status dropdown if open
    setStatusDropdowns(prev => {
      const newSet = new Set(prev)
      newSet.delete(taskId)
      return newSet
    })
  }

  const getTaskBarColor = (task: Task) => {
    switch (task.status) {
      case 'done':
        return 'bg-green-500 border-green-600'
      case 'doing':
        return 'bg-blue-500 border-blue-600'
      default:
        return 'bg-gray-500 border-gray-600'
    }
  }

  const getPriorityBorder = (task: Task) => {
    if (task.priority === 'critical') return 'border-red-500 border-2'
    if (task.priority === 'high') return 'border-orange-500 border-2'
    return ''
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setStatusDropdowns(new Set())
      setPriorityDropdowns(new Set())
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <div className="text-lg font-medium mb-2">No Project Selected</div>
          <div className="text-sm">Select a project to view Gantt chart</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-background border border-border rounded-lg p-4 gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <BarChart3 size={20} className="text-primary" />
            <span className="font-semibold text-foreground">Gantt Chart</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {ganttTasks.length} task{ganttTasks.length !== 1 ? 's' : ''} with due dates
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('prev')}
              className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={goToToday}
              className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => navigate('next')}
              className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="bg-background border border-border rounded-lg overflow-hidden shadow-sm">
        {ganttTasks.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <Calendar size={32} className="mx-auto mb-2 opacity-50" />
              <div className="text-sm">No tasks with due dates</div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Timeline Header */}
            <div className="flex border-b border-border">
              <div className="w-80 p-3 bg-muted/30 border-r border-border font-medium text-foreground">
                Task
              </div>
              <div className="flex-1 min-w-0" ref={timelineRef}>
                <div className="flex">
                  {timelineData.columns.map((col) => (
                    <div
                      key={col.id}
                      id={col.id}
                      className={`flex-1 min-w-[60px] p-2 text-center text-xs border-r border-border ${
                        col.isToday 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : col.isWeekend 
                            ? 'bg-muted/50 text-muted-foreground'
                            : 'bg-muted/30 text-foreground'
                      }`}
                    >
                      <div>{col.label}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {col.date.toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Task Rows */}
            <div className="relative">
              {ganttTasks.map((item) => (
                <div key={item.task.id} className="flex border-b border-border hover:bg-muted/20 transition-colors">
                  {/* Task Info Column */}
                  <div className="w-80 p-3 border-r border-border">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-foreground truncate">
                          {item.task.title}
                        </div>
                        
                        {/* Editable Status and Priority */}
                        <div className="flex items-center gap-1 mt-1 relative">
                          {/* Status Badge/Dropdown */}
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleStatusDropdown(item.task.id)
                              }}
                              className="flex items-center gap-1 hover:bg-muted/50 rounded px-1 transition-colors"
                            >
                              <Badge variant={item.task.status} className="text-xs">
                                {item.task.status === 'doing' ? 'In Progress' : 
                                 item.task.status === 'done' ? 'Done' : 'To Do'}
                              </Badge>
                              <ChevronDown size={10} className="text-muted-foreground" />
                            </button>
                            
                            {statusDropdowns.has(item.task.id) && (
                              <div className="absolute top-full left-0 z-50 bg-background border border-border rounded-md shadow-lg py-1 min-w-[120px]">
                                {(['todo', 'doing', 'done'] as TaskStatus[]).map(status => (
                                  <button
                                    key={status}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleStatusChange(item.task.id, status)
                                    }}
                                    className="w-full text-left px-3 py-1 text-xs hover:bg-muted/50 transition-colors"
                                  >
                                    <Badge variant={status} className="text-xs">
                                      {status === 'doing' ? 'In Progress' : 
                                       status === 'done' ? 'Done' : 'To Do'}
                                    </Badge>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Priority Badge/Dropdown */}
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                togglePriorityDropdown(item.task.id)
                              }}
                              className="flex items-center gap-1 hover:bg-muted/50 rounded px-1 transition-colors"
                            >
                              <Badge variant={item.task.priority} className="text-xs">
                                {item.task.priority}
                              </Badge>
                              <ChevronDown size={10} className="text-muted-foreground" />
                            </button>
                            
                            {priorityDropdowns.has(item.task.id) && (
                              <div className="absolute top-full left-0 z-50 bg-background border border-border rounded-md shadow-lg py-1 min-w-[100px]">
                                {(['low', 'medium', 'high', 'critical'] as Priority[]).map(priority => (
                                  <button
                                    key={priority}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handlePriorityChange(item.task.id, priority)
                                    }}
                                    className="w-full text-left px-3 py-1 text-xs hover:bg-muted/50 transition-colors"
                                  >
                                    <Badge variant={priority} className="text-xs">
                                      {priority}
                                    </Badge>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-xs text-muted-foreground mt-1">
                          {item.startDate.toLocaleDateString()} → {item.endDate.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Column */}
                  <div className="flex-1 min-w-0 relative h-20 flex items-center">
                    {/* Today line */}
                    {timelineData.columns.map((col) => 
                      col.isToday ? (
                        <div
                          key={`today-${col.id}`}
                          className="absolute top-0 bottom-0 w-0.5 bg-primary/50 z-10"
                          style={{ 
                            left: `${columnPositions.get(col.id)?.left || 0}px`,
                            width: '2px'
                          }}
                        />
                      ) : null
                    )}
                    
                    {/* Task Bar - positioned absolutely using calculated positions */}
                    <div
                      className={`absolute h-8 rounded-md shadow-sm cursor-pointer transition-all hover:shadow-md z-20 ${
                        getTaskBarColor(item.task)
                      } ${getPriorityBorder(item.task)}`}
                      style={{
                        left: `${item.leftOffset}px`,
                        width: `${item.width}px`,
                        minWidth: '20px'
                      }}
                      onClick={() => setSelectedTask(item.task)}
                      title={`${item.task.title} (${item.startDate.toLocaleDateString()} - ${item.endDate.toLocaleDateString()})`}
                    >
                      {/* Progress indicator */}
                      {item.task.status === 'doing' && (
                        <div className="absolute inset-0 bg-white/20 rounded-md animate-pulse" />
                      )}
                      
                      {/* Task title inside bar if wide enough */}
                      {item.width > 80 && (
                        <div className="absolute inset-0 flex items-center px-2">
                          <span className="text-white text-xs font-medium truncate">
                            {item.task.title}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedTask(null)}>
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-background border border-border rounded-lg shadow-lg">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground pr-4">
                  {selectedTask.title}
                </h3>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
                >
                  ×
                </button>
              </div>
              
              {selectedTask.description && (
                <p className="text-sm text-muted-foreground mb-4">
                  {selectedTask.description}
                </p>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={selectedTask.category}>
                    {selectedTask.category.charAt(0).toUpperCase() + selectedTask.category.slice(1)}
                  </Badge>
                  <Badge variant={selectedTask.priority}>
                    {selectedTask.priority.charAt(0).toUpperCase() + selectedTask.priority.slice(1)}
                  </Badge>
                  <Badge variant={selectedTask.status}>
                    {selectedTask.status === 'todo' ? 'To Do' : selectedTask.status === 'doing' ? 'In Progress' : 'Done'}
                  </Badge>
                </div>

                {selectedTask.dueDate && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Due date: </span>
                    <span className="text-foreground font-medium">
                      {parseDate(selectedTask.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <div className="text-sm">
                  <span className="text-muted-foreground">Created: </span>
                  <span className="text-foreground">
                    {parseDate(selectedTask.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setSelectedTask(null)}
                  className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Close
                </button>
                {onEdit && (
                  <button
                    onClick={() => {
                      onEdit(selectedTask)
                      setSelectedTask(null)
                    }}
                    className="px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Edit Task
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 