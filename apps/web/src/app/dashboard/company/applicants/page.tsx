"use client"

import React, { useState } from "react"
import DashboardLayout from "@/components/layouts/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Users,
    Search,
    X,
    CheckCircle,
    Clock,
    XCircle,
    Calendar,
    Mail,
    FileText,
    Briefcase,
    GraduationCap,
    MapPin,
    Star,
    MoreVertical,
    ChevronLeft,
    ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Applicant {
    id: string
    name: string
    email: string
    school: string
    major: string
    appliedRole: string
    department: string
    status: "pending" | "reviewing" | "interview" | "accepted" | "rejected"
    appliedDate: string
    avatar?: string
    skills: string[]
    location: string
    gpa?: string
}

const mockApplicants: Applicant[] = [
    {
        id: "1",
        name: "Sarah Johnson",
        email: "sarah.j@edu.com",
        school: "University of the Philippines",
        major: "Computer Science",
        appliedRole: "Software Engineer Intern",
        department: "Engineering",
        status: "pending",
        appliedDate: "2026-03-18",
        skills: ["React", "TypeScript", "Node.js"],
        location: "Manila, Philippines",
        gpa: "3.8",
    },
    {
        id: "2",
        name: "Michael Chen",
        email: "m.chen@edu.com",
        school: "Ateneo de Manila University",
        major: "Software Engineering",
        appliedRole: "Software Engineer Intern",
        department: "Engineering",
        status: "reviewing",
        appliedDate: "2026-03-17",
        skills: ["Python", "Machine Learning", "TensorFlow"],
        location: "Quezon City, Philippines",
        gpa: "3.9",
    },
    {
        id: "3",
        name: "Emma Davis",
        email: "emma.d@edu.com",
        school: "De La Salle University",
        major: "Computer Science",
        appliedRole: "Product Manager",
        department: "Product",
        status: "interview",
        appliedDate: "2026-03-15",
        skills: ["Product Strategy", "Agile", "User Research"],
        location: "Manila, Philippines",
        gpa: "3.7",
    },
    {
        id: "4",
        name: "James Wilson",
        email: "j.wilson@edu.com",
        school: "University of Santo Tomas",
        major: "Business Administration",
        appliedRole: "Product Manager",
        department: "Product",
        status: "pending",
        appliedDate: "2026-03-16",
        skills: ["Business Analysis", "Strategy", "Finance"],
        location: "Manila, Philippines",
        gpa: "3.6",
    },
    {
        id: "5",
        name: "Lisa Anderson",
        email: "l.anderson@edu.com",
        school: "University of the Philippines",
        major: "Statistics",
        appliedRole: "Data Analyst",
        department: "Analytics",
        status: "accepted",
        appliedDate: "2026-03-10",
        skills: ["SQL", "Python", "Data Visualization"],
        location: "Quezon City, Philippines",
        gpa: "3.9",
    },
    {
        id: "6",
        name: "David Kim",
        email: "d.kim@edu.com",
        school: "De La Salle University",
        major: "Data Science",
        appliedRole: "Data Analyst",
        department: "Analytics",
        status: "rejected",
        appliedDate: "2026-03-12",
        skills: ["R", "Statistics", "Machine Learning"],
        location: "Manila, Philippines",
        gpa: "3.5",
    },
    {
        id: "7",
        name: "Emily Rodriguez",
        email: "e.rodriguez@edu.com",
        school: "Ateneo de Manila University",
        major: "Interaction Design",
        appliedRole: "UX Designer Intern",
        department: "Design",
        status: "pending",
        appliedDate: "2026-03-19",
        skills: ["Figma", "User Research", "Prototyping"],
        location: "Quezon City, Philippines",
        gpa: "3.8",
    },
    {
        id: "8",
        name: "Alex Thompson",
        email: "a.thompson@edu.com",
        school: "University of Santo Tomas",
        major: "UX Design",
        appliedRole: "UX Designer Intern",
        department: "Design",
        status: "reviewing",
        appliedDate: "2026-03-18",
        skills: ["Adobe XD", "Sketch", "Wireframing"],
        location: "Manila, Philippines",
        gpa: "3.7",
    },
]

const getStatusColor = (status: string) => {
    switch (status) {
        case "pending":
            return "bg-yellow-100 text-yellow-700"
        case "reviewing":
            return "bg-blue-100 text-blue-700"
        case "interview":
            return "bg-purple-100 text-purple-700"
        case "accepted":
            return "bg-green-100 text-green-700"
        case "rejected":
            return "bg-gray-100 text-gray-700"
        default:
            return "bg-gray-100 text-gray-700"
    }
}

