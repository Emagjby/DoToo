import React, { useState } from 'react'
import { Edit, Trash2, Code, Calendar, Tag, AlertTriangle, Copy, Check, Circle, CheckCircle } from 'lucide-react'
import Editor from '@monaco-editor/react'
import useTodoStore from '../stores/todoStore'
import type { Task, Category, Priority } from '../types'
import { formatDate, generateBranchName } from '../lib/utils'
import Badge from './ui/Badge'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
}

const categoryConfig: Record<Category, { label: string; color: string; bgColor: string }> = {
  feature: { label: 'Feature', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  bug: { label: 'Bug', color: 'text-red-700', bgColor: 'bg-red-100' },
  docs: { label: 'Docs', color: 'text-green-700', bgColor: 'bg-green-100' },
  refactor: { label: 'Refactor', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  test: { label: 'Test', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  chore: { label: 'Chore', color: 'text-gray-700', bgColor: 'bg-gray-100' },
}

const priorityConfig: Record<Priority, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  low: { label: 'Low', color: 'text-gray-700', bgColor: 'bg-gray-100', icon: <Tag size={12} /> },
  medium: { label: 'Medium', color: 'text-yellow-700', bgColor: 'bg-yellow-100', icon: <AlertTriangle size={12} /> },
  high: { label: 'High', color: 'text-orange-700', bgColor: 'bg-orange-100', icon: <AlertTriangle size={12} /> },
  critical: { label: 'Critical', color: 'text-red-700', bgColor: 'bg-red-100', icon: <AlertTriangle size={12} /> },
}

// Map language names to Monaco language IDs
const getMonacoLanguage = (language: string): string => {
  const languageMap: { [key: string]: string } = {
    'JavaScript': 'javascript',
    'TypeScript': 'typescript',
    'Python': 'python',
    'Java': 'java',
    'C++': 'cpp',
    'C#': 'csharp',
    'PHP': 'php',
    'Ruby': 'ruby',
    'Go': 'go',
    'Rust': 'rust',
    'Swift': 'swift',
    'Kotlin': 'kotlin',
    'HTML': 'html',
    'CSS': 'css',
    'SQL': 'sql',
    'Bash': 'bash',
    'JSON': 'json',
    'YAML': 'yaml',
    'Markdown': 'markdown',
  }
  return languageMap[language] || 'javascript'
}

export default function TaskCard({ task, onEdit }: TaskCardProps) {
  const { deleteTask, isDarkMode, updateTaskStatus } = useTodoStore()
  const [showCode, setShowCode] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copiedBranch, setCopiedBranch] = useState(false)

  const category = categoryConfig[task.category]
  const priority = priorityConfig[task.priority]
  const branchName = task.branchName || generateBranchName(task.title)

  const copyToClipboard = async (text: string, type: 'code' | 'branch') => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'code') {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } else {
        setCopiedBranch(true)
        setTimeout(() => setCopiedBranch(false), 2000)
      }
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask(task.id)
    }
  }

  const handleStatusToggle = () => {
    const newStatus = task.status === 'done' ? 'todo' : 'done'
    updateTaskStatus(task.id, newStatus)
  }

  const getStatusIcon = () => {
    switch (task.status) {
      case 'todo':
        return <Circle size={16} className="text-muted-foreground" />
      case 'doing':
        return <AlertTriangle size={16} className="text-blue-500" />
      case 'done':
        return <CheckCircle size={16} className="text-green-500" />
      default:
        return <Circle size={16} className="text-muted-foreground" />
    }
  }

  const getStatusLabel = () => {
    switch (task.status) {
      case 'todo':
        return 'To Do'
      case 'doing':
        return 'In Progress'
      case 'done':
        return 'Done'
      default:
        return 'To Do'
    }
  }

  return (
    <div className={`bg-background border-2 border-border rounded-md shadow-lg hover:shadow-xl transition-all duration-200 hover:border-border/80 ${
      task.status === 'done' ? 'opacity-75' : ''
    }`}>
      {/* Header */}
      <div className="p-4 border-b-2 border-border">
        <div className="flex items-start justify-between">
          <div className="flex-1 flex items-start gap-3">
            {/* Status Toggle */}
            <button
              onClick={handleStatusToggle}
              className="flex-shrink-0 mt-0.5 p-1 hover:bg-accent rounded transition-colors"
              title={task.status === 'done' ? 'Mark as incomplete' : 'Mark as complete'}
            >
              {getStatusIcon()}
            </button>
            
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-foreground text-sm leading-tight ${
                task.status === 'done' ? 'line-through text-muted-foreground' : ''
              }`}>
                {task.title}
              </h3>
              {task.description && (
                <p className={`text-muted-foreground text-xs mt-1 line-clamp-2 ${
                  task.status === 'done' ? 'line-through' : ''
                }`}>
                  {task.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={() => onEdit(task)}
              className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors hover:bg-accent"
              title="Edit task"
            >
              <Edit size={14} />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 text-muted-foreground hover:text-destructive rounded transition-colors hover:bg-destructive/10"
              title="Delete task"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Meta Information */}
      <div className="p-4 space-y-3">
        {/* Status, Categories and Priority */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={task.status}>
            {getStatusIcon()}
            {getStatusLabel()}
          </Badge>
          <Badge variant={task.category}>
            {category.label}
          </Badge>
          <Badge variant={task.priority}>
            {priority.icon}
            {priority.label}
          </Badge>
        </div>

        {/* Git Branch Suggestion */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag size={12} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Branch:</span>
            <code className="text-xs bg-muted px-2 py-1 rounded font-mono border border-border">
              {branchName}
            </code>
            {task.branchName && (
              <span className="text-xs text-muted-foreground">(custom)</span>
            )}
          </div>
          <button
            onClick={() => copyToClipboard(branchName, 'branch')}
            className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors hover:bg-accent"
            title="Copy branch name"
          >
            {copiedBranch ? <Check size={12} /> : <Copy size={12} />}
          </button>
        </div>

        {/* Due Date */}
        {task.dueDate && (
          <div className="flex items-center gap-2">
            <Calendar size={12} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Due: {formatDate(task.dueDate)}
            </span>
          </div>
        )}

        {/* Code Snippet */}
        {task.code && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowCode(!showCode)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Code size={12} />
                {task.language?.toUpperCase()} Code
              </button>
              {showCode && (
                <button
                  onClick={() => copyToClipboard(task.code!, 'code')}
                  className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors hover:bg-accent"
                  title="Copy code"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                </button>
              )}
            </div>
            {showCode && (
              <div className="relative border border-border rounded-lg overflow-hidden">
                <Editor
                  height="200px"
                  language={getMonacoLanguage(task.language || 'JavaScript')}
                  value={task.code}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 11,
                    lineNumbers: 'on',
                    folding: true,
                    wordWrap: 'on',
                    theme: isDarkMode ? 'vs-dark' : 'vs',
                    contextmenu: false,
                    quickSuggestions: false,
                    suggestOnTriggerCharacters: false,
                    parameterHints: { enabled: false },
                    hover: { enabled: false },
                  }}
                  theme={isDarkMode ? 'vs-dark' : 'vs'}
                />
              </div>
            )}
          </div>
        )}

        {/* Created Date */}
        <div className="text-xs text-muted-foreground">
          Created: {formatDate(task.createdAt)}
        </div>
      </div>
    </div>
  )
} 