import React from 'react'
import { Plus, Sun, Moon } from 'lucide-react'
import Button from '../ui/Button'
import useTodoStore from '../../stores/todoStore'
import DoTooLogo from './DoTooLogo'

interface HeaderProps {
  onNewTask: () => void
  taskCount: number
}

export default function Header({ onNewTask }: HeaderProps) {
  const { isDarkMode, toggleDarkMode } = useTodoStore()

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="flex h-16 w-full items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <DoTooLogo />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDarkMode}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="h-9 w-9 p-0 hover:bg-accent"
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </Button>
          <Button 
            onClick={onNewTask} 
            size="sm"
            className="gap-2 shadow-md hover:shadow-lg transition-shadow"
          >
            <Plus size={16} />
            New Task
          </Button>
        </div>
      </div>
    </header>
  )
} 