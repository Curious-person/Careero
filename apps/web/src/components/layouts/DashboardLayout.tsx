"use client"

import { Button } from "@/components/ui/button"
import { logoutSession } from "@/lib/apiClient"
import {
  Bell,
  Briefcase,
  Building,
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

interface UserInfo {
  email: string
  name?: string
}

interface NavItem {
  name: string
  href?: string
  icon: React.ElementType
  onClick?: () => void
  active?: boolean
}

interface DashboardLayoutProps {
  children: React.ReactNode
  navigation?: NavItem[]
  user?: UserInfo | null
}

export default function DashboardLayout({ children, navigation: navProp, user }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const defaultNavigation: NavItem[] = [
    { name: "Dashboard", href: "/dashboard/company", icon: LayoutDashboard },
    { name: "Applicants", href: "/dashboard/company/applicants", icon: Briefcase },
    { name: "Team & Roles", href: "/dashboard/company/team", icon: Users },
    { name: "Accumulations", href: "/dashboard/company/accumulations", icon: FileText },
    { name: "Company Profile", href: "/dashboard/company/profile", icon: Building },
  ]

  const navigation = navProp ?? defaultNavigation

  // Get user initials for avatar
  const getUserInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    if (email) {
      return email.split('@')[0].slice(0, 2).toUpperCase()
    }
    return 'JD'
  }

  const displayName = user?.name || user?.email?.split('@')[0] || 'User'
  const displayEmail = user?.email || 'user@example.com'
  const userInitials = getUserInitials(user?.name, user?.email)

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen bg-background border-r
        transform transition-all duration-300 ease-in-out
        lg:translate-x-0 no-print
        ${sidebarCollapsed ? "w-20" : "w-64"}
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b">
            {!sidebarCollapsed && (
              <Link href="/" className="text-xl font-bold text-primary">
                Careero
              </Link>
            )}
            <div className="flex items-center gap-2">
              {/* Collapse toggle - desktop only */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                className="hidden lg:flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </button>
              {/* Close button - mobile only */}
              <button
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
                className="lg:hidden text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = item.active ?? (item.href ? pathname === item.href : false)
              const className = `
                flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium
                transition-colors
                ${isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }
              `
              // Only show icon when sidebarCollapsed
              return item.onClick ? (
                <button type="button" key={item.name} onClick={item.onClick} className={`w-full ${className}`}>
                  <item.icon className="h-5 w-5" />
                  {!sidebarCollapsed && item.name}
                </button>
              ) : (
                <Link key={item.name} href={item.href!} className={className}>
                  <item.icon className="h-5 w-5" />
                  {!sidebarCollapsed && item.name}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t">
            <div className={`flex items-center gap-3 mb-4 ${sidebarCollapsed ? "justify-center" : ""}`}>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-primary">{userInitials}</span>
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              className={`w-full justify-start gap-2 ${sidebarCollapsed ? "justify-center px-2" : ""}`}
              onClick={logoutSession}
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              {!sidebarCollapsed && <span>Sign Out</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={`transition-all duration-300 ease-in-out ${sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"}`}>
        {/* Top header */}
        <header className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur border-b no-print">
          <div className="flex items-center justify-between h-full px-4">
            <button
              type="button"
              aria-label="Open sidebar"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-muted-foreground hover:text-foreground"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <Button type="button" variant="ghost" size="icon" aria-label="Notifications" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