const getStatusIcon = (status: string) => {
    switch (status) {
        case "pending":
            return Clock
        case "reviewing":
            return FileText
        case "interview":
            return Calendar
        case "accepted":
            return CheckCircle
        case "rejected":
            return XCircle
        default:
            return Clock
    }
}

export default function ApplicantsPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null)
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5

    const filteredApplicants = mockApplicants.filter(
        (applicant) => {
            const matchesSearch =
                applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                applicant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                applicant.appliedRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
                applicant.school.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesStatus = statusFilter === "all" || applicant.status === statusFilter
            return matchesSearch && matchesStatus
        }
    )

    const totalPages = Math.ceil(filteredApplicants.length / itemsPerPage)
    const paginatedApplicants = filteredApplicants.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const stats = {
        total: mockApplicants.length,
        pending: mockApplicants.filter((a) => a.status === "pending").length,
        reviewing: mockApplicants.filter((a) => a.status === "reviewing").length,
        interview: mockApplicants.filter((a) => a.status === "interview").length,
        accepted: mockApplicants.filter((a) => a.status === "accepted").length,
        rejected: mockApplicants.filter((a) => a.status === "rejected").length,
    }

    const handleReview = (applicant: Applicant) => {
        setSelectedApplicant(applicant)
        setIsReviewModalOpen(true)
    }

    const handleScheduleAppointment = (applicant: Applicant) => {
        setSelectedApplicant(applicant)
        setIsAppointmentModalOpen(true)
    }

    const handleReject = (applicantId: string) => {
        console.log("Rejecting applicant:", applicantId)
        setIsReviewModalOpen(false)
    }

    const handleAccept = (applicantId: string) => {
        console.log("Accepting applicant:", applicantId)
        setIsReviewModalOpen(false)
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Applicants</h1>
                        <p className="text-muted-foreground">
                            Review and manage student applications
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                    <StatCard
                        title="Total"
                        value={stats.total.toString()}
                        icon={Users}
                        color="bg-primary/10 text-primary"
                    />
                    <StatCard
                        title="Pending"
                        value={stats.pending.toString()}
                        icon={Clock}
                        color="bg-yellow-100 text-yellow-700"
                    />
                    <StatCard
                        title="Reviewing"
                        value={stats.reviewing.toString()}
                        icon={FileText}
                        color="bg-blue-100 text-blue-700"
                    />
                    <StatCard
                        title="Interview"
                        value={stats.interview.toString()}
                        icon={Calendar}
                        color="bg-purple-100 text-purple-700"
                    />
                    <StatCard
                        title="Accepted"
                        value={stats.accepted.toString()}
                        icon={CheckCircle}
                        color="bg-green-100 text-green-700"
                    />
                    <StatCard
                        title="Rejected"
                        value={stats.rejected.toString()}
                        icon={XCircle}
                        color="bg-gray-100 text-gray-700"
                    />
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>All Applicants</CardTitle>
                                <CardDescription>
                                    {filteredApplicants.length} applicants found
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search applicants..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="h-10 px-3 rounded-md border border-input bg-background text-sm"
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="reviewing">Reviewing</option>
                                    <option value="interview">Interview</option>
                                    <option value="accepted">Accepted</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Applicant
                                        </th>
                                        <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            School
                                        </th>
                                        <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Skills
                                        </th>
                                        <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Applied
                                        </th>
                                        <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedApplicants.map((applicant) => (
                                        <ApplicantRow
                                            key={applicant.id}
                                            applicant={applicant}
                                            onReview={() => handleReview(applicant)}
                                            onSchedule={() => handleScheduleAppointment(applicant)}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <p className="text-sm text-muted-foreground">
                                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                                    {Math.min(currentPage * itemsPerPage, filteredApplicants.length)} of{" "}
                                    {filteredApplicants.length} applicants
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Previous
                                    </Button>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <Button
                                                key={page}
                                                variant={currentPage === page ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setCurrentPage(page)}
                                                className="w-8 h-8 p-0"
                                            >
                                                {page}
                                            </Button>
                                        ))}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Review Modal */}
            {isReviewModalOpen && selectedApplicant && (
                <ReviewModal
                    applicant={selectedApplicant}
                    onClose={() => {
                        setIsReviewModalOpen(false)
                        setSelectedApplicant(null)
                    }}
                    onReject={() => handleReject(selectedApplicant.id)}
                    onAccept={() => handleAccept(selectedApplicant.id)}
                />
            )}

            {/* Appointment Modal */}
            {isAppointmentModalOpen && selectedApplicant && (
                <AppointmentModal
                    applicant={selectedApplicant}
                    onClose={() => {
                        setIsAppointmentModalOpen(false)
                        setSelectedApplicant(null)
                    }}
                />
            )}
        </DashboardLayout>
    )
}

