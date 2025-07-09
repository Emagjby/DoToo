import React, { useState, useEffect, useRef } from 'react'
import { Plus, Code, Calendar, Tag, AlertTriangle, GitBranch, FileText, Settings, Clock, ChevronDown, Sparkles, Bug, BookOpen, Wrench, TestTube, Scissors, Languages, X, Github, Edit } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'
import Editor from '@monaco-editor/react'
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

const categories: { value: Category; label: string; color: string; icon: React.ReactNode }[] = [
  { value: 'feature', label: 'Feature', color: 'bg-blue-500', icon: <Sparkles size={16} /> },
  { value: 'bug', label: 'Bug', color: 'bg-red-500', icon: <Bug size={16} /> },
  { value: 'docs', label: 'Docs', color: 'bg-green-500', icon: <BookOpen size={16} /> },
  { value: 'refactor', label: 'Refactor', color: 'bg-purple-500', icon: <Wrench size={16} /> },
  { value: 'test', label: 'Test', color: 'bg-yellow-500', icon: <TestTube size={16} /> },
  { value: 'chore', label: 'Chore', color: 'bg-gray-500', icon: <Scissors size={16} /> },
]

const priorities: { value: Priority; label: string; color: string; icon: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-gray-400', icon: '🟢' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500', icon: '🟡' },
  { value: 'high', label: 'High', color: 'bg-orange-500', icon: '🟠' },
  { value: 'critical', label: 'Critical', color: 'bg-red-600', icon: '🔴' },
]

