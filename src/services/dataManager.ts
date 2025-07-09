import type { Task, SearchFilters } from '../types'

export interface DataExport {
  version: string
  exportedAt: string
  tasks: Task[]
  settings: {
    isDarkMode: boolean
    searchFilters: SearchFilters
  }
}

export interface DataValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  stats: {
    totalTasks: number
    validTasks: number
    invalidTasks: number
  }
}

export interface BackupInfo {
  id: string
  name: string
  createdAt: string
  taskCount: number
  size: number
}

class DataManager {
  private readonly STORAGE_KEY = 'dotoo-storage'
  private readonly BACKUP_PREFIX = 'dotoo-backup-'
  private readonly CURRENT_VERSION = '1.0.0'

  // Export data to JSON
  exportData(): DataExport {
    const storageData = localStorage.getItem(this.STORAGE_KEY)
    if (!storageData) {
      throw new Error('No data found to export')
    }

    const parsedData = JSON.parse(storageData)
    const tasks = parsedData.state?.tasks || []
    const isDarkMode = parsedData.state?.isDarkMode || true
    const searchFilters = parsedData.state?.searchFilters || { query: '' }

    return {
      version: this.CURRENT_VERSION,
      exportedAt: new Date().toISOString(),
      tasks,
      settings: {
        isDarkMode,
        searchFilters
      }
    }
  }

  // Import data from JSON
  importData(data: DataExport): DataValidationResult {
    const validation = this.validateImportData(data)
    
    if (!validation.isValid) {
      return validation
    }

    try {
      // Create backup before import
      this.createBackup('pre-import-backup')
      
      // Update localStorage with imported data
      const currentData = localStorage.getItem(this.STORAGE_KEY)
      const parsedCurrent = currentData ? JSON.parse(currentData) : { state: {} }
      
      const updatedData = {
        ...parsedCurrent,
        state: {
          ...parsedCurrent.state,
          tasks: data.tasks,
          isDarkMode: data.settings.isDarkMode,
          searchFilters: data.settings.searchFilters
        }
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedData))
      
      return {
        isValid: true,
        errors: [],
        warnings: validation.warnings,
        stats: validation.stats
      }
    } catch (error) {
      return {
        isValid: false,
        errors: [`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
        stats: { totalTasks: 0, validTasks: 0, invalidTasks: 0 }
      }
    }
  }

  // Validate import data
  validateImportData(data: any): DataValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    
    // Check basic structure
    if (!data || typeof data !== 'object') {
      errors.push('Invalid data format')
      return { isValid: false, errors, warnings, stats: { totalTasks: 0, validTasks: 0, invalidTasks: 0 } }
    }

    if (!data.tasks || !Array.isArray(data.tasks)) {
      errors.push('Tasks array is missing or invalid')
      return { isValid: false, errors, warnings, stats: { totalTasks: 0, validTasks: 0, invalidTasks: 0 } }
    }

    // Validate each task
    let validTasks = 0
    let invalidTasks = 0

    data.tasks.forEach((task: any, index: number) => {
      const taskErrors = this.validateTask(task)
      if (taskErrors.length > 0) {
        invalidTasks++
        errors.push(`Task ${index + 1}: ${taskErrors.join(', ')}`)
      } else {
        validTasks++
      }
    })

    // Check version compatibility
    if (data.version && data.version !== this.CURRENT_VERSION) {
      warnings.push(`Data version (${data.version}) differs from current version (${this.CURRENT_VERSION})`)
    }

    // Check for missing settings
    if (!data.settings) {
      warnings.push('Settings are missing, using defaults')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      stats: {
        totalTasks: data.tasks.length,
        validTasks,
        invalidTasks
      }
    }
  }

  // Validate individual task
  private validateTask(task: any): string[] {
    const errors: string[] = []

    // Required fields
    if (!task.id || typeof task.id !== 'string') {
      errors.push('Missing or invalid ID')
    }

    if (!task.title || typeof task.title !== 'string') {
      errors.push('Missing or invalid title')
    }

    if (!task.category || !['feature', 'bug', 'docs', 'refactor', 'test', 'chore'].includes(task.category)) {
      errors.push('Missing or invalid category')
    }

    if (!task.priority || !['low', 'medium', 'high', 'critical'].includes(task.priority)) {
      errors.push('Missing or invalid priority')
    }

    if (!task.status || !['todo', 'doing', 'done'].includes(task.status)) {
      errors.push('Missing or invalid status')
    }

    if (!task.createdAt) {
      errors.push('Missing creation date')
    }

    // Optional field validation
    if (task.description !== undefined && typeof task.description !== 'string') {
      errors.push('Invalid description')
    }

    if (task.code !== undefined && typeof task.code !== 'string') {
      errors.push('Invalid code')
    }

    if (task.language !== undefined && typeof task.language !== 'string') {
      errors.push('Invalid language')
    }

    if (task.dueDate !== undefined && !(task.dueDate instanceof Date) && isNaN(Date.parse(task.dueDate))) {
      errors.push('Invalid due date')
    }

    if (task.branchName !== undefined && typeof task.branchName !== 'string') {
      errors.push('Invalid branch name')
    }

    if (task.tags !== undefined && (!Array.isArray(task.tags) || !task.tags.every((tag: any) => typeof tag === 'string'))) {
      errors.push('Invalid tags')
    }

    return errors
  }

  // Create backup
  createBackup(name?: string): BackupInfo {
    const data = this.exportData()
    const backupId = `${this.BACKUP_PREFIX}${Date.now()}`
    const backupName = name || `Backup ${new Date().toLocaleString()}`
    
    const backupData = {
      id: backupId,
      name: backupName,
      data,
      createdAt: new Date().toISOString()
    }

    localStorage.setItem(backupId, JSON.stringify(backupData))
    
    return {
      id: backupId,
      name: backupName,
      createdAt: backupData.createdAt,
      taskCount: data.tasks.length,
      size: JSON.stringify(backupData).length
    }
  }

  // List all backups
  listBackups(): BackupInfo[] {
    const backups: BackupInfo[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(this.BACKUP_PREFIX)) {
        try {
          const backupData = JSON.parse(localStorage.getItem(key)!)
          backups.push({
            id: backupData.id,
            name: backupData.name,
            createdAt: backupData.createdAt,
            taskCount: backupData.data.tasks.length,
            size: JSON.stringify(backupData).length
          })
        } catch (error) {
          console.warn(`Failed to parse backup: ${key}`)
        }
      }
    }

    return backups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  // Restore from backup
  restoreBackup(backupId: string): DataValidationResult {
    try {
      const backupData = localStorage.getItem(backupId)
      if (!backupData) {
        return {
          isValid: false,
          errors: ['Backup not found'],
          warnings: [],
          stats: { totalTasks: 0, validTasks: 0, invalidTasks: 0 }
        }
      }

      const parsed = JSON.parse(backupData)
      return this.importData(parsed.data)
    } catch (error) {
      return {
        isValid: false,
        errors: [`Restore failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
        stats: { totalTasks: 0, validTasks: 0, invalidTasks: 0 }
      }
    }
  }

