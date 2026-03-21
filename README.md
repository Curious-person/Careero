# Careero

A modern web application built with Next.js 14, React, TypeScript, Tailwind CSS, and shadcn/ui.

## 🚀 Quick Start

```bash
# Install dependencies for both apps
npm install

# Run development servers for both apps
npm run dev

# Or run individually
npm run dev --workspace=apps/web
npm run dev --workspace=apps/api
```

Open [http://localhost:3000](http://localhost:3000)

## 📚 Documentation

See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed development guidelines.

## 🛠 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Icons:** Lucide React

## 📁 Project Structure

```
apps/
├── api/             # Express.js API backend
│   ├── src/
│   │   ├── config/  # Environment config
│   │   ├── controllers/ # Route controllers
│   │   ├── middlewares/ # Express middlewares
│   │   ├── models/  # Database models
│   │   ├── routes/  # API routes
│   │   └── services/# Business logic
├── web/             # Next.js App Router frontend
│   ├── src/
│   │   ├── app/     # Pages & Routes
│   │   ├── components/ # React components
│   │   ├── lib/     # Utilities
│   │   ├── hooks/   # Custom hooks
│   │   └── types/   # TypeScript types
```

## 📄 Pages

- **Landing:** `/landing` - Marketing/landing page
- **Login:** `/login` - Authentication page
- **Dashboard:** `/dashboard` - Main application dashboard
