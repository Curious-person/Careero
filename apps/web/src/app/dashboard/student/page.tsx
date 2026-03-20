import DashboardLayout from "@/components/layouts/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, Plus, TrendingUp, Users, FileText, CheckCircle } from "lucide-react"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page header */}
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

        {/* Stats cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Projects"
            value="12"
            description="2 new this month"
            icon={FileText}
            trend="+20%"
            trendUp={true}
          />
          <StatCard
            title="Active Tasks"
            value="48"
            description="8 completed today"
            icon={CheckCircle}
            trend="+12%"
            trendUp={true}
          />
          <StatCard
            title="Team Members"
            value="24"
            description="3 new this week"
            icon={Users}
            trend="+15%"
            trendUp={true}
          />
          <StatCard
            title="Productivity"
            value="94%"
            description="Above average"
            icon={TrendingUp}
            trend="+5%"
            trendUp={true}
          />
        </div>

        {/* Recent projects and activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Projects */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>Your latest projects and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ProjectItem
                  name="Website Redesign"
                  status="In Progress"
                  progress={75}
                  team={3}
                />
                <ProjectItem
                  name="Mobile App Development"
                  status="In Progress"
                  progress={45}
                  team={5}
                />
                <ProjectItem
                  name="Marketing Campaign"
                  status="Completed"
                  progress={100}
                  team={2}
                />
                <ProjectItem
                  name="API Integration"
                  status="On Hold"
                  progress={30}
                  team={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates from your team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ActivityItem
                  user="Sarah Johnson"
                  action="completed task"
                  target="Homepage Design"
                  time="2 hours ago"
                />
                <ActivityItem
                  user="Michael Chen"
                  action="commented on"
                  target="API Documentation"
                  time="4 hours ago"
                />
                <ActivityItem
                  user="Emily Rodriguez"
                  action="created project"
                  target="Q4 Marketing"
                  time="Yesterday"
                />
                <ActivityItem
                  user="David Kim"
                  action="uploaded files to"
                  target="Brand Assets"
                  time="2 days ago"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get you started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <QuickAction
                title="Create Project"
                icon={Plus}
                href="/dashboard/projects/new"
              />
              <QuickAction
                title="Invite Team"
                icon={Users}
                href="/dashboard/team/invite"
              />
              <QuickAction
                title="View Reports"
                icon={TrendingUp}
                href="/dashboard/reports"
              />
              <QuickAction
                title="Settings"
                icon={ArrowUpRight}
                href="/dashboard/settings"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

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
