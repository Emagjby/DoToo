import React, { useState, useEffect } from 'react'
import { Plus, Code, Calendar, Tag, AlertTriangle } from 'lucide-react'
import useTodoStore from '../stores/todoStore'
import type { Task, Category, Priority } from '../types'
import { generateBranchName } from '../lib/utils'
import Modal from './ui/Modal'
import Button from './ui/Button'

interface TaskFormProps {
  task?: Task
  isOpen: boolean
  onClose: () => void
}

const categories: { value: Category; label: string; color: string }[] = [
  { value: 'feature', label: 'Feature', color: 'bg-blue-500' },
  { value: 'bug', label: 'Bug', color: 'bg-red-500' },
  { value: 'docs', label: 'Docs', color: 'bg-green-500' },
  { value: 'refactor', label: 'Refactor', color: 'bg-purple-500' },
  { value: 'test', label: 'Test', color: 'bg-yellow-500' },
  { value: 'chore', label: 'Chore', color: 'bg-gray-500' },
]

const priorities: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-gray-400' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'critical', label: 'Critical', color: 'bg-red-600' },
]

const languages = [
  'javascript', 'typescript', 'python', 'java', 'cpp', 'csharp', 
  'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'html', 'css', 
  'sql', 'bash', 'json', 'yaml', 'markdown'
]

export default function TaskForm({ task, isOpen, onClose }: TaskFormProps) {
  const { addTask, updateTask } = useTodoStore()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    language: 'javascript',
    category: 'feature' as Category,
    priority: 'medium' as Priority,
    dueDate: '',
  })
  const [showCode, setShowCode] = useState(false)
  const [suggestedBranch, setSuggestedBranch] = useState('')

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        code: task.code || '',
        language: task.language || 'javascript',
        category: task.category,
        priority: task.priority,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      })
      setShowCode(!!task.code)
    } else {
      setFormData({
        title: '',
        description: '',
        code: '',
        language: 'javascript',
        category: 'feature',
        priority: 'medium',
        dueDate: '',
      })
      setShowCode(false)
    }
  }, [task, isOpen])

  useEffect(() => {
    if (formData.title) {
      setSuggestedBranch(generateBranchName(formData.title))
    }
  }, [formData.title])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const taskData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      code: formData.code.trim() || undefined,
      language: formData.language,
      category: formData.category,
      priority: formData.priority,
      status: task?.status || 'todo',
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
    }

    if (task) {
      updateTask(task.id, taskData)
    } else {
      addTask(taskData)
    }
    
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'Edit Task' : 'Create New Task'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter task title..."
              required
            />
            {suggestedBranch && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Suggested branch: <code className="bg-gray-100 dark:bg-gray-600 px-1 rounded">{suggestedBranch}</code>
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Describe the task..."
            />
          </div>

          {/* Code Snippet Toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowCode(!showCode)}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              <Code size={16} />
              {showCode ? 'Hide Code Snippet' : 'Add Code Snippet'}
            </button>
          </div>

          {/* Code Snippet */}
          {showCode && (
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Language
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {languages.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Code
                </label>
                <textarea
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm"
                  placeholder={`// Your ${formData.language} code here...`}
                />
              </div>
            </div>
          )}

          {/* Category and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.value })}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm ${
                      formData.category === cat.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <div className="grid grid-cols-2 gap-2">
                {priorities.map((priority) => (
                  <button
                    key={priority.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: priority.value })}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm ${
                      formData.priority === priority.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${priority.color}`} />
                    {priority.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Due Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              <Plus size={16} />
              {task ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </Modal>
    )
  } 