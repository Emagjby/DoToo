import React from 'react'
import useProjectStore from '../../stores/projectStore'
import type { Task } from '../../types'
import Board from '../kanban/Board'
import ListView from './ListView'
import CalendarView from './CalendarView'
import GanttView from './GanttView'

interface ViewContainerProps {
  onEdit?: (task: Task) => void
}

export default function ViewContainer({ onEdit }: ViewContainerProps) {
  const { activeProject } = useProjectStore()
  
  const currentProject = activeProject()

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

  // Render the appropriate view based on the project's view type
  switch (currentProject.viewType) {
    case 'kanban':
      return <Board onEdit={onEdit} />
    
    case 'list':
      return <ListView onEdit={onEdit} />
    
    case 'calendar':
      return <CalendarView onEdit={onEdit} />
    
    case 'gantt':
      return <GanttView onEdit={onEdit} />
    
    case 'table':
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="text-center">
            <div className="text-lg font-medium mb-2">Table View</div>
            <div className="text-sm">Coming soon...</div>
          </div>
        </div>
      )
    
    case 'mindmap':
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="text-center">
            <div className="text-lg font-medium mb-2">Mind Map View</div>
            <div className="text-sm">Coming soon...</div>
          </div>
        </div>
      )
    
    default:
      return <Board onEdit={onEdit} />
  }
} 