function StatCard({
    title,
    value,
    icon: Icon,
    color,
}: {
    title: string
    value: string
    icon: React.ElementType
    color: string
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", color)}>
                    <Icon className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    )
}

function ApplicantRow({
    applicant,
    onReview,
    onSchedule,
}: {
    applicant: Applicant
    onReview: () => void
    onSchedule: () => void
}) {
    const StatusIcon = getStatusIcon(applicant.status)

    return (
        <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
            <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-primary">
                            {applicant.name.split(" ").map((n) => n[0]).join("")}
                        </span>
                    </div>
                    <div>
                        <p className="text-sm font-medium">{applicant.name}</p>
                        <p className="text-xs text-muted-foreground">{applicant.email}</p>
                    </div>
                </div>
            </td>
            <td className="py-4 px-4">
                <div className="space-y-1">
                    <p className="text-sm font-medium">{applicant.appliedRole}</p>
                    <p className="text-xs text-muted-foreground">{applicant.department}</p>
                </div>
            </td>
            <td className="py-4 px-4">
                <div className="space-y-1">
                    <p className="text-sm text-gray-700">{applicant.school}</p>
                    <p className="text-xs text-muted-foreground">{applicant.major}</p>
                </div>
            </td>
            <td className="py-4 px-4">
                <div className="flex flex-wrap gap-1">
                    {applicant.skills.slice(0, 2).map((skill) => (
                        <span
                            key={skill}
                            className="text-xs px-2 py-1 rounded-full bg-brand-blue/10 text-brand-blue"
                        >
                            {skill}
                        </span>
                    ))}
                    {applicant.skills.length > 2 && (
                        <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                            +{applicant.skills.length - 2}
                        </span>
                    )}
                </div>
            </td>
            <td className="py-4 px-4">
                <span
                    className={cn(
                        "text-xs px-2 py-1 rounded-full font-medium inline-flex items-center gap-1",
                        getStatusColor(applicant.status)
                    )}
                >
                    <StatusIcon className="h-3 w-3" />
                    {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                </span>
            </td>
            <td className="py-4 px-4">
                <p className="text-sm text-muted-foreground">{applicant.appliedDate}</p>
            </td>
            <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={onReview}
                    >
                        Review
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={onSchedule}
                    >
                        <Calendar className="h-3 w-3 mr-1" />
                        Schedule
                    </Button>
                    <button className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </button>
                </div>
            </td>
        </tr>
    )
}

function ReviewModal({
    applicant,
    onClose,
    onReject,
    onAccept,
}: {
    applicant: Applicant
    onClose: () => void
    onReject: () => void
    onAccept: () => void
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />
            <div className="relative bg-white rounded-[20px] w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold">Review Application</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    {/* Applicant Info */}
                    <div className="flex items-start gap-4">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-lg font-medium text-primary">
                                {applicant.name.split(" ").map((n) => n[0]).join("")}
                            </span>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold">{applicant.name}</h3>
                            <p className="text-sm text-muted-foreground">{applicant.email}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <GraduationCap className="h-4 w-4" />
                                    {applicant.school}
                                </div>
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {applicant.location}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Application Details */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm">Position</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1">
                                <p className="text-base font-semibold">{applicant.appliedRole}</p>
                                <p className="text-sm text-muted-foreground">{applicant.department}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm">Education</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1">
                                <p className="text-base font-semibold">{applicant.major}</p>
                                <p className="text-sm text-muted-foreground">GPA: {applicant.gpa}</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Skills */}
                    <div>
                        <Label>Skills</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {applicant.skills.map((skill) => (
                                <span
                                    key={skill}
                                    className="text-sm px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <Label>Current Status</Label>
                        <div className="mt-2">
                            <span
                                className={cn(
                                    "text-sm px-3 py-1 rounded-full font-medium inline-flex items-center gap-2",
                                    getStatusColor(applicant.status)
                                )}
                            >
                                {React.createElement(getStatusIcon(applicant.status), { className: "h-4 w-4" })}
                                {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                            </span>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <Label htmlFor="notes">Review Notes</Label>
                        <textarea
                            id="notes"
                            rows={4}
                            className="w-full mt-2 px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                            placeholder="Add your review notes here..."
                        />
                    </div>
                </div>
                <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-between">
                    <Button variant="outline" onClick={onReject} className="gap-2 text-red-600 hover:text-red-700">
                        <XCircle className="h-4 w-4" />
                        Reject Application
                    </Button>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={onAccept} className="gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Accept Application
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function AppointmentModal({
    applicant,
    onClose,
}: {
    applicant: Applicant
    onClose: () => void
}) {
    const [selectedDate, setSelectedDate] = useState("")
    const [selectedTime, setSelectedTime] = useState("")
    const [meetingType, setMeetingType] = useState<"video" | "phone" | "in-person">("video")

    const timeSlots = [
        "09:00 AM",
        "09:30 AM",
        "10:00 AM",
        "10:30 AM",
        "11:00 AM",
        "11:30 AM",
        "01:00 PM",
        "01:30 PM",
        "02:00 PM",
        "02:30 PM",
        "03:00 PM",
        "03:30 PM",
        "04:00 PM",
    ]

    const handleSchedule = () => {
        console.log("Scheduling appointment:", {
            applicantId: applicant.id,
            date: selectedDate,
            time: selectedTime,
            type: meetingType,
        })
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />
            <div className="relative bg-white rounded-[20px] w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold">Schedule Interview</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    {/* Applicant Info */}
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-primary">
                                {applicant.name.split(" ").map((n) => n[0]).join("")}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-medium">{applicant.name}</p>
                            <p className="text-xs text-muted-foreground">{applicant.appliedRole}</p>
                        </div>
                    </div>

                    {/* Meeting Type */}
                    <div>
                        <Label>Meeting Type</Label>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                            <button
                                onClick={() => setMeetingType("video")}
                                className={cn(
                                    "p-3 rounded-lg border text-sm font-medium transition-colors",
                                    meetingType === "video"
                                        ? "border-primary bg-primary/5 text-primary"
                                        : "border-input hover:bg-muted"
                                )}
                            >
                                Video Call
                            </button>
                            <button
                                onClick={() => setMeetingType("phone")}
                                className={cn(
                                    "p-3 rounded-lg border text-sm font-medium transition-colors",
                                    meetingType === "phone"
                                        ? "border-primary bg-primary/5 text-primary"
                                        : "border-input hover:bg-muted"
                                )}
                            >
                                Phone
                            </button>
                            <button
                                onClick={() => setMeetingType("in-person")}
                                className={cn(
                                    "p-3 rounded-lg border text-sm font-medium transition-colors",
                                    meetingType === "in-person"
                                        ? "border-primary bg-primary/5 text-primary"
                                        : "border-input hover:bg-muted"
                                )}
                            >
                                In-Person
                            </button>
                        </div>
                    </div>

                    {/* Date Selection */}
                    <div>
                        <Label htmlFor="date">Select Date</Label>
                        <Input
                            id="date"
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="mt-2"
                            min={new Date().toISOString().split("T")[0]}
                        />
                    </div>

                    {/* Time Selection */}
                    <div>
                        <Label>Select Time Slot</Label>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                            {timeSlots.map((time) => (
                                <button
                                    key={time}
                                    onClick={() => setSelectedTime(time)}
                                    className={cn(
                                        "p-2 rounded-lg border text-sm font-medium transition-colors",
                                        selectedTime === time
                                            ? "border-primary bg-primary/5 text-primary"
                                            : "border-input hover:bg-muted"
                                    )}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div>
                        <Label htmlFor="message">Additional Message (Optional)</Label>
                        <textarea
                            id="message"
                            rows={3}
                            className="w-full mt-2 px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                            placeholder="Add a personal message to include in the invitation..."
                        />
                    </div>
                </div>
                <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSchedule}
                        className="gap-2"
                        disabled={!selectedDate || !selectedTime}
                    >
                        <Calendar className="h-4 w-4" />
                        Send Invitation
                    </Button>
                </div>
            </div>
        </div>
    )
}
