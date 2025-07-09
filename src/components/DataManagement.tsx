import React, { useState, useRef } from 'react'
import { 
  Download, 
  Upload, 
  Save, 
  RotateCcw, 
  Trash2, 
  FileText, 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  X, 
  RefreshCw,
  HardDrive,
  FileJson,
  FileSpreadsheet,
  Settings,
  Shield,
  Archive
} from 'lucide-react'
import dataManager, { type DataExport, type DataValidationResult, type BackupInfo } from '../services/dataManager'

interface DataManagementProps {
  isOpen: boolean
  onClose: () => void
}

export default function DataManagement({ isOpen, onClose }: DataManagementProps) {
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'backup' | 'cleanup'>('export')
  const [importResult, setImportResult] = useState<DataValidationResult | null>(null)
  const [backups, setBackups] = useState<BackupInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmClear, setShowConfirmClear] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load backups on mount
  React.useEffect(() => {
    if (isOpen) {
      setBackups(dataManager.listBackups())
    }
  }, [isOpen])

  const handleExportJSON = () => {
    try {
      const data = dataManager.exportData()
      const filename = `dotoo-export-${new Date().toISOString().split('T')[0]}.json`
      dataManager.downloadFile(JSON.stringify(data, null, 2), filename, 'application/json')
    } catch (error) {
      alert('Export failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleExportCSV = () => {
    try {
      const csv = dataManager.exportAsCSV()
      const filename = `dotoo-export-${new Date().toISOString().split('T')[0]}.csv`
      dataManager.downloadFile(csv, filename, 'text/csv')
    } catch (error) {
      alert('CSV export failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        const result = dataManager.importData(data)
        setImportResult(result)
        
        if (result.isValid) {
          // Reload the page to reflect changes
          setTimeout(() => window.location.reload(), 1500)
        }
      } catch (error) {
        setImportResult({
          isValid: false,
          errors: ['Invalid JSON file'],
          warnings: [],
          stats: { totalTasks: 0, validTasks: 0, invalidTasks: 0 }
        })
      }
      setIsLoading(false)
    }

    reader.onerror = () => {
      setImportResult({
        isValid: false,
        errors: ['Failed to read file'],
        warnings: [],
        stats: { totalTasks: 0, validTasks: 0, invalidTasks: 0 }
      })
      setIsLoading(false)
    }

    reader.readAsText(file)
  }

  const handleCreateBackup = () => {
    const name = prompt('Enter backup name (optional):')
    const backup = dataManager.createBackup(name)
    setBackups(dataManager.listBackups())
    alert(`Backup created: ${backup.name}`)
  }

  const handleRestoreBackup = (backupId: string) => {
    if (confirm('This will replace all current data. Are you sure?')) {
      const result = dataManager.restoreBackup(backupId)
      if (result.isValid) {
        alert('Backup restored successfully!')
        setTimeout(() => window.location.reload(), 1000)
      } else {
        alert('Restore failed: ' + result.errors.join(', '))
      }
    }
  }

  const handleDeleteBackup = (backupId: string) => {
    if (confirm('Are you sure you want to delete this backup?')) {
      dataManager.deleteBackup(backupId)
      setBackups(dataManager.listBackups())
    }
  }

  const handleClearAllData = () => {
    if (confirm('This will permanently delete all data and backups. Are you absolutely sure?')) {
      dataManager.clearAllData()
      alert('All data cleared. The page will reload.')
      setTimeout(() => window.location.reload(), 1000)
    }
  }

  const handleCleanupBackups = () => {
    const deletedCount = dataManager.cleanupOldBackups()
    setBackups(dataManager.listBackups())
    alert(`Cleaned up ${deletedCount} old backups`)
  }

  const getDataStats = () => {
    return dataManager.getDataStats()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="bg-background border border-border rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                  <Database size={20} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Data Management
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Import, export, backup, and manage your data
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-accent transition-colors"
              >
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
              <div className="p-6">
                {/* Stats */}
                <div className="mb-6 p-4 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <HardDrive size={16} className="text-primary" />
                    <span className="text-sm font-medium text-foreground">Data Statistics</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Tasks:</span>
                      <span className="ml-2 font-medium">{getDataStats().taskCount}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Storage:</span>
                      <span className="ml-2 font-medium">{(getDataStats().storageSize / 1024).toFixed(1)} KB</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Backups:</span>
                      <span className="ml-2 font-medium">{backups.length}</span>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 mb-6 p-1 bg-muted/30 rounded-lg">
                  {[
                    { id: 'export', label: 'Export', icon: Download },
                    { id: 'import', label: 'Import', icon: Upload },
                    { id: 'backup', label: 'Backup', icon: Save },
                    { id: 'cleanup', label: 'Cleanup', icon: Trash2 }
                  ].map((tab) => {
                    const IconComponent = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-colors ${
                          activeTab === tab.id
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <IconComponent size={16} />
                        {tab.label}
                      </button>
                    )
                  })}
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                  {/* Export Tab */}
                  {activeTab === 'export' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Export Data
                        </div>
                        <div className="h-px flex-1 bg-border"></div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                          onClick={handleExportJSON}
                          className="flex items-center gap-3 p-4 rounded-lg border border-border bg-background hover:bg-accent transition-colors"
                        >
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                            <FileJson size={20} className="text-primary" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-foreground">Export as JSON</div>
                            <div className="text-sm text-muted-foreground">Full data with settings</div>
                          </div>
                        </button>

                        <button
                          onClick={handleExportCSV}
                          className="flex items-center gap-3 p-4 rounded-lg border border-border bg-background hover:bg-accent transition-colors"
                        >
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                            <FileSpreadsheet size={20} className="text-primary" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-foreground">Export as CSV</div>
                            <div className="text-sm text-muted-foreground">Spreadsheet compatible</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Import Tab */}
                  {activeTab === 'import' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Import Data
                        </div>
                        <div className="h-px flex-1 bg-border"></div>
                      </div>

                      <div className="p-4 rounded-lg border border-border bg-background">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                            <Upload size={20} className="text-primary" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">Import from JSON</div>
                            <div className="text-sm text-muted-foreground">Select a JSON file to import</div>
                          </div>
                        </div>
                        
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".json"
                          onChange={handleImport}
                          className="hidden"
                        />
                        
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isLoading}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                          {isLoading ? <RefreshCw size={16} className="animate-spin" /> : <Upload size={16} />}
                          {isLoading ? 'Importing...' : 'Choose File'}
                        </button>
                      </div>

                      {/* Import Result */}
                      {importResult && (
                        <div className={`p-4 rounded-lg border ${
                          importResult.isValid 
                            ? 'border-green-500/20 bg-green-500/10' 
                            : 'border-red-500/20 bg-red-500/10'
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            {importResult.isValid ? (
                              <CheckCircle size={16} className="text-green-500" />
                            ) : (
                              <AlertTriangle size={16} className="text-red-500" />
                            )}
                            <span className={`font-medium ${
                              importResult.isValid ? 'text-green-500' : 'text-red-500'
                            }`}>
                              {importResult.isValid ? 'Import Successful' : 'Import Failed'}
                            </span>
                          </div>
                          
                          <div className="text-sm space-y-1">
                            <div>Total tasks: {importResult.stats.totalTasks}</div>
                            <div>Valid tasks: {importResult.stats.validTasks}</div>
                            <div>Invalid tasks: {importResult.stats.invalidTasks}</div>
                          </div>

                          {importResult.errors.length > 0 && (
                            <div className="mt-3">
                              <div className="text-sm font-medium text-red-500 mb-1">Errors:</div>
                              <ul className="text-sm text-red-500 space-y-1">
                                {importResult.errors.map((error, index) => (
                                  <li key={index}>• {error}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {importResult.warnings.length > 0 && (
                            <div className="mt-3">
                              <div className="text-sm font-medium text-yellow-500 mb-1">Warnings:</div>
                              <ul className="text-sm text-yellow-500 space-y-1">
                                {importResult.warnings.map((warning, index) => (
                                  <li key={index}>• {warning}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Backup Tab */}
                  {activeTab === 'backup' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Backup Management
                          </div>
                          <div className="h-px flex-1 bg-border"></div>
                        </div>
                        <button
                          onClick={handleCreateBackup}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                          <Save size={16} />
                          Create Backup
                        </button>
                      </div>

                      <div className="space-y-2">
                        {backups.length === 0 ? (
                          <div className="p-8 text-center text-muted-foreground">
                            <Archive size={48} className="mx-auto mb-4 opacity-50" />
                            <p>No backups found</p>
                            <p className="text-sm">Create your first backup to get started</p>
                          </div>
                        ) : (
                          backups.map((backup) => (
                            <div key={backup.id} className="flex items-center justify-between p-4 rounded-lg border border-border bg-background">
                              <div className="flex-1">
                                <div className="font-medium text-foreground">{backup.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {new Date(backup.createdAt).toLocaleString()} • {backup.taskCount} tasks • {(backup.size / 1024).toFixed(1)} KB
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleRestoreBackup(backup.id)}
                                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors"
                                  title="Restore backup"
                                >
                                  <RotateCcw size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteBackup(backup.id)}
                                  className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                                  title="Delete backup"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* Cleanup Tab */}
                  {activeTab === 'cleanup' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Data Cleanup
                        </div>
                        <div className="h-px flex-1 bg-border"></div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 rounded-lg border border-border bg-background">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-yellow-500/10">
                              <Shield size={20} className="text-yellow-500" />
                            </div>
                            <div>
                              <div className="font-medium text-foreground">Cleanup Old Backups</div>
                              <div className="text-sm text-muted-foreground">Keep only the 10 most recent backups</div>
                            </div>
                          </div>
                          <button
                            onClick={handleCleanupBackups}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-yellow-500 text-yellow-500-foreground hover:bg-yellow-500/90 transition-colors"
                          >
                            <Trash2 size={16} />
                            Cleanup Backups
                          </button>
                        </div>

                        <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/10">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-500/10">
                              <AlertTriangle size={20} className="text-red-500" />
                            </div>
                            <div>
                              <div className="font-medium text-foreground">Clear All Data</div>
                              <div className="text-sm text-muted-foreground">Permanently delete all tasks and backups</div>
                            </div>
                          </div>
                          <button
                            onClick={handleClearAllData}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-red-500 text-red-500-foreground hover:bg-red-500/90 transition-colors"
                          >
                            <Trash2 size={16} />
                            Clear All Data
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 