const languages: { value: string; label: string; icon: React.ReactNode }[] = [
  { value: 'javascript', label: 'JavaScript', icon: <Code size={16} /> },
  { value: 'typescript', label: 'TypeScript', icon: <FileText size={16} /> },
  { value: 'python', label: 'Python', icon: <Code size={16} /> },
  { value: 'java', label: 'Java', icon: <Code size={16} /> },
  { value: 'cpp', label: 'C++', icon: <Code size={16} /> },
  { value: 'csharp', label: 'C#', icon: <Code size={16} /> },
  { value: 'php', label: 'PHP', icon: <Code size={16} /> },
  { value: 'ruby', label: 'Ruby', icon: <Code size={16} /> },
  { value: 'go', label: 'Go', icon: <Code size={16} /> },
  { value: 'rust', label: 'Rust', icon: <Code size={16} /> },
  { value: 'swift', label: 'Swift', icon: <Code size={16} /> },
  { value: 'kotlin', label: 'Kotlin', icon: <Code size={16} /> },
  { value: 'html', label: 'HTML', icon: <Code size={16} /> },
  { value: 'css', label: 'CSS', icon: <Code size={16} /> },
  { value: 'sql', label: 'SQL', icon: <Code size={16} /> },
  { value: 'bash', label: 'Bash', icon: <Code size={16} /> },
  { value: 'json', label: 'JSON', icon: <FileText size={16} /> },
  { value: 'yaml', label: 'YAML', icon: <FileText size={16} /> },
  { value: 'markdown', label: 'Markdown', icon: <FileText size={16} /> },
  ]
  
  // Map language names to Monaco language IDs and get language info
  const getLanguageInfo = (lang: string) => {
    const languageMap: { [key: string]: { monacoId: string; icon: React.ReactNode; color: string } } = {
      'JavaScript': { 
        monacoId: 'javascript', 
        icon: <Code className="w-3 h-3" />, 
        color: 'text-yellow-400' 
      },
      'TypeScript': { 
        monacoId: 'typescript', 
        icon: <Code className="w-3 h-3" />, 
        color: 'text-blue-400' 
      },
      'Python': { 
        monacoId: 'python', 
        icon: <Code className="w-3 h-3" />, 
        color: 'text-green-400' 
      },
      'HTML': { 
        monacoId: 'html', 
        icon: <FileText className="w-3 h-3" />, 
        color: 'text-orange-400' 
      },
      'CSS': { 
        monacoId: 'css', 
        icon: <FileText className="w-3 h-3" />, 
        color: 'text-blue-400' 
      },
      'JSON': { 
        monacoId: 'json', 
        icon: <FileText className="w-3 h-3" />, 
        color: 'text-yellow-400' 
      },
      'Markdown': { 
        monacoId: 'markdown', 
        icon: <FileText className="w-3 h-3" />, 
        color: 'text-blue-400' 
      },
      'SQL': { 
        monacoId: 'sql', 
        icon: <Code className="w-3 h-3" />, 
        color: 'text-purple-400' 
      },
      'Java': { 
        monacoId: 'java', 
        icon: <Code className="w-3 h-3" />, 
        color: 'text-red-400' 
      },
      'C++': { 
        monacoId: 'cpp', 
        icon: <Code className="w-3 h-3" />, 
        color: 'text-blue-400' 
      },
      'C#': { 
        monacoId: 'csharp', 
        icon: <Code className="w-3 h-3" />, 
        color: 'text-purple-400' 
      },
      'PHP': { 
        monacoId: 'php', 
        icon: <Code className="w-3 h-3" />, 
        color: 'text-purple-400' 
      },
      'Ruby': { 
        monacoId: 'ruby', 
        icon: <Code className="w-3 h-3" />, 
        color: 'text-red-400' 
      },
      'Go': { 
        monacoId: 'go', 
        icon: <Code className="w-3 h-3" />, 
        color: 'text-blue-400' 
      },
      'Rust': { 
        monacoId: 'rust', 
        icon: <Code className="w-3 h-3" />, 
        color: 'text-orange-400' 
      },
      'Swift': { 
        monacoId: 'swift', 
        icon: <Code className="w-3 h-3" />, 
        color: 'text-orange-400' 
      },
      'Kotlin': { 
        monacoId: 'kotlin', 
        icon: <Code className="w-3 h-3" />, 
        color: 'text-purple-400' 
      },
      'Scala': { 
        monacoId: 'scala', 
        icon: <Code className="w-3 h-3" />, 
        color: 'text-red-400' 
      },
      'Dart': { 
        monacoId: 'dart', 
        icon: <Code className="w-3 h-3" />, 
        color: 'text-blue-400' 
      },
      'R': { 
        monacoId: 'r', 
        icon: <Code className="w-3 h-3" />, 
        color: 'text-blue-400' 
      },
      'MATLAB': { 
        monacoId: 'matlab', 
        icon: <Code className="w-3 h-3" />, 
        color: 'text-orange-400' 
      },
      'Shell': { 
        monacoId: 'shell', 
        icon: <Code className="w-3 h-3" />, 
        color: 'text-green-400' 
      },
      'PowerShell': { 
        monacoId: 'powershell', 
        icon: <Code className="w-3 h-3" />, 
        color: 'text-blue-400' 
      },
      'YAML': { 
        monacoId: 'yaml', 
        icon: <FileText className="w-3 h-3" />, 
        color: 'text-green-400' 
      },
      'XML': { 
        monacoId: 'xml', 
        icon: <FileText className="w-3 h-3" />, 
        color: 'text-orange-400' 
      },
      'Vue': { 
        monacoId: 'vue', 
        icon: <Code className="w-3 h-3" />, 
        color: 'text-green-400' 
      },
      'JSX': { 
        monacoId: 'javascript', 
        icon: <Code className="w-3 h-3" />, 
        color: 'text-yellow-400' 
      },
      'TSX': { 
        monacoId: 'typescript', 
        icon: <Code className="w-3 h-3" />, 
        color: 'text-blue-400' 
      }
    };
    return languageMap[lang] || languageMap['JavaScript'];
  };
  
  // Monaco Code Editor Component
  const CodeEditor = ({ value, onChange, language }: { value: string; onChange: (value: string) => void; language: string }) => {

  return (
    <div className="relative bg-[#1e1e1e] rounded-lg border border-gray-700 overflow-hidden">
      {/* Language Badge */}
      <div className="absolute top-2 right-2 z-10">
        <span className={`px-2 py-1 text-xs font-mono bg-gray-800 rounded border border-gray-600 flex items-center gap-1 ${getLanguageInfo(language).color}`}>
          {getLanguageInfo(language).icon}
          {language}
        </span>
      </div>
      
      {/* Monaco Editor */}
      <Editor
        height="192px"
        language={getLanguageInfo(language).monacoId}
        value={value}
        onChange={(val) => onChange(val || '')}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          fontFamily: 'Consolas, Monaco, "Courier New", monospace',
          lineHeight: 24,
          padding: { top: 16, bottom: 16 },
          wordWrap: 'on',
          automaticLayout: true,
          suggestOnTriggerCharacters: false,
          quickSuggestions: false,
          parameterHints: { enabled: false },
          hover: { enabled: false },
          contextmenu: false,
          folding: false,
          lineNumbers: 'on',
          glyphMargin: false,
          foldingStrategy: 'indentation',
          showFoldingControls: 'never',
          matchBrackets: 'never',
          renderLineHighlight: 'none',
          overviewRulerBorder: false,
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
            useShadows: false
          }
        }}
      />
    </div>
  );
};

