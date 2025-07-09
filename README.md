# DoToo 🚀

> **The Ultimate Developer's Task Management App** - Built for developers, by developers

A modern, feature-rich task management application designed specifically for developers. DoToo combines the simplicity of traditional task management with powerful developer-focused features like code snippets, git integration, multi-project support, and a comprehensive command palette.

![DoToo Preview](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38B2AC)
![Zustand](https://img.shields.io/badge/Zustand-State%20Management-orange)

## ✨ Features

### 🎯 Core Task Management
- **Multi-Project System**: Organize tasks across multiple projects with different view types
- **Kanban Board**: Drag & drop tasks between Todo, Doing, Done columns
- **List View**: Simple task list with sorting and filtering
- **Task Categories**: Feature, Bug, Docs, Refactor, Test, Chore with color coding
- **Priority Levels**: Low, Medium, High, Critical with visual indicators
- **Rich Task Details**: Descriptions, code snippets, due dates, tags, and more

### 🔥 Developer-Focused Features
- **Code Snippets**: Monaco Editor integration with 20+ language support
- **Git Integration**: Auto-generate git branch names from task titles
- **Command Palette**: Cmd+K for lightning-fast navigation and actions
- **Keyboard Shortcuts**: Power user shortcuts for everything
- **Developer Themes**: VS Code inspired color schemes
- **Syntax Highlighting**: Real-time code highlighting in tasks

### 🏗️ Multi-Project Architecture
- **Project Management**: Create, edit, and manage multiple projects
- **Project Types**: Development, Design, Marketing, Research, Personal, Other
- **View Types**: Kanban, List, Calendar, Gantt, Table, Mind Map
- **Project Isolation**: Tasks are automatically filtered by active project
- **Project-Specific Settings**: Each project can have its own configuration

### 🔍 Advanced Search & Filtering
- **Multi-Field Search**: Search across title, description, tags, and branch names
- **Advanced Filters**: Category, priority, status, tags, code presence, due dates
- **Project-Specific Search**: Search within the current project context
- **Filter Chips**: Visual representation with easy removal
- **Real-time Results**: Instant filtering with task statistics

### 💾 Data Management & Backup
- **Export/Import**: JSON format with comprehensive data validation
- **Project-Specific Export**: Export individual projects with their tasks
- **Backup System**: Automatic and manual backups with versioning
- **CSV Export**: Spreadsheet-compatible format for analysis
- **Data Validation**: Comprehensive error checking and recovery
- **Data Statistics**: Storage size, task counts, and project metrics

### 🎨 Modern UI/UX
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark/Light Mode**: Toggle between developer-friendly themes
- **Minimalistic Navbar**: Clean, compact selectors with responsive layout
- **Smooth Animations**: Polished micro-interactions and transitions
- **Local Storage**: Data persists between sessions
- **Offline-First**: Works without internet connection

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui + Tailwind CSS
- **State Management**: Zustand with persistence
- **Drag & Drop**: @dnd-kit
- **Icons**: Lucide React
- **Code Editor**: Monaco Editor
- **Command Palette**: cmdk
- **Data Management**: Custom localStorage wrapper

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DoToo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## 🎮 Usage

### Getting Started
1. **Create Your First Project**: Use the project selector to create a new project
2. **Choose View Type**: Select between Kanban, List, or other view types
3. **Add Tasks**: Click "New Task" or press `N` to create your first task
4. **Organize**: Use categories, priorities, and tags to organize your work

### Project Management
1. **Switch Projects**: Use the project selector in the navbar
2. **Create Projects**: Access via command palette or project selector
3. **Project Settings**: Each project can have different view types and settings
4. **Project Export**: Export individual projects with their tasks

### Task Management
1. **Create Task**: Click "New Task" or press `N`
2. **Edit Task**: Click on any task card or use command palette
3. **Move Task**: Drag & drop between columns (Kanban view)
4. **Add Code**: Use the Monaco Editor to add syntax-highlighted code
5. **Set Due Dates**: Add deadlines and track overdue tasks

### Developer Features
1. **Code Snippets**: Add code in tasks with full IDE-like experience
2. **Branch Names**: Task titles automatically suggest git branch names
3. **Command Palette**: Press `Cmd+K` (or `Ctrl+K`) for quick actions
4. **Theme Toggle**: Press `T` to switch between light/dark themes
5. **Search**: Press `/` to focus search with project context

### Data Management
1. **Export Data**: Use Data Management to export all data or specific projects
2. **Import Data**: Import JSON files to restore or migrate data
3. **Backup**: Automatic backups before destructive operations
4. **Statistics**: View detailed data statistics and storage usage

### Keyboard Shortcuts
- `N` - Create new task
- `Cmd+K` / `Ctrl+K` - Open command palette
- `T` - Toggle theme
- `/` - Focus search
- `Esc` - Close modals/palette/dropdowns

## 🎨 Customization

### Adding Custom Categories
Edit `src/types/index.ts` to add new task categories:

```typescript
export type Category = 'feature' | 'bug' | 'docs' | 'refactor' | 'test' | 'chore' | 'your-category'
```

### Custom Project Types
Add new project types in `src/types/index.ts`:

```typescript
export const PROJECT_TYPES = {
  // ... existing types
  'your-type': {
    label: 'Your Type',
    color: '#your-color',
    icon: '🎯',
    defaultViewType: 'kanban' as ViewType,
    defaultSettings: {}
  }
}
```

### Custom Themes
Modify `tailwind.config.js` to add your own color schemes:

```javascript
theme: {
  extend: {
    colors: {
      'your-theme': '#your-color',
    }
  }
}
```

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                    # shadcn components
│   ├── layout/               # Layout components
│   │   ├── Header.tsx        # Main header with project/view selectors
│   │   └── DoTooLogo.tsx     # App logo
│   ├── project/              # Project management components
│   │   ├── ProjectSelector.tsx
│   │   ├── ViewSelector.tsx
│   │   ├── ProjectForm.tsx
│   │   └── ViewContainer.tsx
│   ├── Board.tsx             # Main Kanban board
│   ├── ListView.tsx          # List view component
│   ├── TaskCard.tsx          # Individual task cards
│   ├── TaskForm.tsx          # Create/edit task form
│   ├── SearchBar.tsx         # Advanced search and filtering
│   ├── TaskStats.tsx         # Task statistics dashboard
│   ├── CommandPalette.tsx    # Command palette with cmdk
│   ├── DataManagement.tsx    # Data export/import interface
│   └── CodeBlock.tsx         # Syntax highlighted code
├── stores/
│   ├── todoStore.ts          # Task management store
│   └── projectStore.ts       # Project management store
├── services/
│   └── dataManager.ts        # Data management service
├── types/
│   └── index.ts              # TypeScript types
├── utils/
│   └── index.ts              # Helper functions
└── App.tsx                   # Main application component
```

## 🚀 Features Roadmap

### ✅ Completed Features
- [x] **Foundation**: Vite + React + TypeScript + Tailwind
- [x] **Core Task Management**: CRUD operations, categories, priorities
- [x] **Kanban Board**: Drag & drop with visual feedback
- [x] **Developer Features**: Code snippets, git integration, command palette
- [x] **Multi-Project System**: Project management with multiple view types
- [x] **Advanced Search**: Multi-field search with filters
- [x] **Data Management**: Export/import, backup, validation
- [x] **Responsive Design**: Mobile-first design with touch support
- [x] **UI Polish**: Modern design, animations, themes

### 🔄 Future Enhancements
- [ ] **Cloud Sync**: Real-time synchronization across devices
- [ ] **Team Collaboration**: Multi-user project sharing
- [ ] **GitHub Integration**: Create issues from tasks
- [ ] **Time Tracking**: Built-in time tracking for tasks
- [ ] **Advanced Views**: Calendar, Gantt, and Mind Map implementations
- [ ] **API Integration**: Webhook support and external integrations
- [ ] **Mobile App**: Native mobile applications
- [ ] **Offline Sync**: Advanced offline capabilities

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use shadcn/ui components when possible
- Maintain responsive design principles
- Add proper error handling
- Include comprehensive tests

## 🐛 Known Issues

- None currently reported

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Zustand](https://github.com/pmndrs/zustand) for the lightweight state management
- [Lucide](https://lucide.dev/) for the amazing icons
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the code editing experience
- [cmdk](https://cmdk.paco.me/) for the command palette functionality

---

**Built with ❤️ for developers everywhere**

*DoToo - Because developers deserve better task management*

---

## 📊 Project Status

**Current Version**: 1.0.0  
**Last Updated**: 10th of July
**Status**: 🎉 Production Ready  

This project has evolved from a simple todo app to a comprehensive developer task management solution. The multi-project architecture, advanced search capabilities, and developer-focused features make it a powerful tool for organizing development work.
