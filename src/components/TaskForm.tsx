import React, { useState, useEffect, useRef } from 'react'
import { Plus, Code, Calendar, Tag, AlertTriangle, GitBranch, FileText, Settings, Clock, ChevronDown, Sparkles, Bug, BookOpen, Wrench, TestTube, Scissors, Languages, X, Github } from 'lucide-react'
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
    
    onClose()
  }

  const currentLanguage = languages.find(lang => lang.value === selectedLanguage)
  const currentCategory = categories.find(cat => cat.value === formData.category)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'Edit Task' : 'Create New Task'}
    >
      <form onSubmit={handleSubmit} className="space-y-0">
        {/* Basic Information Section */}
        <div className="space-y-4 pb-12">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <div className="p-1.5 rounded-md bg-blue-500/10">
              <FileText size={14} className="text-blue-500" />
            </div>
            Basic Information
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
              className="flex h-10 w-full rounded-md border-2 border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
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
              className="flex min-h-[80px] w-full rounded-md border-2 border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Describe the task..."
            />
          </div>
        </div>

        {/* Git Integration Section */}
        <div className="space-y-4 pb-12">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <div className="p-1.5 rounded-md bg-green-500/10">
              <Github size={14} className="text-green-500" />
            </div>
            Git Integration
          </div>

          {/* Branch Name */}
          <div className="space-y-3">
            {/* Branch Type Toggle */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setUseCustomBranch(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md border-2 text-sm transition-all duration-200 ${
                  !useCustomBranch
                    ? 'border-green-500 bg-green-500/20 text-green-400 shadow-sm'
                    : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500 hover:bg-gray-700'
                }`}
              >
                <GitBranch size={14} />
                Auto-generate
              </button>
              <button
                type="button"
                onClick={() => setUseCustomBranch(true)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md border-2 text-sm transition-all duration-200 ${
                  useCustomBranch
                    ? 'border-green-500 bg-green-500/20 text-green-400 shadow-sm'
                    : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500 hover:bg-gray-700'
                }`}
              >
                <Tag size={14} />
                Custom
              </button>
            </div>

            {/* Branch Name Display/Input */}
            {!useCustomBranch ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-300">Branch:</span>
                <code className="text-sm bg-gray-700 px-2 py-1 rounded font-mono border border-gray-600 text-gray-200">
                  {suggestedBranch || 'Enter title to generate...'}
                </code>
              </div>
            ) : (
              <input
                type="text"
                value={formData.branchName}
                onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                className="flex h-10 w-full rounded-md border-2 border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                placeholder="feature/custom-branch-name"
              />
            )}
          </div>
        </div>

        {/* Task Configuration Section */}
        <div className="space-y-4 pb-12">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <div className="p-1.5 rounded-md bg-purple-500/10">
              <Settings size={14} className="text-purple-500" />
            </div>
            Task Configuration
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.value })}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-md border-2 text-sm transition-all duration-200 ${
                      formData.category === cat.value
                        ? 'border-purple-500 bg-purple-500/20 text-purple-400 shadow-sm'
                        : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500 hover:bg-gray-700'
                    }`}
                  >
                    {cat.icon}
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Priority
              </label>
              <div className="grid grid-cols-2 gap-2">
                {priorities.map((priority) => (
                  <button
                    key={priority.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: priority.value })}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md border-2 text-sm transition-all duration-200 ${
                      formData.priority === priority.value
                        ? 'border-purple-500 bg-purple-500/20 text-purple-400 shadow-sm'
                        : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500 hover:bg-gray-700'
                    }`}
                  >
                    <span className="text-base">{priority.icon}</span>
                    {priority.label}
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
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 p-1 rounded bg-orange-500/10">
                <Clock size={12} className="text-orange-500" />
              </div>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="flex h-10 w-full rounded-md border-2 border-input bg-background pl-12 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Code Snippet */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-medium text-gray-100">Code Snippet</h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setCode('');
              }}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-gray-100 hover:bg-gray-700 rounded transition-colors"
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
                className="w-full flex items-center justify-between px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-sm text-gray-100 hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Languages className="w-4 h-4" />
                  <span>{selectedLanguage}</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showLanguageDropdown && (
                              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                {languages.map((lang) => (
                  <button
                    key={lang.value}
                    type="button"
                    onClick={() => {
                      setSelectedLanguage(lang.label);
                      setShowLanguageDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-100 hover:bg-gray-700 transition-colors"
                  >
                    <div className={`${getLanguageInfo(lang.label).color}`}>
                      {getLanguageInfo(lang.label).icon}
                    </div>
                    <span>{lang.label}</span>
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
        <div className="flex justify-end gap-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="gap-2 shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Plus size={16} />
            {task ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  )
} 