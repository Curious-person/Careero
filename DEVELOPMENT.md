# Careero - Developer Guide

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Guidelines](#development-guidelines)
- [Adding New Features](#adding-new-features)
- [UI Components](#ui-components)
- [Best Practices](#best-practices)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development servers (both frontend and backend):
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) for the frontend frontend and [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health) for the backend API.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both development servers (web & api) |
| `npm run dev --workspace=apps/web` | Start web development server |
| `npm run dev --workspace=apps/api` | Start api development server |
| `npm run build` | Build all projects |
| `npm run lint` | Run ESLint |

---

## 📁 Project Structure

```
apps/
├── api/                      # Express.js Backend
│   ├── src/
│   │   ├── config/           # Environment config
│   │   ├── controllers/      # Route controllers
│   │   ├── middlewares/      # Express middlewares
│   │   ├── models/           # Database models
│   │   ├── routes/           # API routes
│   │   └── services/         # Business logic
│   └── package.json
│
├── web/                      # Next.js Frontend
│   ├── src/
│   │   ├── app/              # Next.js App Router
│   │   ├── components/       # React components
│   │   ├── lib/              # Utility functions
│   │   ├── hooks/            # Custom React hooks
│   │   └── types/            # TypeScript types
│   └── package.json
```

---

## 📝 Development Guidelines

### Where to Add New Code

#### 1. **New Pages (Web)**
Add new pages in `apps/web/src/app/(pages)/`:

```
apps/web/src/app/(pages)/
├── new-feature/
│   ├── page.tsx          # Main page component
│   └── loading.tsx       # Optional loading state
```

#### 2. **New Components**

**UI Components** (reusable):
- Add to `src/components/ui/`
- Use shadcn/ui patterns
- Export with named exports

**Feature Components** (specific to a feature):
- Add to `src/components/features/`
- Can compose UI components
- Keep them focused and single-purpose

**Layout Components**:
- Add to `src/components/layouts/`
- Examples: DashboardLayout, AuthLayout

#### 3. **Custom Hooks**
Add to `src/hooks/`:

```typescript
// src/hooks/useAuth.ts
export function useAuth() {
  // Your hook logic
}
```

#### 4. **TypeScript Types**
Add to `src/types/`:

```typescript
// src/types/user.ts
export interface User {
  id: string
  email: string
  name: string
}
```

---

## 🎨 Adding New Features

### Example: Adding a Settings Page

1. **Create the page:**
```
apps/web/src/app/(pages)/dashboard/settings/page.tsx
```

2. **Create any needed components:**
```
apps/web/src/components/features/SettingsForm.tsx
```

3. **Add navigation (if needed):**
Update `DashboardLayout.tsx` navigation array

### Example: Adding a New UI Component

1. **Install via shadcn CLI (recommended):**
```bash
npx shadcn-ui@latest add dialog
```

2. **Or create manually** following existing patterns in `src/components/ui/`

---

## 🧩 UI Components

### Available Components

| Component | Location | Description |
|-----------|----------|-------------|
| Button | `@/components/ui/button` | Button with variants |
| Input | `@/components/ui/input` | Form input field |
| Label | `@/components/ui/label` | Form label |
| Card | `@/components/ui/card` | Card container |

### Usage Example

```tsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function MyComponent() {
  return (
    <div>
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" />
      <Button>Submit</Button>
    </div>
  )
}
```

### Adding New shadcn Components

```bash
npx shadcn-ui@latest add [component-name]
```

Common components to consider:
- `dialog` - Modal dialogs
- `dropdown-menu` - Dropdown menus
- `toast` - Toast notifications
- `table` - Data tables
- `form` - Form components

---

## ✅ Best Practices

### Code Organization

1. **Keep components small and focused** - Single responsibility principle
2. **Use TypeScript** - Always define types for props and state
3. **Follow naming conventions**:
   - Components: PascalCase (`UserProfile`)
   - Files: kebab-case (`user-profile.tsx`)
   - Utilities: camelCase (`formatDate`)

### Styling

1. **Use Tailwind CSS** for styling
2. **Use the `cn` utility** for conditional classes:
```tsx
import { cn } from "@/lib/utils"

<div className={cn("base-class", isActive && "active-class")} />
```

3. **Use CSS variables** for theme colors (defined in `globals.css`)

### Component Patterns

1. **Use client components when needed:**
```tsx
"use client"

export function InteractiveComponent() {
  // Has state, effects, or event handlers
}
```

2. **Prefer server components** for data fetching and static content

3. **Extract complex logic to hooks:**
```tsx
// Good
function MyComponent() {
  const { data, loading } = useMyData()
  // ...
}
```

### File Organization

```
# Feature folder pattern (for larger features)
src/
├── features/
│   └── auth/
│       ├── components/
│       ├── hooks/
│       ├── types/
│       └── utils/
```

---

## 🔧 Configuration Files

### `tailwind.config.js`
- Customize theme colors, fonts, animations
- Add custom utility classes

### `tsconfig.json`
- TypeScript configuration
- Path aliases (`@/*` → `./src/*`)

### `next.config.js`
- Next.js configuration
- Environment variables, redirects, rewrites

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run linting: `npm run lint`
4. Test your changes
5. Submit a pull request

---

## 📞 Need Help?

- Check existing documentation
- Review example code in the codebase
- Ask team members for guidance
