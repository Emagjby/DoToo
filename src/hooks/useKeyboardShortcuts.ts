import { useEffect, useCallback } from 'react'

interface KeyboardShortcutsProps {
  onOpenCommandPalette: () => void
  onNewTask: () => void
  onToggleTheme: () => void
  onFocusSearch: () => void
}

export function useKeyboardShortcuts({
  onOpenCommandPalette,
  onNewTask,
  onToggleTheme,
  onFocusSearch,
}: KeyboardShortcutsProps) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true' ||
        target.closest('[contenteditable]')
      ) {
        return
      }

      // Cmd+K (or Ctrl+K on Windows/Linux) - Open command palette
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        onOpenCommandPalette()
        return
      }

      // N - Create new task
      if (event.key === 'n' && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault()
        onNewTask()
        return
      }

      // T - Toggle theme
      if (event.key === 't' && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault()
        onToggleTheme()
        return
      }

      // / - Focus search
      if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault()
        onFocusSearch()
        return
      }

      // Escape - Close modals (handled by individual components)
      if (event.key === 'Escape') {
        // This is handled by the CommandPalette component itself
        return
      }
    },
    [onOpenCommandPalette, onNewTask, onToggleTheme, onFocusSearch]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])
} 