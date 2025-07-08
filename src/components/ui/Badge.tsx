import React from 'react'
import { cn } from '../../lib/utils'

interface BadgeProps {
  variant?: 'default' | 'feature' | 'bug' | 'docs' | 'refactor' | 'test' | 'chore' | 'low' | 'medium' | 'high' | 'critical'
  children: React.ReactNode
  className?: string
}

const badgeVariants = {
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  feature: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  bug: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  docs: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  refactor: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  test: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  chore: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
}

export default function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium',
        badgeVariants[variant],
        className
      )}
    >
      {children}
    </span>
  )
} 