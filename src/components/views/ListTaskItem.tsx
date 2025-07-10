import { useState } from 'react'
import { Edit, Trash2, Calendar, Tag, Circle, CheckCircle, AlertTriangle, Copy, Check, Code, ChevronDown, ChevronUp } from 'lucide-react'
import Editor from '@monaco-editor/react'
import useTodoStore from '../../stores/todoStore'
import type { Task } from '../../types'
import { formatDate, generateBranchName } from '../../lib/utils'
import Badge from '../ui/Badge'

interface ListTaskItemProps {
  task: Task
  onEdit: (task: Task) => void
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

export default function ListTaskItem({ task, onEdit }: ListTaskItemProps) {
  const { deleteTask, updateTaskStatus, isDarkMode } = useTodoStore()
  const [copiedBranch, setCopiedBranch] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [showCode, setShowCode] = useState(false)

  const branchName = task.branchName || generateBranchName(task.title)

  const copyToClipboard = async (text: string, type: 'branch' | 'code') => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'branch') {
        setCopiedBranch(true)
        setTimeout(() => setCopiedBranch(false), 2000)
      } else {
        setCopiedCode(true)
        setTimeout(() => setCopiedCode(false), 2000)
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
    <div className={`bg-background border border-border rounded-lg hover:border-primary/50 transition-all duration-200 ${
      task.status === 'done' ? 'opacity-75' : ''
    }`}>
      {/* Main Task Row */}
      <div className="flex items-center gap-4 p-4">
        {/* Status Toggle */}
        <button
          onClick={handleStatusToggle}
          className="flex-shrink-0 p-1 hover:bg-accent rounded transition-colors"
          title={task.status === 'done' ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {getStatusIcon()}
        </button>

        {/* Task Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className={`font-medium text-foreground ${
              task.status === 'done' ? 'line-through text-muted-foreground' : ''
            }`}>
              {task.title}
            </h3>
            <Badge variant={task.status} className="text-xs">
              {getStatusLabel()}
            </Badge>
          </div>
          
          {task.description && (
            <p className={`text-sm text-muted-foreground line-clamp-1 ${
              task.status === 'done' ? 'line-through' : ''
            }`}>
              {task.description}
            </p>
          )}

          {/* Meta Information */}
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <Badge variant={task.category} className="text-xs">
              {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
            </Badge>
            <Badge variant={task.priority} className="text-xs">
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Badge>
            
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>Due: {formatDate(task.dueDate)}</span>
              </div>
            )}

            <div className="flex items-center gap-1">
              <Tag size={12} />
              <span>Branch:</span>
              <code className="bg-muted px-1 py-0.5 rounded font-mono border border-border">
                {branchName}
              </code>
              <button
                onClick={() => copyToClipboard(branchName, 'branch')}
                className="p-0.5 hover:bg-accent rounded transition-colors"
                title="Copy branch name"
              >
                {copiedBranch ? <Check size={10} /> : <Copy size={10} />}
              </button>
            </div>

            {/* Code Snippet Toggle */}
            {task.code && (
              <button
                onClick={() => setShowCode(!showCode)}
                className="flex items-center gap-1 hover:bg-accent px-2 py-1 rounded transition-colors"
                title="Toggle code snippet"
              >
                <Code size={12} />
                <span>{task.language?.toUpperCase()} Code</span>
                {showCode ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
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

      {/* Code Snippet */}
      {task.code && showCode && (
        <div className="border-t border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Code size={14} className="text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {task.language?.toUpperCase()} Code Snippet
              </span>
            </div>
            <button
              onClick={() => copyToClipboard(task.code!, 'code')}
              className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors hover:bg-accent"
              title="Copy code"
            >
              {copiedCode ? <Check size={12} /> : <Copy size={12} />}
            </button>
          </div>
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
        </div>
      )}
    </div>
  )
} 