import { useEffect, useCallback } from 'react'

interface KeyboardShortcutsProps {
  onOpenCommandPalette: () => void
  onNewTask: () => void
  onToggleTheme: () => void
  onFocusSearch: () => void
  onOpenDataManagement: () => void
  onCloseAllModals: () => void
}

export function useKeyboardShortcuts({
  onOpenCommandPalette,
  onNewTask,
  onToggleTheme,
  onFocusSearch,
  onOpenDataManagement,
  onCloseAllModals,
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

      // D - Open data management
      if (event.key === 'd' && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault()
        onOpenDataManagement()
        return
      }

      // Escape - Close all modals and menus
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseAllModals()
        return
      }
    },
    [onOpenCommandPalette, onNewTask, onToggleTheme, onFocusSearch, onOpenDataManagement, onCloseAllModals]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])
} 