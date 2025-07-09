import React from 'react'
import { Plus, Sun, Moon } from 'lucide-react'
import Button from '../ui/Button'
import useTodoStore from '../../stores/todoStore'
import DoTooLogo from './DoTooLogo'
import ProjectSelector from '../project/ProjectSelector'
import ViewSelector from '../project/ViewSelector'

interface HeaderProps {
  onNewTask: () => void
  taskCount: number
}

export default function Header({ onNewTask }: HeaderProps) {
  const { isDarkMode, toggleDarkMode } = useTodoStore()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="flex h-14 w-full items-center justify-between px-4 lg:px-6">
        {/* Left side - Logo and Project Selector */}
        <div className="flex items-center gap-4">
          <DoTooLogo />
          <div className="hidden sm:block ml-4">
            <ProjectSelector />
          </div>
        </div>
        
        
        
        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          {/* Center - View Selector (only on larger screens) */}
          <div className="hidden lg:flex items-center mr-4">
            <ViewSelector />
          </div>
          {/* Mobile Project Selector */}
          <div className="sm:hidden">
            <ProjectSelector compact />
          </div>
          
          {/* Mobile View Selector */}
          <div className="lg:hidden">
            <ViewSelector compact />
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDarkMode}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="h-8 w-8 p-0 hover:bg-accent"
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </Button>
          
          <Button 
            onClick={onNewTask} 
            size="sm"
            className="gap-2 shadow-sm hover:shadow-md transition-shadow"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">New Task</span>
          </Button>
        </div>
      </div>
    </header>
  )
} 