export default function TaskForm({ task, isOpen, onClose }: TaskFormProps) {
  const { addTask, updateTask } = useTodoStore()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'feature' as Category,
    priority: 'medium' as Priority,
    dueDate: '',
    branchName: '',
  })
  const [showCode, setShowCode] = useState(false)
  const [suggestedBranch, setSuggestedBranch] = useState('')
  const [useCustomBranch, setUseCustomBranch] = useState(false)
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)
  const [code, setCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('JavaScript');

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        category: task.category,
        priority: task.priority,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        branchName: task.branchName || '',
      })
      setUseCustomBranch(!!task.branchName)
      setCode(task.code || '');
      setSelectedLanguage(task.language || 'JavaScript');
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'feature',
        priority: 'medium',
        dueDate: '',
        branchName: '',
      })
      setUseCustomBranch(false)
      setCode('');
      setSelectedLanguage('JavaScript');
    }
  }, [task, isOpen])

  useEffect(() => {
    if (formData.title && !useCustomBranch) {
      setSuggestedBranch(generateBranchName(formData.title))
    }
  }, [formData.title, useCustomBranch])

  // Close dropdowns when escape is pressed (handled by parent)
  useEffect(() => {
    const handleCloseDropdowns = () => {
      setShowLanguageDropdown(false)
    }
    
    // Store the handler in a way that parent can call it
    ;(window as any).closeTaskFormDropdowns = handleCloseDropdowns
    
    return () => {
      delete (window as any).closeTaskFormDropdowns
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const taskData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      code: code.trim() || undefined,
      language: selectedLanguage,
      category: formData.category,
      priority: formData.priority,
      status: task?.status || 'todo',
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      branchName: useCustomBranch ? formData.branchName.trim() : suggestedBranch,
    }

    if (task) {
      updateTask(task.id, taskData)
    } else {
      addTask(taskData)
    }
    
    // Small delay to ensure state updates are processed
    setTimeout(() => {
      onClose()
    }, 100)
  }

  const currentLanguage = languages.find(lang => lang.value === selectedLanguage)
  const currentCategory = categories.find(cat => cat.value === formData.category)

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="bg-background border border-border rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                  {task ? <Edit size={20} className="text-primary" /> : <Plus size={20} className="text-primary" />}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {task ? 'Edit Task' : 'Create New Task'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {task ? 'Update task details and configuration' : 'Add a new task to your project'}
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
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Basic Information Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Basic Information
            </div>
            <div className="h-px flex-1 bg-border"></div>
          </div>
          
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="flex h-12 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
              placeholder="Enter task title..."
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="flex min-h-[80px] w-full rounded-lg border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
              placeholder="Describe the task..."
            />
          </div>
        </div>

        {/* Git Integration Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Git Integration
            </div>
            <div className="h-px flex-1 bg-border"></div>
          </div>

          {/* Branch Name */}
          <div className="space-y-3">
            {/* Branch Type Toggle */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUseCustomBranch(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm transition-colors ${
                  !useCustomBranch
                    ? 'border-primary bg-primary/10 text-primary shadow-sm'
                    : 'border-border bg-background text-foreground hover:bg-accent'
                }`}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10">
                  <GitBranch size={16} className="text-primary" />
                </div>
                <span className="font-medium">Auto-generate</span>
              </button>
              <button
                type="button"
                onClick={() => setUseCustomBranch(true)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm transition-colors ${
                  useCustomBranch
                    ? 'border-primary bg-primary/10 text-primary shadow-sm'
                    : 'border-border bg-background text-foreground hover:bg-accent'
                }`}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10">
                  <Tag size={16} className="text-primary" />
                </div>
                <span className="font-medium">Custom</span>
              </button>
            </div>

            {/* Branch Name Display/Input */}
            {!useCustomBranch ? (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted">
                  <GitBranch size={16} className="text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <span className="text-sm text-muted-foreground">Branch:</span>
                  <code className="block text-sm font-mono text-foreground mt-1">
                    {suggestedBranch || 'Enter title to generate...'}
                  </code>
                </div>
              </div>
            ) : (
              <input
                type="text"
                value={formData.branchName}
                onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                className="flex h-12 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono transition-colors"
                placeholder="feature/custom-branch-name"
              />
            )}
          </div>
        </div>

        {/* Task Configuration Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Task Configuration
            </div>
            <div className="h-px flex-1 bg-border"></div>
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.value })}
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg border transition-colors ${
                      formData.category === cat.value
                        ? 'border-primary bg-primary/10 text-primary shadow-sm'
                        : 'border-border bg-background text-foreground hover:bg-accent'
                    }`}
                  >
                    <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary/10">
                      {cat.icon}
                    </div>
                    <span className="font-medium">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Priority
              </label>
              <div className="grid grid-cols-2 gap-2">
                {priorities.map((priority) => (
                  <button
                    key={priority.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: priority.value })}
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg border transition-colors ${
                      formData.priority === priority.value
                        ? 'border-primary bg-primary/10 text-primary shadow-sm'
                        : 'border-border bg-background text-foreground hover:bg-accent'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${priority.color.replace('bg-', 'bg-')}`} />
                    <span className="font-medium">{priority.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Due Date
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary/10">
                  <Clock size={14} className="text-primary" />
                </div>
              </div>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="flex h-12 w-full rounded-lg border border-border bg-background pl-12 pr-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Code Snippet */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Code Snippet
            </div>
            <div className="h-px flex-1 bg-border"></div>
            <button
              type="button"
              onClick={() => {
                setCode('');
              }}
              className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          </div>
          
          <div className="space-y-3">
            {/* Language Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="w-full flex items-center justify-between px-4 py-3 bg-background border border-border rounded-lg text-sm text-foreground hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10">
                    <Languages size={16} className="text-primary" />
                  </div>
                  <span className="font-medium">{selectedLanguage}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>
              
              {showLanguageDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {languages.map((lang) => (
                    <button
                      key={lang.value}
                      type="button"
                      onClick={() => {
                        setSelectedLanguage(lang.label);
                        setShowLanguageDropdown(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary/10">
                        <div className={`${getLanguageInfo(lang.label).color}`}>
                          {getLanguageInfo(lang.label).icon}
                        </div>
                      </div>
                      <span className="font-medium">{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Code Editor */}
            <CodeEditor
              value={code}
              onChange={setCode}
              language={selectedLanguage}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-border bg-background text-foreground hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            {task ? <Edit size={16} /> : <Plus size={16} />}
            {task ? 'Update Task' : 'Create Task'}
          </button>
        </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 