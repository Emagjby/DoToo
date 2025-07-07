# DoToo - 1 Day Sprint Roadmap 🚀💨

## MISSION: Build a sick developer todo app in 1 DAY!

### Tech Stack (Keep it Simple & Fast)
- **Frontend**: React 18 + Vite + TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **State**: Zustand (lightweight & fast)
- **Storage**: LocalStorage
- **Icons**: Lucide React
- **Drag & Drop**: @dnd-kit/core

## 1-Day Timeline ⏰

### Phase 1: Foundation (2 hours)
**9:00 AM - 11:00 AM**
- [ ] Vite + React + TypeScript setup
- [ ] shadcn/ui installation 
- [ ] Tailwind config with developer color scheme
- [ ] Basic folder structure
- [ ] Zustand store setup

### Phase 2: Core Features (4 hours)
**11:00 AM - 3:00 PM**
- [ ] Task CRUD operations
- [ ] Basic Kanban board (3 columns: Todo, Doing, Done)
- [ ] Drag & drop between columns
- [ ] Task categories with colors
- [ ] Priority levels
- [ ] Search functionality

### Phase 3: Developer Magic ✨ (3 hours)
**3:00 PM - 6:00 PM**
- [ ] Code snippet support in tasks (syntax highlighting)
- [ ] Git branch name generator from task titles
- [ ] Quick command palette (Cmd+K)
- [ ] Dark/light theme toggle
- [ ] Developer color schemes

### Phase 4: Polish & Deploy (3 hours)
**6:00 PM - 9:00 PM**
- [ ] Responsive design
- [ ] Animations & micro-interactions
- [ ] LocalStorage persistence
- [ ] Error handling
- [ ] Build & deploy

## MVP Features (What We're Actually Building)

### ✅ Core Todo Features
- Create/edit/delete tasks
- 3-column Kanban board
- Drag & drop
- Categories & priorities
- Search

### 🔥 Developer Unique Features (The Sauce)
1. **Code Snippet Cards**: Tasks can contain syntax-highlighted code
2. **Branch Name Generator**: Auto-generate git branch names from task titles
3. **Command Palette**: Cmd+K for everything
4. **Developer Themes**: VS Code inspired color schemes
5. **Quick Actions**: Keyboard shortcuts for everything

### 🎨 Design System
```css
/* Developer Color Palette */
--primary: #007ACC;        /* VS Code Blue */
--secondary: #4CAF50;      /* Success Green */
--accent: #FF6B35;         /* Warning Orange */
--danger: #F44336;         /* Error Red */
--bg-dark: #1E1E1E;        /* VS Code Dark */
--bg-light: #FFFFFF;       /* Clean White */
--surface: #2D2D30;        /* Card Background */
--text: #CCCCCC;           /* Code Text */
```

## File Structure (Keep it Clean)
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

## Key Components to Build

### 1. TaskCard Component
```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  code?: string;          // Code snippet
  category: Category;
  priority: Priority;
  status: 'todo' | 'doing' | 'done';
  createdAt: Date;
  dueDate?: Date;
}
```

### 2. Developer Features
- **Code highlighting**: Use Prism.js or react-syntax-highlighter
- **Branch generator**: Convert "Fix login bug" → "fix/login-bug"
- **Command palette**: Quick task creation, navigation, theme switching
- **Keyboard shortcuts**: 
  - `N` - New task
  - `K` - Command palette
  - `T` - Toggle theme
  - `/` - Search

## Success Criteria (End of Day)
- [ ] Working Kanban board with drag & drop
- [ ] Tasks with code snippet support
- [ ] Command palette working
- [ ] Responsive design
- [ ] Data persistence
- [ ] At least 2 developer themes
- [ ] Deployed and shareable

## Deployment Plan
- Build with `npm run build`
- Deploy to Vercel/Netlify for instant sharing
- Domain: dotoo-dev.vercel.app (or similar)

## Emergency Cuts (If Running Behind)
1. Skip animations
2. Reduce to 2 themes only
3. Simple text search instead of fuzzy
4. Basic code blocks without language detection

---

**LET'S FUCKING GO! 🔥** 

We're building a developer todo app that actually gets developers. Code snippets, git integration, command palette - all the good stuff, just condensed into one epic day of coding! 