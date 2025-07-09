import React, { useState } from 'react'
import { ChevronDown, Layout, List, Calendar, BarChart3, Table, Network } from 'lucide-react'
import useProjectStore from '../../stores/projectStore'
import type { ViewType } from '../../types'

interface ViewSelectorProps {
  className?: string
  compact?: boolean
}

const VIEW_TYPES = {
  kanban: {
    label: 'Kanban Board',
    icon: Layout,
    description: 'Drag & drop task management',
    color: '#3B82F6'
  },
  list: {
    label: 'List View',
    icon: List,
    description: 'Simple task list with sorting',
    color: '#10B981'
  },
  calendar: {
    label: 'Calendar View',
    icon: Calendar,
    description: 'Timeline-based task management',
    color: '#F59E0B'
  },
  gantt: {
    label: 'Gantt Chart',
    icon: BarChart3,
    description: 'Project timeline visualization',
    color: '#8B5CF6'
  },
  table: {
    label: 'Table View',
    icon: Table,
    description: 'Spreadsheet-like interface',
    color: '#EF4444'
  },
  mindmap: {
    label: 'Mind Map',
    icon: Network,
    description: 'Hierarchical task organization',
    color: '#06B6D4'
  }
} as const

export default function ViewSelector({ className = '', compact = false }: ViewSelectorProps) {
  const { activeProject, updateProject } = useProjectStore()
  const [isOpen, setIsOpen] = useState(false)

  const currentProject = activeProject()
  const currentView = currentProject?.viewType || 'kanban'
  const currentViewInfo = VIEW_TYPES[currentView]

  const handleViewChange = (viewType: ViewType) => {
    if (currentProject) {
      updateProject(currentProject.id, { viewType })
    }
    setIsOpen(false)
  }

  if (!currentProject) {
    return null
  }

  return (
    <div className={`relative ${className}`}>
      {/* View Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 bg-background border border-border rounded-lg hover:border-primary/50 transition-colors ${
          compact 
            ? 'px-2 py-1.5 min-w-[40px]' 
            : 'px-2 py-1'
        }`}
      >
        <div 
          className={`rounded-lg flex items-center justify-center text-white w-6 h-6`}
          style={{ backgroundColor: currentViewInfo.color }}
        >
          <currentViewInfo.icon size={compact ? 14 : 16} />
        </div>
        {!compact && (
          <div className="flex-1 text-left">
            <div className="text-xs font-medium text-foreground">
              {currentViewInfo.label}
            </div>
            <div className="text-xs text-muted-foreground">
              {currentViewInfo.description}
            </div>
          </div>
        )}
        {!compact && <ChevronDown size={16} className="text-muted-foreground" />}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute top-full mt-4 bg-background border border-border rounded-lg shadow-lg z-50 ${
          compact ? 'right-0 w-72' : 'left-0 w-80'
        }`}>
          <div className="p-3 border-b border-border">
            <h3 className="text-sm font-medium text-foreground">View Types</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Choose how to visualize your tasks
            </p>
          </div>

          <div className="p-2">
            {Object.entries(VIEW_TYPES).map(([key, view]) => {
              const isActive = currentView === key
              const IconComponent = view.icon
              
              return (
                <button
                  key={key}
                  onClick={() => handleViewChange(key as ViewType)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-primary/10 border border-primary/20' 
                      : 'hover:bg-accent'
                  }`}
                >
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: view.color }}
                  >
                    <IconComponent size={18} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className={`text-sm font-medium ${
                      isActive ? 'text-primary' : 'text-foreground'
                    }`}>
                      {view.label}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {view.description}
                    </div>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  )}
                </button>
              )
            })}
          </div>

          <div className="p-3 border-t border-border bg-muted/30">
            <div className="text-xs text-muted-foreground">
              <strong>Tip:</strong> Different view types work better for different project types and workflows.
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 