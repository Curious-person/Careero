"use client"

import { useState } from "react"
import DashboardLayout from "@/components/layouts/DashboardLayout"
import AccumulationCard from "@/components/features/accumulations/AccumulationCard"
import ActivityForm from "@/components/features/accumulations/ActivityForm"
import StudentManagementModal from "@/components/features/accumulations/StudentManagementModal"
import { Activity, ActivityFormData, Student } from "@/types/activity"
import { Calendar, Plus, Users, TrendingUp } from "lucide-react"

// Mock data - replace with actual API calls
const initialActivities: Activity[] = [
    {
        id: "1",
        title: "AI & Machine Learning Hackathon",
        description: "A 24-hour hackathon focused on building AI-powered solutions for real-world problems. Teams will work on projects using cutting-edge ML frameworks.",
        type: "hackathon",
        date: "2026-04-15",
        time: "09:00",
        location: "Innovation Lab, Building A",
        maxStudents: 50,
        currentStudents: 32,
        status: "upcoming",
        createdAt: "2026-03-01",
    },
    {
        id: "2",
        title: "Tech Startup Meetup",
        description: "Network with fellow entrepreneurs and tech enthusiasts. Share ideas, find co-founders, and learn from successful startup founders.",
        type: "meetup",
        date: "2026-03-28",
        time: "18:00",
        location: "Co-working Space, Floor 3",
        maxStudents: 30,
        currentStudents: 28,
        status: "upcoming",
        createdAt: "2026-03-05",
    },
    {
        id: "3",
        title: "Web Development Workshop",
        description: "Hands-on workshop covering modern web development with React, Next.js, and TypeScript. Build a complete project from scratch.",
        type: "workshop",
        date: "2026-03-25",
        time: "14:00",
        location: "Computer Lab 201",
        maxStudents: 25,
        currentStudents: 25,
        status: "ongoing",
        createdAt: "2026-02-20",
    },
    {
        id: "4",
        title: "Career Development Seminar",
        description: "Learn about industry trends, resume building, and interview techniques from HR professionals and tech recruiters.",
        type: "seminar",
        date: "2026-04-05",
        time: "10:00",
        location: "Auditorium, Main Building",
        maxStudents: 100,
        currentStudents: 67,
        status: "upcoming",
        createdAt: "2026-03-10",
    },
]

const initialStudents: Record<string, Student[]> = {
    "1": [
        {
            id: "s1",
            name: "Sarah Johnson",
            email: "sarah.j@university.edu",
            studentId: "2024-00123",
            program: "Computer Science",
            year: 3,
            enrolledAt: "2026-03-02",
            status: "confirmed",
        },
        {
            id: "s2",
            name: "Michael Chen",
            email: "m.chen@university.edu",
            studentId: "2024-00456",
            program: "Software Engineering",
            year: 2,
            enrolledAt: "2026-03-03",
            status: "registered",
        },
        {
            id: "s3",
            name: "Emily Rodriguez",
            email: "emily.r@university.edu",
            studentId: "2024-00789",
            program: "Data Science",
            year: 4,
            enrolledAt: "2026-03-04",
            status: "confirmed",
        },
    ],
    "2": [
        {
            id: "s4",
            name: "James Kim",
            email: "j.kim@university.edu",
            studentId: "2024-01012",
            program: "Business Administration",
            year: 3,
            enrolledAt: "2026-03-06",
            status: "confirmed",
        },
    ],
    "3": [
        {
            id: "s5",
            name: "Anna Martinez",
            email: "anna.m@university.edu",
            studentId: "2024-01345",
            program: "Computer Science",
            year: 2,
            enrolledAt: "2026-02-21",
            status: "attended",
        },
    ],
    "4": [],
}

