# Careero Design System

This document outlines the design principles, components, and styling guidelines for the Careero application. All new components and pages should follow these patterns to ensure visual and functional consistency.

---

## Table of Contents

- [Design Principles](#design-principles)
- [Color Palette](#color-palette)
- [Typography](#typography)
- [Spacing & Layout](#spacing--layout)
- [Border Radius](#border-radius)
- [Components](#components)
- [Animation Guidelines](#animation-guidelines)
- [Code Conventions](#code-conventions)

---

## Design Principles

1. **Clean & Modern** - Minimalist aesthetic with generous whitespace
2. **Bold Typography** - Large, confident headings with clear hierarchy
3. **Rounded & Friendly** - Soft, rounded corners throughout (no sharp edges)
4. **Subtle Depth** - Light shadows and borders for layering
5. **Smooth Motion** - Purposeful animations that enhance UX

---

## Color Palette

### Brand Colors

| Color | Token | Hex | Usage |
|-------|-------|-----|-------|
| Blue | `text-brand-blue` | `#007AFF` | Primary actions, links, accents |
| Green | `text-brand-green` | `#34C759` | Success states, positive indicators |
| Orange | `text-brand-orange` | `#FF9500` | Highlights, badges, attention |
| Purple | `text-brand-purple` | `#AF52DE` | Secondary accents |

### Neutral Colors

| Color | Class | Usage |
|-------|-------|-------|
| Black | `text-black`, `bg-black` | Primary buttons, headings, icons |
| White | `text-white`, `bg-white` | Backgrounds, text on dark |
| Gray 400 | `text-gray-400` | Muted text, placeholders |
| Gray 500 | `text-gray-500` | Secondary text, descriptions |
| Gray 100 | `bg-gray-100` | Light backgrounds, cards |

### CSS Variables (Theming)

The app uses CSS custom properties for theme support (light/dark mode):

```css
/* Light mode */
--background: 0 0% 100%;
--foreground: 222.2 84% 4.9%;
--primary: 221.2 83.2% 53.3%;

/* Dark mode */
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
}
```

Usage: `bg-background`, `text-foreground`, `bg-primary`, etc.

---

## Typography

### Font Families

```js
// tailwind.config.js
fontFamily: {
  sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
  display: ["Outfit", "sans-serif"],
}
```

### Font Weights

| Weight | Class | Usage |
|--------|-------|-------|
| 400 | `font-normal` | Body text, descriptions |
| 500 | `font-medium` | Secondary text, labels |
| 600 | `font-semibold` | Subheadings |
| 700 | `font-bold` | Headings, buttons |
| 800 | `font-black` | Hero headings |

### Type Scale

| Element | Size | Weight | Example |
|---------|------|--------|---------|
| Hero | `text-5xl md:text-7xl lg:text-8xl` | `font-black` | Main landing headlines |
| H1 | `text-4xl md:text-5xl` | `font-bold` | Section titles |
| H2 | `text-2xl` | `font-bold` | Card titles |
| H3 | `text-xl` | `font-bold` | Subsections |
| Body | `text-base` | `font-normal` | Default text |
| Small | `text-sm` | `font-medium` | Labels, captions |
| Tiny | `text-xs` | `font-bold` | Badges, tags |

### Letter Spacing

```tsx
// Uppercase tracking (for badges/labels)
<span className="text-xs font-bold uppercase tracking-widest">
  Your Career, Reimagined
</span>

// Tight tracking (for display headings)
<h1 className="tracking-tight">
  The career platform for the next generation.
</h1>
```

---

## Spacing & Layout

### Container

```js
container: {
  center: true,
  padding: "2rem",
  screens: {
    "2xl": "1400px",
  },
}
```

### Section Spacing

| Section Type | Padding |
|--------------|---------|
| Hero | `pt-40 pb-20` |
| Standard | `py-24` or `py-32` |
| Compact | `py-12` |

### Grid Gaps

```tsx
// Standard grid gaps
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"

// Card internal spacing
className="p-6"  // Small cards
className="p-8"  // Standard cards
className="p-12" // Large sections
```

---

## Border Radius

| Radius | Class | Usage |
|--------|-------|-------|
| Full | `rounded-full` | Buttons, avatars, badges |
| 3xl | `rounded-[48px]` | Hero CTAs, large containers |
| 3xl | `rounded-[32px]` | Cards, images |
| 2xl | `rounded-[24px]` | Small cards, icons |
| xl | `rounded-xl` | Internal card elements |
| lg | `rounded-lg` | Icon backgrounds |
| md | `rounded-md` | Form inputs |
| sm | `rounded-sm` | Minimal elements |

---

## Components

### Button

**File:** `src/components/ui/button.tsx`

```tsx
import { Button } from '@/components/ui/button';

// Primary (default)
<Button>Get Started</Button>

// Black button (common in landing)
<Button className="bg-black text-white hover:bg-gray-800 rounded-full">
  Join Careero
</Button>

// Outline
<Button variant="outline" className="rounded-full border-gray-200">
  Explore Features
</Button>

// Ghost
<Button variant="ghost" className="rounded-full">Log in</Button>

// Sizes
<Button size="lg" className="h-14 px-8 text-lg">Large</Button>
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
```

**Key Patterns:**
- Always `rounded-full` for landing pages
- Large buttons: `h-14 px-8 text-lg`
- Icon transitions: `group-hover:translate-x-1`

---

### Card

**File:** `src/components/ui/card.tsx`

```tsx
// Glass card pattern (most common)
<div className="glass-card p-8">
  {/* content */}
</div>

// Glass card utility (defined in globals.css)
.glass-card {
  @apply bg-[#F9F9F9] border border-[#EEEEEE] rounded-[32px];
}

// Colored accent card
<div className="glass-card bg-brand-blue/5 border-brand-blue/10">
  {/* content */}
</div>

// Dark card
<div className="glass-card bg-black text-white">
  {/* content */}
</div>
```

---

### Navbar

**File:** `src/components/features/landing/Navbar.tsx`

```tsx
import { Navbar } from '@/components/features/landing/Navbar';

// Usage
<Navbar />
```

**Key Features:**
- Scroll-aware background (`isScrolled` state)
- Transparent → `bg-white/80 backdrop-blur-md`
- Mobile menu with Framer Motion animations
- Logo: `Rocket` icon in black rounded square

---

### Hero

**File:** `src/components/features/landing/Hero.tsx`

```tsx
import { Hero } from '@/components/features/landing/Hero';

// Usage
<Hero />
```

**Key Patterns:**
- Badge: `px-3 py-1 rounded-full bg-gray-100 text-xs font-bold uppercase tracking-widest`
- Heading: `text-5xl md:text-7xl lg:text-8xl font-black tracking-tight`
- Subtitle: `text-xl text-gray-500 max-w-2xl mx-auto`
- Floating icons with `framer-motion`

---

### Mockup Section

**File:** `src/components/features/landing/MockupSection.tsx`

```tsx
import { MockupSection } from '@/components/features/landing/MockupSection';

<MockupSection
  title="Level up your skills, every single day."
  subtitle="Track Progress"
  description="Our interactive dashboard gives you a bird's eye view..."
  color="text-brand-blue"
  reverse={false} // optional
/>
```

**Key Features:**
- iPhone frame mockup with `iphone-frame` utility
- Color-matched glow effect
- Alternating layout with `reverse` prop

---

### Footer

**File:** `src/components/features/landing/Footer.tsx`

```tsx
import { Footer } from '@/components/features/landing/Footer';

// Usage
<Footer />
```

---

## Animation Guidelines

### Framer Motion Setup

```tsx
import { motion } from 'framer-motion';

// Fade up animation
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  {/* content */}
</motion.div>

// Scale animation (CTA)
<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  whileInView={{ opacity: 1, scale: 1 }}
  viewport={{ once: true }}
>
  {/* content */}
</motion.div>

// Hover lift
<motion.div whileHover={{ y: -8 }}>
  {/* content */}
</motion.div>
```

### Animation Patterns

| Type | Pattern | Usage |
|------|---------|-------|
| Fade In | `opacity: 0, y: 20` → `opacity: 1, y: 0` | Text, sections |
| Scale In | `scale: 0.9` → `scale: 1` | CTAs, modals |
| Hover Lift | `whileHover={{ y: -8 }}` | Cards, links |
| Floating | `y: [y, y-20, y]` | Decorative icons |
| Pulse | `animate-pulse` | Loading states |

### Transition Defaults

```tsx
transition={{ duration: 0.5, delay: 0.1 }}
viewport={{ once: true }} // Trigger once on scroll
```

---

## Code Conventions

### Component Structure

```tsx
"use client"; // If using hooks or interactivity

import React from 'react';
import { motion } from 'framer-motion';
import { IconName } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ComponentProps {
  title: string;
  description?: string;
  className?: string;
}

export const Component = ({ title, description, className }: ComponentProps) => {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        {/* content */}
      </div>
    </section>
  );
};
```

### Utility Function

Always use `cn()` for conditional classes:

```tsx
import { cn } from '@/lib/utils';

className={cn(
  "base-class",
  isActive && "active-class",
  variant === 'blue' && "text-brand-blue",
  className
)}
```

### Icon Usage

```tsx
import { ArrowRight } from 'lucide-react';

// Standard icon
<ArrowRight className="w-5 h-5" />

// Icon in circle
<div className="w-12 h-12 bg-brand-blue rounded-2xl flex items-center justify-center">
  <ArrowRight className="text-white w-6 h-6" />
</div>

// Animated icon
<ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
```

### Link Patterns

```tsx
import Link from 'next/link';

// Internal navigation
<Link href="/dashboard">
  <Button>Get Started</Button>
</Link>

// Anchor links
<Link href="#features">Features</Link>

// With icon
<Link href="#features" className="flex items-center gap-2 font-bold hover:gap-3 transition-all">
  Learn more <ChevronRight className="w-5 h-5" />
</Link>
```

### Image Handling

```tsx
// Blog/card images with rounded corners
<div className="aspect-[4/3] bg-gray-100 rounded-[32px] overflow-hidden">
  <img
    src="https://picsum.photos/seed/example/800/600"
    alt="Description"
    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
    referrerPolicy="no-referrer"
  />
</div>
```

---

## Common Patterns

### Section Heading

```tsx
<div className="mb-16 text-center">
  <h2 className="text-4xl md:text-5xl font-bold mb-4">
    Your heading here
  </h2>
  <p className="text-gray-500 max-w-xl mx-auto">
    Optional description
  </p>
</div>
```

### Badge/Label

```tsx
<span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-xs font-bold uppercase tracking-widest text-gray-500 mb-6 border border-gray-200 shadow-sm">
  <Sparkles className="w-3 h-3 text-brand-orange" />
  Your Career, Reimagined
</span>
```

### CTA Section

```tsx
<section className="py-32 bg-white text-center px-6">
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    className="max-w-4xl mx-auto bg-black text-white rounded-[48px] p-12 md:p-24 relative overflow-hidden"
  >
    <div className="absolute top-0 left-0 w-full h-full bg-dot-pattern opacity-10" />
    <div className="relative z-10">
      <h2 className="text-4xl md:text-6xl font-bold mb-8">Ready to start?</h2>
      <Link href="/dashboard">
        <button className="bg-white text-black px-10 py-5 rounded-full text-xl font-bold hover:bg-gray-100 transition-all active:scale-95">
          Join for Free
        </button>
      </Link>
    </div>
  </motion.div>
</section>
```

### Grid Layout

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map((item, i) => (
    <div key={i} className="glass-card p-8">
      {/* card content */}
    </div>
  ))}
</div>
```

---

## Libraries & Dependencies

| Library | Version | Purpose |
|---------|---------|---------|
| `framer-motion` | `^12.38.0` | Animations |
| `lucide-react` | `^0.400.0` | Icons |
| `@radix-ui/*` | Latest | Headless UI primitives |
| `class-variance-authority` | `^0.7.0` | Variant-based classes |
| `tailwind-merge` | `^2.4.0` | Class merging utility |
| `clsx` | `^2.1.1` | Conditional classes |

---

## File Structure

```
src/
├── app/
│   ├── (pages)/
│   │   └── landing/
│   │       └── page.tsx
│   └── globals.css
├── components/
│   ├── features/
│   │   └── landing/
│   │       ├── Navbar.tsx
│   │       ├── Hero.tsx
│   │       ├── FeatureGrid.tsx
│   │       ├── MockupSection.tsx
│   │       ├── BlogSection.tsx
│   │       ├── DetailsSection.tsx
│   │       └── Footer.tsx
│   └── ui/
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── label.tsx
└── lib/
    └── utils.ts
```

---

## Quick Reference

### Most Common Classes

```tsx
// Buttons
className="rounded-full bg-black text-white hover:bg-gray-800"
className="rounded-full border border-gray-200"

// Cards
className="glass-card p-8" // bg-[#F9F9F9] border border-[#EEEEEE] rounded-[32px]

// Text
className="text-4xl md:text-5xl font-bold" // Heading
className="text-xl text-gray-500" // Subtitle
className="text-xs font-bold uppercase tracking-widest" // Badge

// Layout
className="container mx-auto px-6"
className="max-w-7xl mx-auto"
className="flex items-center justify-between"

// Animations
className="group-hover:translate-x-1 transition-transform"
className="hover:gap-3 transition-all"
```

---

## Contributing

When adding new components:

1. Follow existing component patterns
2. Use `cn()` for class merging
3. Support dark mode via CSS variables
4. Use `framer-motion` for animations
5. Use `lucide-react` for icons
6. Test responsive behavior (mobile-first)
7. Update this document with new patterns

---

**Last Updated:** March 20, 2026
**Maintained By:** Careero Design Team
