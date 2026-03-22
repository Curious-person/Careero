"use client"

import { useState } from "react"
import DashboardLayout from "@/components/layouts/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Users,
    TrendingUp,
    Activity,
    Award,
    Plus,
    MessageSquare,
    Target,
    BarChart3,
    Star,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react"

interface StatCardProps {
    title: string
    value: string
    description: string
    icon: React.ElementType
    trend: string
    trendUp: boolean
}

function StatCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
    trendUp,
}: StatCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className={`font-medium ${trendUp ? "text-green-600" : "text-red-600"}`}>
                        {trend}
                    </span>
                    <span>{description}</span>
                </div>
            </CardContent>
        </Card>
    )
}

interface StudentPotentialProps {
    name: string
    skill: string
    potential: number
    activities: number
    engagement: string
}

function StudentPotentialCard({
    name,
    skill,
    potential,
    activities,
    engagement,
}: StudentPotentialProps) {
    const getEngagementColor = (level: string) => {
        switch (level) {
            case "High":
                return "bg-green-100 text-green-700"
            case "Medium":
                return "bg-blue-100 text-blue-700"
            case "Low":
                return "bg-yellow-100 text-yellow-700"
            default:
                return "bg-gray-100 text-gray-700"
        }
    }

    return (
        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="space-y-1 flex-1">
                <p className="text-sm font-medium">{name}</p>
                <p className="text-xs text-muted-foreground">{skill}</p>
                <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getEngagementColor(engagement)}`}>
                        {engagement} Engagement
                    </span>
                    <span className="text-xs text-muted-foreground">{activities} activities</span>
                </div>
            </div>
            <div className="text-right space-y-2">
                <p className="text-sm font-bold text-primary">{potential}%</p>
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${potential}%` }}
                    />
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
        <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2"
            asChild
        >
            <a href={href}>
                <Icon className="h-5 w-5" />
                <span className="text-xs">{title}</span>
            </a>
        </Button>
    )
}

interface ActivityFeedProps {
    student: string
    action: string
    skill: string
    time: string
    impact: string
}

function ActivityFeedItem({
    student,
    action,
    skill,
    time,
    impact,
}: ActivityFeedProps) {
    return (
        <div className="flex items-start justify-between gap-4 pb-4 border-b last:border-b-0">
            <div className="flex items-start gap-3 flex-1">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-primary">
                        {student
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                    </span>
                </div>
                <div className="space-y-1 flex-1">
                    <p className="text-sm">
                        <span className="font-medium">{student}</span>{" "}
                        <span className="text-muted-foreground">{action}</span>{" "}
                        <span className="font-medium">{skill}</span>
                    </p>
                    <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">{time}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            {impact}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function CompanyDashboardPage() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Company Dashboard</h1>
                        <p className="text-muted-foreground">
                            Track student potential and manage emerging talents
                        </p>
                    </div>
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Invite Student
                    </Button>
                </div>

                {/* Company Profile Section */}
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle>TechCorp Solutions</CardTitle>
                                <CardDescription>Software Development & AI Innovation</CardDescription>
                            </div>
                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Award className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div>
                                <p className="text-xs text-muted-foreground">Location</p>
                                <p className="text-sm font-medium">San Francisco, CA</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Industry</p>
                                <p className="text-sm font-medium">Technology & Software</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Established</p>
                                <p className="text-sm font-medium">2015</p>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Discover and mentor the next generation of tech talent. We connect with emerging
                            professionals and invest in their growth.
                        </p>
                    </CardContent>
                </Card>

                {/* Key Metrics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Students"
                        value="48"
                        description="15 new this month"
                        icon={Users}
                        trend="+45%"
                        trendUp={true}
                    />
                    <StatCard
                        title="Avg. Potential Score"
                        value="78%"
                        description="up from 72% last month"
                        icon={TrendingUp}
                        trend="+6%"
                        trendUp={true}
                    />
                    <StatCard
                        title="High Engagement"
                        value="32"
                        description="portfolio updates this week"
                        icon={Activity}
                        trend="+12%"
                        trendUp={true}
                    />
                    <StatCard
                        title="Ready to Hire"
                        value="8"
                        description="after skill assessments"
                        icon={Award}
                        trend="+3"
                        trendUp={true}
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Top Students by Potential */}
                    <div className="lg:col-span-2 space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Star className="h-4 w-4" />
                                    Top Students by Potential
                                </CardTitle>
                                <CardDescription>Based on recent activities and skill assessments</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <StudentPotentialCard
                                    name="Alex Rodriguez"
                                    skill="Full-Stack Development"
                                    potential={94}
                                    activities={18}
                                    engagement="High"
                                />
                                <StudentPotentialCard
                                    name="Sarah Chen"
                                    skill="Data Science & ML"
                                    potential={91}
                                    activities={15}
                                    engagement="High"
                                />
                                <StudentPotentialCard
                                    name="Marcus Johnson"
                                    skill="Cloud Infrastructure"
                                    potential={87}
                                    activities={12}
                                    engagement="High"
                                />
                                <StudentPotentialCard
                                    name="Emily Davis"
                                    skill="UX/UI Design"
                                    potential={82}
                                    activities={10}
                                    engagement="Medium"
                                />
                                <StudentPotentialCard
                                    name="James Wilson"
                                    skill="DevOps Engineering"
                                    potential={79}
                                    activities={8}
                                    engagement="Medium"
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-3">
                                    <QuickAction title="Applicants" icon={Users} href="/dashboard/company/applicants" />
                                    <QuickAction title="Team & Roles" icon={BarChart3} href="/dashboard/company/team" />
                                    <QuickAction title="Accumulations" icon={MessageSquare} href="/dashboard/company/accumulations" />
                                    <QuickAction title="Settings" icon={Target} href="/dashboard/company/settings" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Next Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Next Steps</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-start gap-3 pb-3 border-b last:border-b-0 last:pb-0">
                                    <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">Review 3 pending portfolios</p>
                                        <p className="text-xs text-muted-foreground">Due today</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 pb-3 border-b last:border-b-0 last:pb-0">
                                    <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">Schedule interviews</p>
                                        <p className="text-xs text-muted-foreground">5 students available</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">Update skill requirements</p>
                                        <p className="text-xs text-muted-foreground">For Q2 openings</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Recent Activity Feed */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Recent Student Activity
                        </CardTitle>
                        <CardDescription>Latest updates from your connected students</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ActivityFeedItem
                            student="Alex Rodriguez"
                            action="completed project"
                            skill="E-Commerce Platform"
                            time="30 minutes ago"
                            impact="Strong Portfolio"
                        />
                        <ActivityFeedItem
                            student="Sarah Chen"
                            action="completed certification"
                            skill="TensorFlow & Deep Learning"
                            time="2 hours ago"
                            impact="Skill Verified"
                        />
                        <ActivityFeedItem
                            student="Marcus Johnson"
                            action="updated profile"
                            skill="AWS Solutions Architect"
                            time="5 hours ago"
                            impact="Profile Improved"
                        />
                        <ActivityFeedItem
                            student="Emily Davis"
                            action="participated in"
                            skill="Design System Workshop"
                            time="1 day ago"
                            impact="Knowledge Gained"
                        />
                        <ActivityFeedItem
                            student="James Wilson"
                            action="earned badge"
                            skill="DevOps Best Practices"
                            time="2 days ago"
                            impact="Certified"
                        />
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
