# Student Dashboard Component Documentation

This document outlines the components, styling patterns, colors, and spacing used in the **Student Dashboard** (`src/app/(pages)/dashboard/page.tsx`). This serves as the reference for building consistent dashboard pages within the student-facing application.

---

## Table of Contents

- [Overview](#overview)
- [Layout Structure](#layout-structure)
- [Components](#components)
- [Color System](#color-system)
- [Spacing System](#spacing-system)
- [Typography](#typography)
- [Code Patterns](#code-patterns)

---

## Overview

The student dashboard follows a **card-based layout** with:
- Collapsible sidebar navigation (via `DashboardLayout`)
- Stats overview with trend indicators
- Project tracking with progress bars
- Activity feed
- Quick action buttons

**Key Libraries:**
- `lucide-react` - Icons
- `framer-motion` - Animations (from DashboardLayout)
- `shadcn/ui` - Base components (Card, Button)

---

## Layout Structure

```tsx
import DashboardLayout from "@/components/layouts/DashboardLayout"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page content */}
      </div>
    </DashboardLayout>
  )
}
```

### Page Wrapper

| Element | Class | Purpose |
|---------|-------|---------|
| Main container | `space-y-6` | Vertical spacing between sections |
| Section gap | `gap-4`, `gap-6` | Grid gaps |

---

## Components

### 1. Page Header

```tsx
<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
  <div>
    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
    <p className="text-muted-foreground">
      Welcome back! Here&apos;s an overview of your projects.
    </p>
  </div>
  <Button className="gap-2">
    <Plus className="h-4 w-4" />
    New Project
  </Button>
</div>
```

**Structure:**
- Title: `text-3xl font-bold tracking-tight`
- Subtitle: `text-muted-foreground`
- Action button: Right-aligned on desktop

---

### 2. Stat Card

**File:** Inline component in page

```tsx
function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendUp,
}: {
  title: string
  value: string
  description: string
  icon: React.ElementType
  trend: string
  trendUp: boolean
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="text-green-600 font-medium">{trend}</span>
          <span>{description}</span>
        </div>
      </CardContent>
    </Card>
  )
}
```

**Usage:**
```tsx
<StatCard
  title="Total Projects"
  value="12"
  description="2 new this month"
  icon={FileText}
  trend="+20%"
  trendUp={true}
/>
```

**Grid Layout:**
```tsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  {/* 4 stat cards */}
</div>
```

---

### 3. Project Item

**File:** Inline component in page

```tsx
function ProjectItem({
  name,
  status,
  progress,
  team,
}: {
  name: string
  status: string
  progress: number
  team: number
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-700"
      case "In Progress": return "bg-blue-100 text-blue-700"
      case "On Hold": return "bg-yellow-100 text-yellow-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-sm font-medium">{name}</p>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(status)}`}>
            {status}
          </span>
          <span className="text-xs text-muted-foreground">{team} members</span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium">{progress}%</p>
        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
```

**Usage:**
```tsx
<ProjectItem
  name="Website Redesign"
  status="In Progress"
  progress={75}
  team={3}
/>
```

---

### 4. Activity Item

```tsx
function ActivityItem({
  user,
  action,
  target,
  time,
}: {
  user: string
  action: string
  target: string
  time: string
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-medium text-primary">
            {user.split(" ").map(n => n[0]).join("")}
          </span>
        </div>
        <div>
          <p className="text-sm">
            <span className="font-medium">{user}</span>{" "}
            <span className="text-muted-foreground">{action}</span>{" "}
            <span className="font-medium">{target}</span>
          </p>
          <p className="text-xs text-muted-foreground">{time}</p>
        </div>
      </div>
    </div>
  )
}
```

**Usage:**
```tsx
<ActivityItem
  user="Sarah Johnson"
  action="completed task"
  target="Homepage Design"
  time="2 hours ago"
/>
```

---

### 5. Quick Action Button

```tsx
function QuickAction({
  title,
  icon: Icon,
  href,
}: {
  title: string
  icon: React.ElementType
  href: string
}) {
  return (
    <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" asChild>
      <a href={href}>
        <Icon className="h-5 w-5" />
        <span className="text-xs">{title}</span>
      </a>
    </Button>
  )
}
```

**Usage:**
```tsx
<QuickAction
  title="Create Project"
  icon={Plus}
  href="/dashboard/projects/new"
/>
```

**Grid Layout:**
```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  {/* 4 quick actions */}
</div>
```

---

## Color System

### Status Colors (Project Item)

| Status | Background | Text | Usage |
|--------|------------|------|-------|
| Completed | `bg-green-100` | `text-green-700` | Finished projects |
| In Progress | `bg-blue-100` | `text-blue-700` | Active projects |
| On Hold | `bg-yellow-100` | `text-yellow-700` | Paused projects |
| Default | `bg-gray-100` | `text-gray-700` | Unknown status |

### Trend Colors

| Type | Class | Usage |
|------|-------|-------|
| Positive trend | `text-green-600` | Growth, improvement |
| Negative trend | `text-red-600` | Decline (not shown, but pattern exists) |

### Semantic Colors

| Class | Usage |
|-------|-------|
| `text-muted-foreground` | Secondary text, descriptions |
| `bg-primary/10` | Avatar backgrounds, subtle accents |
| `text-primary` | Primary text on muted backgrounds |
| `bg-muted` | Progress bar backgrounds |

### Brand Colors (from tailwind.config.js)

```js
colors: {
  brand: {
    blue: "#007AFF",
    green: "#34C759",
    orange: "#FF9500",
    purple: "#AF52DE",
  }
}
```

---

## Spacing System

### Vertical Spacing

| Element | Class | Value |
|---------|-------|-------|
| Section gap | `space-y-6` | 1.5rem (24px) |
| Card gap | `gap-6` | 1.5rem (24px) |
| Stats gap | `gap-4` | 1rem (16px) |
| List item gap | `space-y-4` | 1rem (16px) |
| Quick actions gap | `gap-4` | 1rem (16px) |

### Padding

| Element | Class | Value |
|---------|-------|-------|
| Card header | `CardHeader` (default) | ~1.5rem |
| Card content | `CardContent` (default) | ~1.5rem |
| Status badge | `px-2 py-0.5` | 0.5rem x 0.125rem |
| Quick action | `py-4` | 1rem |

### Icon Sizes

| Context | Size | Class |
|---------|------|-------|
| Stat card icon | 16x16 | `h-4 w-4` |
| Button icon | 16x16 | `h-4 w-4` |
| Quick action icon | 20x20 | `h-5 w-5` |
| Avatar | 32x32 | `h-8 w-8` |

---

## Typography

### Font Scale

| Element | Size | Weight | Class |
|---------|------|--------|-------|
| Page title | `text-3xl` | `font-bold` | `tracking-tight` |
| Card title | `text-sm` | `font-medium` | - |
| Stat value | `text-2xl` | `font-bold` | - |
| Stat label | `text-sm` | `font-medium` | - |
| Project name | `text-sm` | `font-medium` | - |
| Activity text | `text-sm` | `font-medium` (names/targets) | - |
| Description | `text-xs` | - | `text-muted-foreground` |
| Status badge | `text-xs` | - | - |
| Quick action label | `text-xs` | - | - |

### Text Colors

| Class | Usage |
|-------|-------|
| `text-foreground` (default) | Primary text |
| `text-muted-foreground` | Secondary text, descriptions |
| `text-green-600` | Positive trends |
| Status-specific colors | Badges |

---

## Code Patterns

### Status Color Helper

```tsx
const getStatusColor = (status: string) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-700"
    case "In Progress":
      return "bg-blue-100 text-blue-700"
    case "On Hold":
      return "bg-yellow-100 text-yellow-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}
```

### Progress Bar

```tsx
<div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
  <div
    className="h-full bg-primary transition-all"
    style={{ width: `${progress}%` }}
  />
</div>
```

### User Avatar (Initials)

```tsx
<div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
  <span className="text-xs font-medium text-primary">
    {user.split(" ").map(n => n[0]).join("")}
  </span>
</div>
```

### Responsive Header

```tsx
<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
  {/* Title on left, button on right (desktop) */}
</div>
```

### Grid Responsiveness

```tsx
// Stats: 1 col mobile → 2 cols tablet → 4 cols desktop
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

// Content cards: 1 col mobile → 2 cols desktop
<div className="grid gap-6 lg:grid-cols-2">

// Quick actions: 2 cols mobile → 4 cols desktop
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
```

---

## Component Imports

```tsx
import DashboardLayout from "@/components/layouts/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, Plus, TrendingUp, Users, FileText, CheckCircle } from "lucide-react"
```

---

## shadcn/ui Components Used

### Card

```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* content */}
  </CardContent>
</Card>
```

### Button

```tsx
import { Button } from "@/components/ui/button"

// Default
<Button className="gap-2">
  <Plus className="h-4 w-4" />
  New Project
</Button>

// Outline
<Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" asChild>
  <a href={href}>...</a>
</Button>
```

---

## Quick Reference

### Most Common Classes

```tsx
// Page structure
className="space-y-6" // Main container vertical spacing

// Header
className="text-3xl font-bold tracking-tight" // Page title
className="text-muted-foreground" // Subtitle

// Cards
className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" // Stats grid
className="grid gap-6 lg:grid-cols-2" // Content grid

// Status badges
className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700"

// Progress bar
className="w-24 h-2 bg-muted rounded-full overflow-hidden"

// Avatar
className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center"

// Icons
className="h-4 w-4 text-muted-foreground" // Standard
className="h-5 w-5" // Quick actions
```

---

## File Structure

```
src/
├── app/
│   └── (pages)/
│       └── dashboard/
│           └── page.tsx          # Main dashboard page
├── components/
│   ├── layouts/
│   │   └── DashboardLayout.tsx   # Sidebar layout wrapper
│   └── ui/
│       ├── card.tsx              # Card components
│       └── button.tsx            # Button component
└── lib/
    └── utils.ts                  # cn() utility
```

---

## Best Practices

1. **Use `space-y-6`** for main vertical rhythm
2. **Keep stat cards simple** - title, value, description, trend
3. **Status badges** use consistent color mapping
4. **Progress bars** are 24px wide (`w-24`), 2px tall (`h-2`)
5. **Avatar initials** use `bg-primary/10` with `text-primary`
6. **Quick actions** use `variant="outline"` with vertical layout
7. **Responsive grids** follow: mobile (1-2 cols) → tablet (2 cols) → desktop (4 cols)

---

**Last Updated:** March 20, 2026
**Maintained By:** Careero Design Team