  // Delete backup
  deleteBackup(backupId: string): boolean {
    try {
      localStorage.removeItem(backupId)
      return true
    } catch (error) {
      console.error('Failed to delete backup:', error)
      return false
    }
  }

  // Clear all data
  clearAllData(): void {
    // Create backup before clearing
    this.createBackup('pre-clear-backup')
    
    // Clear main storage
    localStorage.removeItem(this.STORAGE_KEY)
    
    // Clear all backups except the one we just created
    const backups = this.listBackups()
    backups.forEach(backup => {
      if (!backup.name.includes('pre-clear-backup')) {
        this.deleteBackup(backup.id)
      }
    })
  }

  // Get data statistics
  getDataStats(): { taskCount: number; storageSize: number; lastModified: string } {
    const storageData = localStorage.getItem(this.STORAGE_KEY)
    if (!storageData) {
      return { taskCount: 0, storageSize: 0, lastModified: '' }
    }

    const parsedData = JSON.parse(storageData)
    const tasks = parsedData.state?.tasks || []
    
    return {
      taskCount: tasks.length,
      storageSize: storageData.length,
      lastModified: parsedData.state?.lastModified || new Date().toISOString()
    }
  }

  // Clean up old backups (keep only last 10)
  cleanupOldBackups(): number {
    const backups = this.listBackups()
    const backupsToDelete = backups.slice(10)
    
    backupsToDelete.forEach(backup => {
      this.deleteBackup(backup.id)
    })

    return backupsToDelete.length
  }

  // Export as CSV
  exportAsCSV(): string {
    const data = this.exportData()
    const headers = ['ID', 'Title', 'Description', 'Category', 'Priority', 'Status', 'Created', 'Due Date', 'Branch', 'Tags', 'Language']
    
    const csvRows = [headers.join(',')]
    
    data.tasks.forEach(task => {
      const row = [
        task.id,
        `"${task.title.replace(/"/g, '""')}"`,
        `"${(task.description || '').replace(/"/g, '""')}"`,
        task.category,
        task.priority,
        task.status,
        new Date(task.createdAt).toISOString(),
        task.dueDate ? new Date(task.dueDate).toISOString() : '',
        `"${(task.branchName || '').replace(/"/g, '""')}"`,
        `"${(task.tags || []).join('; ').replace(/"/g, '""')}"`,
        task.language || ''
      ]
      csvRows.push(row.join(','))
    })
    
    return csvRows.join('\n')
  }

  // Download file
  downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

export const dataManager = new DataManager()
export default dataManager 