export default function AccumulationsPage() {
    const [activities, setActivities] = useState<Activity[]>(initialActivities)
    const [students, setStudents] = useState<Record<string, Student[]>>(initialStudents)
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingActivity, setEditingActivity] = useState<Activity | undefined>(undefined)

    const totalStudents = activities.reduce((sum, act) => sum + act.currentStudents, 0)
    const totalActivities = activities.length
    const upcomingActivities = activities.filter(a => a.status === 'upcoming').length

    const handleCreateActivity = (data: ActivityFormData) => {
        const newActivity: Activity = {
            id: Date.now().toString(),
            ...data,
            currentStudents: 0,
            status: 'upcoming',
            createdAt: new Date().toISOString().split('T')[0],
        }
        setActivities(prev => [newActivity, ...prev])
        setStudents(prev => ({ ...prev, [newActivity.id]: [] }))
    }

    const handleUpdateActivity = (data: ActivityFormData) => {
        if (!editingActivity) return
        setActivities(prev => prev.map(act =>
            act.id === editingActivity.id
                ? { ...act, ...data }
                : act
        ))
        setEditingActivity(undefined)
    }

    const handleEditActivity = (activity: Activity) => {
        setEditingActivity(activity)
        setIsFormOpen(true)
    }

    const handleDeleteActivity = (activity: Activity) => {
        if (confirm(`Are you sure you want to delete "${activity.title}"?`)) {
            setActivities(prev => prev.filter(a => a.id !== activity.id))
            setStudents(prev => {
                const updated = { ...prev }
                delete updated[activity.id]
                return updated
            })
        }
    }

    const handleViewStudents = (activity: Activity) => {
        setSelectedActivity(activity)
        setIsStudentModalOpen(true)
    }

    const handleAddStudent = (studentData: Omit<Student, 'id' | 'enrolledAt' | 'status'>) => {
        if (!selectedActivity) return
        const newStudent: Student = {
            ...studentData,
            id: Date.now().toString(),
            enrolledAt: new Date().toISOString().split('T')[0],
            status: 'registered',
        }
        setStudents(prev => ({
            ...prev,
            [selectedActivity.id]: [...(prev[selectedActivity.id] || []), newStudent],
        }))
        setActivities(prev => prev.map(act =>
            act.id === selectedActivity.id
                ? { ...act, currentStudents: act.currentStudents + 1 }
                : act
        ))
    }

    const handleRemoveStudent = (studentId: string) => {
        if (!selectedActivity) return
        setStudents(prev => ({
            ...prev,
            [selectedActivity.id]: prev[selectedActivity.id].filter(s => s.id !== studentId),
        }))
        setActivities(prev => prev.map(act =>
            act.id === selectedActivity.id
                ? { ...act, currentStudents: Math.max(0, act.currentStudents - 1) }
                : act
        ))
    }

    const handleUpdateStudentStatus = (studentId: string, status: Student['status']) => {
        if (!selectedActivity) return
        setStudents(prev => ({
            ...prev,
            [selectedActivity.id]: prev[selectedActivity.id].map(s =>
                s.id === studentId ? { ...s, status } : s
            ),
        }))
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Accumulations</h1>
                        <p className="text-muted-foreground">
                            Manage your activities and student enrollments
                        </p>
                    </div>
                    <ActivityForm
                        onSubmit={editingActivity ? handleUpdateActivity : handleCreateActivity}
                        open={isFormOpen}
                        onOpenChange={(open) => {
                            setIsFormOpen(open)
                            if (!open) setEditingActivity(undefined)
                        }}
                        initialData={editingActivity}
                    />
                </div>

                {/* Stats Overview */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Activities"
                        value={totalActivities.toString()}
                        description="All time"
                        icon={Calendar}
                        trend="+2"
                        trendUp={true}
                    />
                    <StatCard
                        title="Total Students"
                        value={totalStudents.toString()}
                        description="Across all activities"
                        icon={Users}
                        trend="+15%"
                        trendUp={true}
                    />
                    <StatCard
                        title="Upcoming"
                        value={upcomingActivities.toString()}
                        description="Scheduled activities"
                        icon={Plus}
                        trend="This month"
                        trendUp={true}
                    />
                    <StatCard
                        title="Enrollment Rate"
                        value={`${Math.round((totalStudents / activities.reduce((sum, a) => sum + a.maxStudents, 0)) * 100)}%`}
                        description="Average fill rate"
                        icon={TrendingUp}
                        trend="+8%"
                        trendUp={true}
                    />
                </div>

                {/* Activities Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {activities.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">No Activities Yet</h3>
                            <p className="text-muted-foreground mb-4">
                                Create your first activity to start managing student enrollments
                            </p>
                            <ActivityForm onSubmit={handleCreateActivity} />
                        </div>
                    ) : (
                        activities.map((activity) => (
                            <AccumulationCard
                                key={activity.id}
                                activity={activity}
                                onViewStudents={handleViewStudents}
                                onEdit={handleEditActivity}
                                onDelete={handleDeleteActivity}
                            />
                        ))
                    )}
                </div>

                {/* Student Management Modal */}
                <StudentManagementModal
                    activity={selectedActivity}
                    open={isStudentModalOpen}
                    onOpenChange={setIsStudentModalOpen}
                    students={selectedActivity ? students[selectedActivity.id] || [] : []}
                    onAddStudent={handleAddStudent}
                    onRemoveStudent={handleRemoveStudent}
                    onUpdateStudentStatus={handleUpdateStudentStatus}
                />
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
        <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between space-y-0">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2">
                <div className="text-2xl font-bold">{value}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span className="text-green-600 font-medium">{trend}</span>
                    <span>{description}</span>
                </div>
            </div>
        </div>
    )
}

