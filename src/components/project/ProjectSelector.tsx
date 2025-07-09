import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Plus, Settings, FolderOpen, Star } from 'lucide-react'
import useProjectStore from '../../stores/projectStore'
import useTodoStore from '../../stores/todoStore'
import { PROJECT_TYPES } from '../../types'
import type { ProjectType } from '../../types'

interface ProjectSelectorProps {
  className?: string
  compact?: boolean
}

export default function ProjectSelector({ className = '', compact = false }: ProjectSelectorProps) {
  const { projects, activeProject, setActiveProject, createProject } = useProjectStore()
  const { tasks } = useTodoStore()
  const [isOpen, setIsOpen] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newProjectData, setNewProjectData] = useState({
    name: '',
    description: '',
    type: 'development' as ProjectType,
  })

  const currentProject = activeProject()

  const handleCreateProject = () => {
    if (!newProjectData.name.trim()) return

    const projectType = PROJECT_TYPES[newProjectData.type]
    createProject({
      name: newProjectData.name.trim(),
      description: newProjectData.description.trim(),
      type: newProjectData.type,
      viewType: projectType.defaultViewType,
      color: projectType.color,
      icon: projectType.icon,
      settings: projectType.defaultSettings,
    })

    setNewProjectData({ name: '', description: '', type: 'development' })
    setShowCreateForm(false)
    setIsOpen(false)
  }

  const getProjectTaskCount = (projectId: string) => {
    return tasks.filter(task => task.projectId === projectId).length
  }

  const getProjectTypeInfo = (type: ProjectType) => {
    return PROJECT_TYPES[type]
  }

  if (projects.length === 0) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {compact ? (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            title="Create Project"
          >
            <Plus size={16} />
          </button>
        ) : (
          <>
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border border-border">
              <FolderOpen size={16} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">No projects</span>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus size={16} />
              <span className="text-sm font-medium">Create Project</span>
            </button>
          </>
        )}
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* Project Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 bg-background border border-border rounded-lg hover:border-primary/50 transition-colors ${
          compact 
            ? 'px-2 py-1.5 min-w-[40px]' 
            : 'px-2 py-1 min-w-[200px]'
        }`}
      >
        {currentProject ? (
          <>
            <div 
              className={`rounded-lg flex items-center justify-center text-white text-sm font-medium w-6 h-6`}
              style={{ backgroundColor: currentProject.color }}
            >
              {currentProject.icon}
            </div>
            {!compact && (
              <div className="flex-1 text-left">
                <div className="text-xs font-medium text-foreground truncate">
                  {currentProject.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {getProjectTaskCount(currentProject.id)} tasks
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground">
            <FolderOpen size={compact ? 14 : 16} />
            {!compact && <span className="text-sm">Select Project</span>}
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
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-foreground">Projects</h3>
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-1 px-2 py-1 text-xs text-primary hover:bg-primary/10 rounded transition-colors"
              >
                <Plus size={12} />
                New Project
              </button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {projects.map((project) => {
              const taskCount = getProjectTaskCount(project.id)
              const isActive = currentProject?.id === project.id
              
              return (
                <button
                  key={project.id}
                  onClick={() => {
                    setActiveProject(project.id)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-accent transition-colors ${
                    isActive ? 'bg-primary/10 border-r-2 border-primary' : ''
                  }`}
                >
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: project.color }}
                  >
                    {project.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-foreground truncate">
                      {project.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {taskCount} tasks • {getProjectTypeInfo(project.type).label}
                    </div>
                  </div>
                  {isActive && <Star size={14} className="text-primary" />}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateForm && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Create New Project</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={newProjectData.name}
                  onChange={(e) => setNewProjectData({ ...newProjectData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Enter project name..."
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  value={newProjectData.description}
                  onChange={(e) => setNewProjectData({ ...newProjectData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Describe your project..."
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Project Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(PROJECT_TYPES).map(([key, type]) => (
                    <button
                      key={key}
                      onClick={() => setNewProjectData({ ...newProjectData, type: key as ProjectType })}
                      className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                        newProjectData.type === key
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <span className="text-lg">{type.icon}</span>
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProjectData.name.trim()}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
} 