import React, { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Plus, Eye, Edit, Circle, CheckCircle, AlertTriangle, Clock, X, GripVertical } from 'lucide-react'
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import useTodoStore from '../../stores/todoStore'
import useProjectStore from '../../stores/projectStore'
import type { Task, CalendarViewConfig, TaskStatus } from '../../types'
import Badge from '../ui/Badge'

interface CalendarViewProps {
  onEdit?: (task: Task) => void
}

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  tasks: Task[]
}

interface WeekData {
  weekStart: Date
  days: CalendarDay[]
}

interface MonthData {
  month: Date
  weeks: WeekData[]
  totalTasks: number
}

interface DraggableTaskCardProps {
  task: Task
  onEdit?: (task: Task) => void
  getTaskColor: (task: Task) => 'default' | 'feature' | 'bug' | 'docs' | 'refactor' | 'test' | 'chore' | 'low' | 'medium' | 'high' | 'critical' | 'todo' | 'doing' | 'done'
  getStatusIcon: (task: Task) => React.ReactNode
  isOverdue: (task: Task) => boolean
  isWarning: (task: Task) => boolean
  getDaysUntilDue: (task: Task) => number | null
  colorBy: 'category' | 'priority'
  setSelectedTask: (task: Task | null) => void
}

interface DroppableCalendarDayProps {
  day: CalendarDay
  children: React.ReactNode
}

function DraggableTaskCard({ 
  task, 
  onEdit, 
  getTaskColor, 
  getStatusIcon, 
  isOverdue, 
  isWarning, 
  getDaysUntilDue, 
  colorBy,
  setSelectedTask 
}: DraggableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: task.id,
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  const getTaskBorderClass = (task: Task) => {
    if (isOverdue(task)) {
      return 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950'
    }
    if (isWarning(task)) {
      return 'border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-950'
    }
    return 'border-border hover:border-primary/50'
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group cursor-pointer p-1.5 rounded text-xs border hover:shadow-sm ${getTaskBorderClass(task)} ${
        isDragging ? 'opacity-0 pointer-events-none' : 'transition-all'
      }`}
      onClick={(e) => {
        if (!isDragging) {
          setSelectedTask(task)
        }
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <div
            {...listeners}
            {...attributes}
            className="cursor-grab active:cursor-grabbing p-0.5 hover:bg-accent rounded opacity-0 group-hover:opacity-100 transition-opacity"
            title="Drag to change due date"
          >
            <GripVertical size={10} className="text-muted-foreground" />
          </div>
          {getStatusIcon(task)}
          <Badge variant={getTaskColor(task)} className="text-xs px-1 py-0">
            {colorBy === 'category' ? task.category : task.priority}
          </Badge>
        </div>
        {(isOverdue(task) || isWarning(task)) && (
          <div className="text-xs font-medium">
            {isOverdue(task) ? (
              <span className="text-red-600 dark:text-red-400">Overdue</span>
            ) : (
              <span className="text-yellow-600 dark:text-yellow-400">
                {getDaysUntilDue(task)}d
              </span>
            )}
          </div>
        )}
      </div>
      <div className={`font-medium truncate ${
        task.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'
      }`}>
        {task.title}
      </div>
    </div>
  )
}

function DroppableCalendarDay({ day, children }: DroppableCalendarDayProps) {
  // Create a consistent date ID using year-month-day format
  const dateId = `day-${day.date.getFullYear()}-${String(day.date.getMonth() + 1).padStart(2, '0')}-${String(day.date.getDate()).padStart(2, '0')}`
  
  const { isOver, setNodeRef } = useDroppable({
    id: dateId,
  })

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[120px] p-2 border-r border-b border-border last:border-r-0 transition-colors ${
        !day.isCurrentMonth ? 'bg-muted/20' : 'bg-background'
      } ${day.isToday ? 'bg-primary/5 ring-1 ring-primary/20' : ''} ${
        isOver ? 'bg-primary/10 ring-2 ring-primary/30' : ''
      }`}
    >
      {children}
    </div>
  )
}

