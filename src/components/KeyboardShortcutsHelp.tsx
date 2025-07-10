import { useState, useEffect } from 'react'
import { Keyboard, X } from 'lucide-react'

export default function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false)

  const shortcuts = [
    { key: '⌘K', description: 'Open command palette' },
    { key: 'N', description: 'Create new task' },
    { key: 'T', description: 'Toggle theme' },
    { key: '/', description: 'Focus search' },
    { key: 'D', description: 'Open data management' },
    { key: 'Esc', description: 'Close all modals & menus' },
  ]

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-2 bg-background border border-border rounded-lg shadow-lg hover:border-primary/50 transition-colors z-40"
        title="Keyboard shortcuts"
      >
        <Keyboard size={16} className="text-muted-foreground" />
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-background border border-border rounded-lg shadow-2xl max-w-md w-full">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="text-lg font-semibold">Keyboard Shortcuts</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-accent rounded"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="p-4 space-y-3">
            {shortcuts.map((shortcut) => (
              <div key={shortcut.key} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{shortcut.description}</span>
                <kbd className="px-2 py-1 text-xs bg-muted border border-border rounded">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  // Close when escape is pressed (handled by parent)
  useEffect(() => {
    const handleClose = () => {
      setIsOpen(false)
    }
    
    // Store the handler in a way that parent can call it
    ;(window as any).closeKeyboardHelp = handleClose
    
    return () => {
      delete (window as any).closeKeyboardHelp
    }
  }, [])
} 