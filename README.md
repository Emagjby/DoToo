# DoToo 🚀

> **The Developer's Todo App** - Built for developers, by developers

A modern, feature-rich todo application designed specifically for developers. DoToo combines the simplicity of traditional task management with powerful developer-focused features like code snippets, git integration, and a command palette.

![DoToo Preview](https://img.shields.io/badge/Status-In%20Development-orange)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38B2AC)

## ✨ Features

### 🎯 Core Todo Features
- **Kanban Board**: Drag & drop tasks between Todo, Doing, Done columns
- **Task Management**: Create, edit, delete tasks with rich descriptions
- **Categories & Priorities**: Organize tasks with color-coded categories and priority levels
- **Search & Filtering**: Find tasks quickly with powerful search and filter options
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile

### 🔥 Developer-Focused Features
- **Code Snippets**: Embed syntax-highlighted code directly in tasks
- **Git Branch Generator**: Auto-generate git branch names from task titles
- **Command Palette**: Cmd+K for lightning-fast navigation and actions
- **Developer Themes**: VS Code inspired color schemes
- **Keyboard Shortcuts**: Power user shortcuts for everything

### 🎨 Design & UX
- **Modern UI**: Clean, minimalistic design with shadcn/ui components
- **Dark/Light Mode**: Toggle between developer-friendly themes
- **Smooth Animations**: Polished micro-interactions and transitions
- **Local Storage**: Data persists between sessions
- **Offline-First**: Works without internet connection

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui + Tailwind CSS
- **State Management**: Zustand
- **Drag & Drop**: @dnd-kit
- **Icons**: Lucide React
- **Code Highlighting**: react-syntax-highlighter
- **Command Palette**: cmdk

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

### Basic Task Management
1. **Create Task**: Click "New Task" or press `N`
2. **Edit Task**: Click on any task card
3. **Move Task**: Drag & drop between columns
4. **Delete Task**: Use the delete button or keyboard shortcut

### Developer Features
1. **Code Snippets**: Add code in the task description with language selection
2. **Branch Names**: Task titles automatically suggest git branch names
3. **Command Palette**: Press `Cmd+K` (or `Ctrl+K`) for quick actions
4. **Theme Toggle**: Press `T` to switch between light/dark themes

### Keyboard Shortcuts
- `N` - Create new task
- `K` - Open command palette
- `T` - Toggle theme
- `/` - Focus search
- `Esc` - Close modals/palette

## 🎨 Customization

### Adding Custom Categories
Edit `src/types/index.ts` to add new task categories:

```typescript
export type Category = 'feature' | 'bug' | 'docs' | 'refactor' | 'test' | 'chore' | 'your-category'
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
│   ├── ui/              # shadcn components
│   ├── Board.tsx        # Main Kanban board
│   ├── TaskCard.tsx     # Individual task cards
│   ├── TaskForm.tsx     # Create/edit task form
│   ├── CommandPalette.tsx
│   └── CodeBlock.tsx    # Syntax highlighted code
├── stores/
│   └── todoStore.ts     # Zustand store
├── types/
│   └── index.ts         # TypeScript types
├── utils/
│   └── index.ts         # Helper functions
└── App.tsx
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Development Roadmap

- [x] **Phase 1**: Foundation (Vite + React + TypeScript + Tailwind)
- [ ] **Phase 2**: Core Features (Kanban board, CRUD operations)
- [ ] **Phase 3**: Developer Magic (Code snippets, command palette)
- [ ] **Phase 4**: Polish & Deploy (Responsive design, deployment)

## 🐛 Known Issues

- None currently reported

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Zustand](https://github.com/pmndrs/zustand) for the lightweight state management
- [Lucide](https://lucide.dev/) for the amazing icons

---

**Built with ❤️ for developers everywhere**

*DoToo - Because developers deserve better todo apps*
