import React, { useState } from 'react'
import { Edit, Trash2, Code, Calendar, Tag, AlertTriangle, Copy, Check } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'
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

export default function TaskCard({ task, onEdit }: TaskCardProps) {
  const { deleteTask } = useTodoStore()
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

  return (
    <div className="bg-background border-2 border-border rounded-md shadow-lg hover:shadow-xl transition-all duration-200 hover:border-border/80">
      {/* Header */}
      <div className="p-4 border-b-2 border-border">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-sm leading-tight">
              {task.title}
            </h3>
            {task.description && (
              <p className="text-muted-foreground text-xs mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
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
        {/* Categories and Priority */}
        <div className="flex items-center gap-2 flex-wrap">
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
              <div className="relative">
                <SyntaxHighlighter
                  language={task.language || 'javascript'}
                  style={tomorrow}
                  customStyle={{
                    margin: 0,
                    fontSize: '11px',
                    borderRadius: '4px',
                    maxHeight: '200px',
                    border: '1px solid hsl(var(--border))',
                  }}
                >
                  {task.code}
                </SyntaxHighlighter>
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