export default function CalendarView({ onEdit }: CalendarViewProps) {
  const { filteredTasks, updateTaskStatus, updateTask } = useTodoStore()
  const { activeProject } = useProjectStore()
  
  const [config, setConfig] = useState<CalendarViewConfig>({
    viewMode: 'month',
    showCompleted: true,
    showOverdue: true,
    colorBy: 'category',
  })
  
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const currentProject = activeProject()
  const tasks = filteredTasks()

  // Set up drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

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

  // Filter tasks based on config
  const filteredCalendarTasks = tasks.filter(task => {
    if (!config.showCompleted && task.status === 'done') return false
    return true
  })

  // Generate calendar data based on view mode
  const calendarData = useMemo(() => {
    if (config.viewMode === 'month') {
      return generateMonthView(currentDate, filteredCalendarTasks)
    } else if (config.viewMode === 'week') {
      return generateWeekView(currentDate, filteredCalendarTasks)
    } else if (config.viewMode === 'year') {
      return generateYearView(currentDate, filteredCalendarTasks)
    }
    return { days: [], weeks: [], months: [] }
  }, [currentDate, filteredCalendarTasks, config.viewMode])

  // Generate month view (original implementation)
  function generateMonthView(date: Date, tasks: Task[]) {
    const year = date.getFullYear()
    const month = date.getMonth()
    
    // First day of the month
    const firstDay = new Date(year, month, 1)
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0)
    
    // Start of calendar (including previous month days)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    // End of calendar (including next month days)
    const endDate = new Date(lastDay)
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()))
    
    const days: CalendarDay[] = []
    const currentCalendarDate = new Date(startDate)
    
    while (currentCalendarDate <= endDate) {
                const dayTasks = tasks.filter(task => {
            if (!task.dueDate) return false
            const taskDate = new Date(task.dueDate)
            return (
              taskDate.getFullYear() === currentCalendarDate.getFullYear() &&
              taskDate.getMonth() === currentCalendarDate.getMonth() &&
              taskDate.getDate() === currentCalendarDate.getDate()
            )
          })
      
      const today = new Date()
      const isToday = 
        currentCalendarDate.getFullYear() === today.getFullYear() &&
        currentCalendarDate.getMonth() === today.getMonth() &&
        currentCalendarDate.getDate() === today.getDate()
      
      days.push({
        date: new Date(currentCalendarDate),
        isCurrentMonth: currentCalendarDate.getMonth() === month,
        isToday,
        tasks: dayTasks
      })
      
      currentCalendarDate.setDate(currentCalendarDate.getDate() + 1)
    }
    
    return { days }
  }

  // Generate week view
  function generateWeekView(date: Date, tasks: Task[]) {
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay()) // Start from Sunday
    
    const days: CalendarDay[] = []
    
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek)
      currentDay.setDate(startOfWeek.getDate() + i)
      
      const dayTasks = tasks.filter(task => {
        if (!task.dueDate) return false
        const taskDate = new Date(task.dueDate)
        return (
          taskDate.getFullYear() === currentDay.getFullYear() &&
          taskDate.getMonth() === currentDay.getMonth() &&
          taskDate.getDate() === currentDay.getDate()
        )
      })
      
      const today = new Date()
      const isToday = 
        currentDay.getFullYear() === today.getFullYear() &&
        currentDay.getMonth() === today.getMonth() &&
        currentDay.getDate() === today.getDate()
      
      days.push({
        date: new Date(currentDay),
        isCurrentMonth: true, // All days are relevant in week view
        isToday,
        tasks: dayTasks
      })
    }
    
    return { days }
  }

  // Generate year view (12 months)
  function generateYearView(date: Date, tasks: Task[]) {
    const year = date.getFullYear()
    const months: MonthData[] = []
    
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const monthDate = new Date(year, monthIndex, 1)
      const monthTasks = tasks.filter(task => {
        if (!task.dueDate) return false
        const taskDate = new Date(task.dueDate)
        return (
          taskDate.getFullYear() === year &&
          taskDate.getMonth() === monthIndex
        )
      })
      
      // Generate weeks for this month
      const firstDay = new Date(year, monthIndex, 1)
      const lastDay = new Date(year, monthIndex + 1, 0)
      const startDate = new Date(firstDay)
      startDate.setDate(startDate.getDate() - firstDay.getDay())
      
      const weeks: WeekData[] = []
      let currentWeekStart = new Date(startDate)
      
      while (currentWeekStart <= lastDay) {
        const weekDays: CalendarDay[] = []
        
        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
          const currentDay = new Date(currentWeekStart)
          currentDay.setDate(currentWeekStart.getDate() + dayIndex)
          
          const dayTasks = monthTasks.filter(task => {
            if (!task.dueDate) return false
            const taskDate = new Date(task.dueDate)
            return (
              taskDate.getFullYear() === currentDay.getFullYear() &&
              taskDate.getMonth() === currentDay.getMonth() &&
              taskDate.getDate() === currentDay.getDate()
            )
          })
          
          const today = new Date()
          const isToday = 
            currentDay.getFullYear() === today.getFullYear() &&
            currentDay.getMonth() === today.getMonth() &&
            currentDay.getDate() === today.getDate()
          
          weekDays.push({
            date: new Date(currentDay),
            isCurrentMonth: currentDay.getMonth() === monthIndex,
            isToday,
            tasks: dayTasks
          })
        }
        
        weeks.push({
          weekStart: new Date(currentWeekStart),
          days: weekDays
        })
        
        currentWeekStart.setDate(currentWeekStart.getDate() + 7)
        
        // Break if we've gone past the month
        if (currentWeekStart.getMonth() !== monthIndex && currentWeekStart > lastDay) {
          break
        }
      }
      
      months.push({
        month: monthDate,
        weeks,
        totalTasks: monthTasks.length
      })
    }
    
    return { months }
  }

  // Get tasks without due dates
  const tasksWithoutDueDate = filteredCalendarTasks.filter(task => !task.dueDate)

  // Get overdue tasks
  const overdueTasks = filteredCalendarTasks.filter(task => {
    if (!task.dueDate || task.status === 'done') return false
    return new Date(task.dueDate) < new Date()
  })

  // Get warning tasks (due within 3 days)
  const warningTasks = filteredCalendarTasks.filter(task => {
    if (!task.dueDate || task.status === 'done') return false
    const today = new Date()
    const dueDate = new Date(task.dueDate)
    const timeDiff = dueDate.getTime() - today.getTime()
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
    return daysDiff > 0 && daysDiff <= 3
  })

  const navigate = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (config.viewMode === 'week') {
        // Navigate by week
        const days = direction === 'prev' ? -7 : 7
        newDate.setDate(newDate.getDate() + days)
      } else if (config.viewMode === 'month') {
        // Navigate by month
        if (direction === 'prev') {
          newDate.setMonth(newDate.getMonth() - 1)
        } else {
          newDate.setMonth(newDate.getMonth() + 1)
        }
      } else if (config.viewMode === 'year') {
        // Navigate by year
        if (direction === 'prev') {
          newDate.setFullYear(newDate.getFullYear() - 1)
        } else {
          newDate.setFullYear(newDate.getFullYear() + 1)
        }
      }
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const formatHeaderText = (date: Date) => {
    if (config.viewMode === 'week') {
      const startOfWeek = new Date(date)
      startOfWeek.setDate(date.getDate() - date.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      
      if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
        return `${startOfWeek.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} - Week of ${startOfWeek.getDate()}`
      } else {
        return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
      }
    } else if (config.viewMode === 'year') {
      return date.getFullYear().toString()
    } else {
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    }
  }

  const getStatusIcon = (task: Task) => {
    switch (task.status) {
      case 'todo':
        return <Circle size={12} className="text-muted-foreground" />
      case 'doing':
        return <AlertTriangle size={12} className="text-blue-500" />
      case 'done':
        return <CheckCircle size={12} className="text-green-500" />
      default:
        return <Circle size={12} className="text-muted-foreground" />
    }
  }

  const getTaskColor = (task: Task): 'default' | 'feature' | 'bug' | 'docs' | 'refactor' | 'test' | 'chore' | 'low' | 'medium' | 'high' | 'critical' | 'todo' | 'doing' | 'done' => {
    switch (config.colorBy) {
      case 'category':
        return task.category
      case 'priority':
        return task.priority
      default:
        return task.category
    }
  }

  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.status === 'done') return false
    return new Date(task.dueDate) < new Date()
  }

  const isWarning = (task: Task) => {
    if (!task.dueDate || task.status === 'done') return false
    const today = new Date()
    const dueDate = new Date(task.dueDate)
    const timeDiff = dueDate.getTime() - today.getTime()
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
    return daysDiff > 0 && daysDiff <= 3
  }

  const getDaysUntilDue = (task: Task) => {
    if (!task.dueDate) return null
    const today = new Date()
    const dueDate = new Date(task.dueDate)
    const timeDiff = dueDate.getTime() - today.getTime()
    return Math.ceil(timeDiff / (1000 * 3600 * 24))
  }

  const handleStatusChange = (task: Task, newStatus: TaskStatus) => {
    updateTaskStatus(task.id, newStatus)
  }

  const handleDragStart = (event: DragStartEvent) => {
    const task = filteredTasks().find(t => t.id === event.active.id)
    if (task) {
      setActiveTask(task)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const taskId = active.id as string
      const task = filteredTasks().find(t => t.id === taskId)
      
      if (task && over.id.toString().startsWith('day-')) {
        // Extract date from drop zone ID and parse it correctly
        const dateString = over.id.toString().replace('day-', '')
        console.log('Dropping on date:', dateString) // Debug log
        
        // Parse the date parts: YYYY-MM-DD format
        const dateParts = dateString.split('-')
        const year = parseInt(dateParts[0])
        const month = parseInt(dateParts[1]) - 1 // Month is 0-indexed in JS Date
        const day = parseInt(dateParts[2])
        
        // Create date at noon to avoid timezone issues
        const newDueDate = new Date(year, month, day, 12, 0, 0)
        console.log('New due date:', newDueDate.toLocaleDateString()) // Debug log
        
        // Update task with new due date
        updateTask(taskId, { dueDate: newDueDate })
        
        // Show success feedback
        console.log(`Task "${task.title}" moved from ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'no date'} to ${newDueDate.toLocaleDateString()}`)
      }
    }

    setActiveTask(null)
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6">
        {/* Calendar Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-background border border-border rounded-lg p-4 gap-4">
          <div className="flex items-center gap-4">
            {/* Month Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('prev')}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
                title={`Previous ${config.viewMode}`}
              >
                <ChevronLeft size={16} />
              </button>
              <h2 className="text-lg font-semibold text-foreground min-w-[200px] text-center">
                {formatHeaderText(currentDate)}
              </h2>
              <button
                onClick={() => navigate('next')}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
                title={`Next ${config.viewMode}`}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Today
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* View Mode Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">View:</span>
              <div className="flex items-center gap-1">
                {(['month', 'week', 'year'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setConfig(prev => ({ ...prev, viewMode: mode }))}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      config.viewMode === mode
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Color By Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Color by:</span>
              <div className="flex items-center gap-1">
                {(['category', 'priority'] as const).map(colorBy => (
                  <button
                    key={colorBy}
                    onClick={() => setConfig(prev => ({ ...prev, colorBy }))}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      config.colorBy === colorBy
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {colorBy.charAt(0).toUpperCase() + colorBy.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Show Options */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={config.showCompleted}
                  onChange={(e) => setConfig(prev => ({ ...prev, showCompleted: e.target.checked }))}
                  className="rounded border-border"
                />
                Show completed
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={config.showOverdue}
                  onChange={(e) => setConfig(prev => ({ ...prev, showOverdue: e.target.checked }))}
                  className="rounded border-border"
                />
                Show overdue
              </label>
            </div>
          </div>
        </div>

        {/* Status Legend */}
        <div className="flex flex-wrap items-center gap-4 bg-muted/20 border border-border rounded-lg p-3">
          <span className="text-sm font-medium text-foreground">Task Status:</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-100 border border-red-300 rounded dark:bg-red-950 dark:border-red-700"></div>
            <span className="text-xs text-muted-foreground">Overdue</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded dark:bg-yellow-950 dark:border-yellow-700"></div>
            <span className="text-xs text-muted-foreground">Due Soon (≤3 days)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-background border border-border rounded"></div>
            <span className="text-xs text-muted-foreground">Normal</span>
          </div>
          <div className="flex items-center gap-1 ml-4">
            <GripVertical size={12} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Drag tasks to change due dates</span>
          </div>
        </div>

        {/* Calendar Grid */}
        {config.viewMode === 'month' && 'days' in calendarData && calendarData.days && (
          <div className="bg-background border border-border rounded-lg overflow-hidden shadow-sm">
            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-border">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground bg-muted/50">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {calendarData.days.map((day: CalendarDay, index: number) => (
                <DroppableCalendarDay key={index} day={day}>
                  {/* Day Number */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${
                      !day.isCurrentMonth 
                        ? 'text-muted-foreground' 
                        : day.isToday 
                          ? 'text-primary font-semibold' 
                          : 'text-foreground'
                    }`}>
                      {day.date.getDate()}
                    </span>
                    {day.tasks.length > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">
                          {day.tasks.length}
                        </span>
                        {day.tasks.some((task: Task) => isOverdue(task)) && (
                          <div className="w-2 h-2 bg-red-500 rounded-full" title="Has overdue tasks"></div>
                        )}
                        {day.tasks.some((task: Task) => isWarning(task)) && (
                          <div className="w-2 h-2 bg-yellow-500 rounded-full" title="Has tasks due soon"></div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Tasks */}
                  <div className="space-y-1">
                    {day.tasks.slice(0, 3).map((task: Task) => (
                      <DraggableTaskCard
                        key={task.id}
                        task={task}
                        onEdit={onEdit}
                        getTaskColor={getTaskColor}
                        getStatusIcon={getStatusIcon}
                        isOverdue={isOverdue}
                        isWarning={isWarning}
                        getDaysUntilDue={getDaysUntilDue}
                        colorBy={config.colorBy}
                        setSelectedTask={setSelectedTask}
                      />
                    ))}
                    {day.tasks.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center py-1 hover:bg-accent rounded cursor-pointer transition-colors">
                        +{day.tasks.length - 3} more
                      </div>
                    )}
                  </div>
                </DroppableCalendarDay>
              ))}
            </div>
          </div>
        )}

        {/* Week View */}
        {config.viewMode === 'week' && 'days' in calendarData && calendarData.days && (
          <div className="bg-background border border-border rounded-lg overflow-hidden shadow-sm">
            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-border">
              {calendarData.days.map((day: CalendarDay, index: number) => (
                <div key={index} className="p-3 text-center text-sm font-medium text-muted-foreground bg-muted/50">
                  <div>{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index]}</div>
                  <div className={`text-lg font-semibold mt-1 ${day.isToday ? 'text-primary' : 'text-foreground'}`}>
                    {day.date.getDate()}
                  </div>
                </div>
              ))}
            </div>

            {/* Week Days */}
            <div className="grid grid-cols-7" style={{ minHeight: '400px' }}>
              {calendarData.days.map((day: CalendarDay, index: number) => (
                <DroppableCalendarDay key={index} day={day}>
                  <div className="space-y-2 h-full">
                    {day.tasks.map((task: Task) => (
                      <DraggableTaskCard
                        key={task.id}
                        task={task}
                        onEdit={onEdit}
                        getTaskColor={getTaskColor}
                        getStatusIcon={getStatusIcon}
                        isOverdue={isOverdue}
                        isWarning={isWarning}
                        getDaysUntilDue={getDaysUntilDue}
                        colorBy={config.colorBy}
                        setSelectedTask={setSelectedTask}
                      />
                    ))}
                  </div>
                </DroppableCalendarDay>
              ))}
            </div>
          </div>
        )}

        {/* Year View */}
        {config.viewMode === 'year' && 'months' in calendarData && calendarData.months && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {calendarData.months.map((monthData: MonthData, monthIndex: number) => (
              <div key={monthIndex} className="bg-background border border-border rounded-lg p-4 shadow-sm">
                {/* Month Header */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-foreground">
                    {monthData.month.toLocaleDateString('en-US', { month: 'long' })}
                  </h3>
                  {monthData.totalTasks > 0 && (
                    <Badge variant="default" className="text-xs">
                      {monthData.totalTasks} tasks
                    </Badge>
                  )}
                </div>

                {/* Mini Calendar */}
                <div className="space-y-1">
                  {/* Week headers */}
                  <div className="grid grid-cols-7 gap-px mb-1">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                      <div key={i} className="text-xs text-center text-muted-foreground p-1">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar weeks */}
                  {monthData.weeks.map((week: WeekData, weekIndex: number) => (
                    <div key={weekIndex} className="grid grid-cols-7 gap-px">
                      {week.days.map((day: CalendarDay, dayIndex: number) => (
                        <div
                          key={dayIndex}
                          className={`text-xs text-center p-1 rounded cursor-pointer transition-colors ${
                            !day.isCurrentMonth 
                              ? 'text-muted-foreground/50' 
                              : day.isToday 
                                ? 'bg-primary text-primary-foreground font-semibold' 
                                : day.tasks.length > 0
                                  ? 'bg-accent text-foreground font-medium'
                                  : 'text-foreground hover:bg-accent'
                          }`}
                          onClick={() => {
                            setCurrentDate(day.date)
                            setConfig(prev => ({ ...prev, viewMode: 'month' }))
                          }}
                          title={day.tasks.length > 0 ? `${day.tasks.length} tasks` : ''}
                        >
                          {day.date.getDate()}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Month tasks summary */}
                {monthData.totalTasks > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="text-xs text-muted-foreground mb-2">Recent tasks:</div>
                    <div className="space-y-1 max-h-20 overflow-y-auto">
                      {monthData.weeks
                        .flatMap(week => week.days)
                        .flatMap(day => day.tasks)
                        .slice(0, 3)
                        .map((task: Task) => (
                          <div
                            key={task.id}
                            className="text-xs text-foreground truncate cursor-pointer hover:text-primary"
                            onClick={() => setSelectedTask(task)}
                          >
                            {task.title}
                          </div>
                        ))}
                      {monthData.totalTasks > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{monthData.totalTasks - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Side Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Warning tasks (due soon) */}
          {warningTasks.length > 0 && (
            <div className="bg-background border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-600 dark:text-yellow-400 mb-3 flex items-center gap-2">
                <Clock size={16} />
                Due Soon ({warningTasks.length})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {warningTasks.map(task => (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="flex items-center gap-3 p-2 rounded border border-yellow-200 dark:border-yellow-800 hover:border-yellow-300 dark:hover:border-yellow-700 cursor-pointer transition-colors bg-yellow-50 dark:bg-yellow-950"
                  >
                    {getStatusIcon(task)}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate text-foreground">
                        {task.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={getTaskColor(task)} className="text-xs">
                          {config.colorBy === 'category' ? task.category : task.priority}
                        </Badge>
                        <span className="text-xs text-yellow-600 dark:text-yellow-400">
                          Due in {getDaysUntilDue(task)} day{getDaysUntilDue(task) !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    {onEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onEdit(task)
                        }}
                        className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors hover:bg-accent"
                        title="Edit task"
                      >
                        <Edit size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tasks without due dates */}
          {tasksWithoutDueDate.length > 0 && (
            <div className="bg-background border border-border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Calendar size={16} />
                No Due Date ({tasksWithoutDueDate.length})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {tasksWithoutDueDate.map(task => (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="flex items-center gap-3 p-2 rounded border border-border hover:border-primary/50 cursor-pointer transition-colors"
                  >
                    {getStatusIcon(task)}
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium truncate ${
                        task.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'
                      }`}>
                        {task.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={getTaskColor(task)} className="text-xs">
                          {config.colorBy === 'category' ? task.category : task.priority}
                        </Badge>
                        <Badge variant={task.status} className="text-xs">
                          {task.status === 'todo' ? 'To Do' : task.status === 'doing' ? 'In Progress' : 'Done'}
                        </Badge>
                      </div>
                    </div>
                    {onEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onEdit(task)
                        }}
                        className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors hover:bg-accent"
                        title="Edit task"
                      >
                        <Edit size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Overdue tasks */}
          {overdueTasks.length > 0 && (
            <div className="bg-background border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                <AlertTriangle size={16} />
                Overdue ({overdueTasks.length})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {overdueTasks.map(task => (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="flex items-center gap-3 p-2 rounded border border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 cursor-pointer transition-colors bg-red-50 dark:bg-red-950"
                  >
                    {getStatusIcon(task)}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate text-foreground">
                        {task.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={getTaskColor(task)} className="text-xs">
                          {config.colorBy === 'category' ? task.category : task.priority}
                        </Badge>
                        <span className="text-xs text-red-600 dark:text-red-400">
                          Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ''}
                        </span>
                      </div>
                    </div>
                    {onEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onEdit(task)
                        }}
                        className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors hover:bg-accent"
                        title="Edit task"
                      >
                        <Edit size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Task Detail Modal */}
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
                    <X size={16} />
                  </button>
                </div>
                
                {selectedTask.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {selectedTask.description}
                  </p>
                )}

                <div className="space-y-4">
                  {/* Status Control */}
                  <div>
                    <span className="text-sm font-medium text-foreground mb-2 block">Status:</span>
                    <div className="flex items-center gap-2">
                      {(['todo', 'doing', 'done'] as TaskStatus[]).map(status => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(selectedTask, status)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                            selectedTask.status === status
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : 'bg-accent hover:bg-accent/80'
                          }`}
                        >
                          {status === 'todo' && <Circle size={14} />}
                          {status === 'doing' && <AlertTriangle size={14} />}
                          {status === 'done' && <CheckCircle size={14} />}
                          {status === 'todo' ? 'To Do' : status === 'doing' ? 'In Progress' : 'Done'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Task Details */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={selectedTask.category}>
                      {selectedTask.category.charAt(0).toUpperCase() + selectedTask.category.slice(1)}
                    </Badge>
                    <Badge variant={selectedTask.priority}>
                      {selectedTask.priority.charAt(0).toUpperCase() + selectedTask.priority.slice(1)}
                    </Badge>
                  </div>

                  {selectedTask.dueDate && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Due date: </span>
                      <span className={`font-medium ${
                        isOverdue(selectedTask) 
                          ? 'text-red-600 dark:text-red-400' 
                          : isWarning(selectedTask)
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-foreground'
                      }`}>
                        {new Date(selectedTask.dueDate).toLocaleDateString()}
                        {isOverdue(selectedTask) && ' (Overdue)'}
                        {isWarning(selectedTask) && ` (Due in ${getDaysUntilDue(selectedTask)} day${getDaysUntilDue(selectedTask) !== 1 ? 's' : ''})`}
                      </span>
                    </div>
                  )}

                  <div className="text-sm">
                    <span className="text-muted-foreground">Created: </span>
                    <span className="text-foreground">
                      {new Date(selectedTask.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  {onEdit && (
                    <button
                      onClick={() => {
                        onEdit(selectedTask)
                        setSelectedTask(null)
                      }}
                      className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                      Edit Task
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedTask(null)}
                    className="px-3 py-2 border border-border rounded-md hover:bg-accent transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Drag Overlay */}
        <DragOverlay 
          dropAnimation={{
            duration: 300,
            easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
          }}
        >
          {activeTask ? (
            <div className="p-1.5 rounded text-xs border border-primary bg-primary/10 shadow-lg rotate-3 scale-105 transition-transform">
              <div className="flex items-center gap-1 mb-1">
                {getStatusIcon(activeTask)}
                <Badge variant={getTaskColor(activeTask)} className="text-xs px-1 py-0">
                  {config.colorBy === 'category' ? activeTask.category : activeTask.priority}
                </Badge>
              </div>
              <div className="font-medium text-foreground">
                {activeTask.title}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  )
} 