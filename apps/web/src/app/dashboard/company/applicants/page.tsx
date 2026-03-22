"use client"

import React, { useState, useEffect } from "react"
import DashboardLayout from "@/components/layouts/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Users,
    Search,
    X,
    CheckCircle,
    Clock,
    XCircle,
    Calendar,
    FileText,
    GraduationCap,
    MapPin,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    Video,
    Phone,
    UserCheck,
    Loader2,
    Send,
    Save,
    Mail
} from "lucide-react"
import { cn } from "@/lib/utils"
import { scheduleInterview, checkInterviewActive, type Interview, type MeetingType } from "@/lib/interviewsApi"
import {
    getCompanyApplicants,
    getApplicationStats,
    saveApplicationNotes,
    updateApplicationStatus,
    type Applicant as ApiApplicant,
    type ApplicationStatus
} from "@/lib/applicationsApi"
import { mockApi, mockApplicants } from "@/lib/mockApplicantsData"

interface Applicant {
    id: string
    applicationId: string
    name: string
    email: string
    school: string
    major: string
    appliedRole: string
    roleId: string
    department: string
    status: ApplicationStatus
    appliedDate: string
    skills: string[]
    location: string
    gpa?: string
    notes?: string
    yearLevel?: string
}

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
    const [isApproveRejectModalOpen, setIsApproveRejectModalOpen] = useState(false)
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5

    // Set to true to use mock data instead of API
    const USE_MOCK_DATA = true

    // API state
    const [apiApplicants, setApiApplicants] = useState<ApiApplicant[]>(USE_MOCK_DATA ? mockApplicants : [])
    const [stats, setStats] = useState({ total: 0, pending: 0, reviewing: 0, interview: 0, accepted: 0, rejected: 0 })
    const [loading, setLoading] = useState(true)

    // Fetch data from API or mock data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                if (USE_MOCK_DATA) {
                    // Use mock data
                    const applicantsResponse = await mockApi.getApplicants()
                    setApiApplicants(applicantsResponse.applicants)
                    setStats(applicantsResponse.stats)
                } else {
                    // Use real API
                    const [applicantsResponse, statsResponse] = await Promise.all([
                        getCompanyApplicants(),
                        getApplicationStats(),
                    ])
                    setApiApplicants(applicantsResponse.applicants)
                    setStats(applicantsResponse.stats || statsResponse.stats)
                }
            } catch (error) {
                console.error('Failed to fetch data:', error)
                // Fallback to mock data on error
                const mockResponse = await mockApi.getApplicants()
                setApiApplicants(mockResponse.applicants)
                setStats(mockResponse.stats)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    // Convert API applicants to Applicant format
    const convertToApplicants = (apiApplicants: ApiApplicant[]): Applicant[] => {
        return apiApplicants.flatMap(app => {
            return app.applications.map(appApp => ({
                id: app._id,
                applicationId: appApp._id,
                name: app.basicInfo?.firstName
                    ? `${app.basicInfo.firstName} ${app.basicInfo.lastName}`
                    : app.email.split('@')[0],
                email: app.email,
                school: app.basicInfo?.course || 'N/A',
                major: app.basicInfo?.course || 'N/A',
                appliedRole: appApp.role.title,
                roleId: appApp.role._id,
                department: appApp.role.department,
                status: appApp.status,
                appliedDate: new Date(appApp.appliedDate).toISOString().split('T')[0],
                skills: app.skillTags?.slice(0, 5).map(s => s.tag) || [],
                location: 'Philippines',
                gpa: undefined,
                notes: appApp.notes,
                yearLevel: app.basicInfo?.yearLevel,
            }))
        })
    }

    const applicants = convertToApplicants(apiApplicants)

    const filteredApplicants = applicants.filter(
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

    const handleReview = (applicant: Applicant) => {
        setSelectedApplicant(applicant)
        setIsReviewModalOpen(true)
    }

    const handleScheduleAppointment = (applicant: Applicant) => {
        setSelectedApplicant(applicant)
        setIsAppointmentModalOpen(true)
    }

    const handleApprove = (applicant: Applicant) => {
        setSelectedApplicant(applicant)
        setActionType('approve')
        setIsApproveRejectModalOpen(true)
    }

    const handleReject = (applicant: Applicant) => {
        setSelectedApplicant(applicant)
        setActionType('reject')
        setIsApproveRejectModalOpen(true)
    }

    const handleActionCompleted = (action: 'approved' | 'rejected' | 'interview') => {
        console.log(`Action completed: ${action}`)
        // Refresh data
        const refreshData = async () => {
            const applicantsResponse = USE_MOCK_DATA
                ? await mockApi.getApplicants()
                : await getCompanyApplicants()
            setApiApplicants(applicantsResponse.applicants)
            setStats(applicantsResponse.stats)
        }
        refreshData()
    }

    const handleSaveNotes = async (applicationId: string, notes: string) => {
        try {
            if (USE_MOCK_DATA) {
                await mockApi.saveNotes(applicationId, notes)
                const applicantsResponse = await mockApi.getApplicants()
                setApiApplicants(applicantsResponse.applicants)
                setStats(applicantsResponse.stats)
            } else {
                await saveApplicationNotes(applicationId, notes)
                // Refresh applicants to get updated notes
                const applicantsResponse = await getCompanyApplicants()
                setApiApplicants(applicantsResponse.applicants)
                setStats(applicantsResponse.stats)
            }
        } catch (error) {
            console.error('Failed to save notes:', error)
        }
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
                                            onApprove={() => handleApprove(applicant)}
                                            onReject={() => handleReject(applicant)}
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
                    applicationId={selectedApplicant.applicationId}
                    onClose={() => {
                        setIsReviewModalOpen(false)
                        setSelectedApplicant(null)
                    }}
                    onSaveNotes={handleSaveNotes}
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
                    onInterviewScheduled={(interview) => handleActionCompleted('interview')}
                    useMockData={USE_MOCK_DATA}
                />
            )}

            {/* Approve/Reject Modal */}
            {isApproveRejectModalOpen && selectedApplicant && actionType && (
                <ApproveRejectModal
                    applicant={selectedApplicant}
                    actionType={actionType}
                    applicationId={selectedApplicant.applicationId}
                    onClose={() => {
                        setIsApproveRejectModalOpen(false)
                        setSelectedApplicant(null)
                        setActionType(null)
                    }}
                    onActionCompleted={handleActionCompleted}
                    useMockData={USE_MOCK_DATA}
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
    onApprove,
    onReject,
}: {
    applicant: Applicant
    onReview: () => void
    onApprove: () => void
    onReject: () => void
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
                    <p className="text-xs text-muted-foreground">
                        {applicant.major}
                        {applicant.yearLevel && ` • Year ${applicant.yearLevel}`}
                    </p>
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
                        className="h-8 text-xs bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200"
                        onClick={onApprove}
                    >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approve
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 border-red-200"
                        onClick={onReject}
                    >
                        <XCircle className="h-3 w-3 mr-1" />
                        Reject
                    </Button>
                </div>
            </td>
        </tr>
    )
}

function ReviewModal({
    applicant,
    applicationId,
    onClose,
    onSaveNotes,
}: {
    applicant: Applicant
    applicationId: string
    onClose: () => void
    onSaveNotes: (id: string, notes: string) => void
}) {
    const [notes, setNotes] = useState(applicant.notes || "")
    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async () => {
        setIsSaving(true)
        await onSaveNotes(applicationId, notes)
        setIsSaving(false)
        onClose()
    }

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
                                <p className="text-base font-semibold">{applicant.school}</p>
                                <p className="text-sm text-muted-foreground">
                                    {applicant.major}
                                    {applicant.yearLevel && ` - Year ${applicant.yearLevel}`}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Skills */}
                    <div>
                        <Label>Skills</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {applicant.skills.length > 0 ? (
                                applicant.skills.map((skill) => (
                                    <span
                                        key={skill}
                                        className="text-sm px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue"
                                    >
                                        {skill}
                                    </span>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No skills listed</p>
                            )}
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
                        <Textarea
                            id="notes"
                            rows={6}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full mt-2 resize-none"
                            placeholder="Add your review notes here..."
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            {notes.length}/2000 characters
                        </p>
                    </div>
                </div>
                <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-between">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                        {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        {isSaving ? 'Saving...' : 'Save Notes'}
                    </Button>
                </div>
            </div>
        </div>
    )
}

function AppointmentModal({
    applicant,
    onClose,
    onInterviewScheduled,
    useMockData,
}: {
    applicant: Applicant
    onClose: () => void
    onInterviewScheduled: (interview: Interview) => void
    useMockData: boolean
}) {
    const [selectedDate, setSelectedDate] = useState("")
    const [selectedTime, setSelectedTime] = useState("")
    const [meetingType, setMeetingType] = useState<MeetingType>("video")
    const [additionalMessage, setAdditionalMessage] = useState("")
    
    // API state
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [invitationSent, setInvitationSent] = useState(false)
    const [interviewId, setInterviewId] = useState<string | null>(null)
    
    // Active state - buttons enabled when date/time matches current time
    const [isActive, setIsActive] = useState(false)
    const [isToday, setIsToday] = useState(false)

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

    // Check if interview is active when date/time changes
    React.useEffect(() => {
        const checkActive = async () => {
            if (interviewId && invitationSent) {
                try {
                    const response = useMockData
                        ? await mockApi.checkInterviewActive(interviewId)
                        : await checkInterviewActive(interviewId)
                    setIsActive(response.isActive)
                    setIsToday(response.isToday)
                } catch (error) {
                    console.error('Failed to check interview status:', error)
                }
            }
        }

        // Check immediately
        checkActive()

        // Check every 30 seconds
        const interval = setInterval(checkActive, 30000)
        return () => clearInterval(interval)
    }, [interviewId, invitationSent, useMockData])

    const handleSchedule = async () => {
        if (!selectedDate || !selectedTime) return

        setIsSubmitting(true)
        try {
            // In production, you would get the roleId from the selected role
            // For now, we'll use a placeholder - this should come from context or props
            const roleId = applicant.roleId || "placeholder-role-id" // TODO: Get from context

            const response = useMockData
                ? await mockApi.scheduleInterview({
                    applicantId: applicant.id,
                    roleId,
                    date: selectedDate,
                    time: selectedTime,
                    duration: 60,
                    meetingType,
                    notes: additionalMessage,
                })
                : await scheduleInterview({
                    applicantId: applicant.id,
                    roleId,
                    date: selectedDate,
                    time: selectedTime,
                    duration: 60,
                    meetingType,
                    notes: additionalMessage,
                })

            setInvitationSent(true)
            setInterviewId(response.interview._id)
            setIsActive(false)
            setIsToday(new Date(response.interview.date).toDateString() === new Date().toDateString())

            // Notify parent
            onInterviewScheduled(response.interview)
        } catch (error: any) {
            console.error('Failed to schedule interview:', error)
            alert(error.response?.data?.message || 'Failed to schedule interview. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancel = () => {
        // Only close if invitation hasn't been sent
        if (!invitationSent) {
            onClose()
        }
    }

    // Render invitation sent state
    if (invitationSent && interviewId) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div
                    className="absolute inset-0 bg-black/50"
                    onClick={handleCancel}
                />
                <div className="relative bg-white rounded-[20px] w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                        <h2 className="text-xl font-bold">Interview Invitation Sent</h2>
                        <button
                            onClick={handleCancel}
                            disabled={!isActive}
                            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors disabled:opacity-50"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="p-6 space-y-6">
                        {/* Success Icon */}
                        <div className="flex justify-center">
                            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                                <Mail className="h-10 w-10 text-green-600" />
                            </div>
                        </div>

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

                        {/* Status Message */}
                        <div className="text-center space-y-2">
                            <p className="text-sm text-muted-foreground">
                                Interview invitation has been sent to
                            </p>
                            <p className="text-base font-semibold">{applicant.email}</p>
                        </div>

                        {/* Interview Details */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Interview Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Date:</span>
                                    <span className="font-medium">
                                        {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { 
                                            weekday: 'short', 
                                            month: 'short', 
                                            day: 'numeric' 
                                        }) : '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Time:</span>
                                    <span className="font-medium">{selectedTime}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Type:</span>
                                    <span className="font-medium capitalize">{meetingType} Call</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Status Indicator */}
                        <div className={cn(
                            "p-4 rounded-lg border-2 transition-colors",
                            isActive 
                                ? "border-green-200 bg-green-50" 
                                : isToday 
                                    ? "border-yellow-200 bg-yellow-50"
                                    : "border-gray-200 bg-gray-50"
                        )}>
                            <div className="flex items-start gap-3">
                                {isActive ? (
                                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                ) : isToday ? (
                                    <Clock className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                ) : (
                                    <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1">
                                    <p className={cn(
                                        "text-sm font-medium",
                                        isActive ? "text-green-900" : isToday ? "text-yellow-900" : "text-gray-900"
                                    )}>
                                        {isActive 
                                            ? "Interview is now active!" 
                                            : isToday 
                                                ? "Waiting for interview time..."
                                                : "Interview scheduled for a future date"}
                                    </p>
                                    <p className={cn(
                                        "text-xs mt-1",
                                        isActive ? "text-green-700" : isToday ? "text-yellow-700" : "text-gray-600"
                                    )}>
                                        {isActive 
                                            ? "You can now start the interview" 
                                            : isToday 
                                                ? "Buttons will be enabled at the scheduled time"
                                                : "Check back on the interview date"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2">
                            <Button
                                className="w-full gap-2"
                                disabled={!isActive}
                            >
                                <Video className="h-4 w-4" />
                                {isActive ? "Start Video Interview" : "Start Interview (Waiting...)"}
                            </Button>
                            
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant="outline"
                                    className="gap-2"
                                    disabled={!isActive}
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    Approve
                                </Button>
                                <Button
                                    variant="outline"
                                    className="gap-2 text-red-600 hover:text-red-700"
                                    disabled={!isActive}
                                >
                                    <XCircle className="h-4 w-4" />
                                    Reject
                                </Button>
                            </div>
                        </div>

                        {!isActive && (
                            <p className="text-xs text-center text-muted-foreground">
                                Buttons will be enabled when the interview date and time matches the current time
                            </p>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    // Render scheduling form
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
                                    "p-3 rounded-lg border text-sm font-medium transition-colors flex items-center justify-center gap-2",
                                    meetingType === "video"
                                        ? "border-primary bg-primary/5 text-primary"
                                        : "border-input hover:bg-muted"
                                )}
                            >
                                <Video className="h-4 w-4" />
                                Video
                            </button>
                            <button
                                onClick={() => setMeetingType("phone")}
                                className={cn(
                                    "p-3 rounded-lg border text-sm font-medium transition-colors flex items-center justify-center gap-2",
                                    meetingType === "phone"
                                        ? "border-primary bg-primary/5 text-primary"
                                        : "border-input hover:bg-muted"
                                )}
                            >
                                <Phone className="h-4 w-4" />
                                Phone
                            </button>
                            <button
                                onClick={() => setMeetingType("in-person")}
                                className={cn(
                                    "p-3 rounded-lg border text-sm font-medium transition-colors flex items-center justify-center gap-2",
                                    meetingType === "in-person"
                                        ? "border-primary bg-primary/5 text-primary"
                                        : "border-input hover:bg-muted"
                                )}
                            >
                                <UserCheck className="h-4 w-4" />
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
                            value={additionalMessage}
                            onChange={(e) => setAdditionalMessage(e.target.value)}
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
                        disabled={!selectedDate || !selectedTime || isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4" />
                                Send Invitation
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}

function ApproveRejectModal({
    applicant,
    actionType,
    applicationId,
    onClose,
    onActionCompleted,
    useMockData,
}: {
    applicant: Applicant
    actionType: 'approve' | 'reject'
    applicationId: string
    onClose: () => void
    onActionCompleted: (action: 'approved' | 'rejected') => void
    useMockData: boolean
}) {
    const [isConfirming, setIsConfirming] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [rejectReason, setRejectReason] = useState('')

    const handleConfirm = async () => {
        setIsProcessing(true)
        try {
            // Update status using mock API or real API
            const newStatus: ApplicationStatus = actionType === 'approve' ? 'accepted' : 'rejected'

            if (useMockData) {
                await mockApi.updateStatus(applicationId, newStatus)
            } else {
                await updateApplicationStatus(applicationId, newStatus)
            }

            onActionCompleted(actionType === 'approve' ? 'approved' : 'rejected')
            onClose()
        } catch (error) {
            console.error('Failed to update status:', error)
            alert('Failed to update application status. Please try again.')
        } finally {
            setIsProcessing(false)
        }
    }

    const handleInitialConfirm = () => {
        if (actionType === 'reject' && !rejectReason.trim()) {
            return // Don't proceed if reject reason is required but empty
        }
        setIsConfirming(true)
    }

    const isReject = actionType === 'reject'

    // Confirmation step UI
    if (isConfirming) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div
                    className="absolute inset-0 bg-black/50"
                    onClick={onClose}
                />
                <div className="relative bg-white rounded-[20px] w-full max-w-md mx-4 overflow-hidden">
                    <div className="p-6 space-y-6">
                        {/* Icon based on action type */}
                        <div className="flex justify-center">
                            <div className={cn(
                                "h-20 w-20 rounded-full flex items-center justify-center",
                                isReject ? "bg-red-100" : "bg-green-100"
                            )}>
                                {isReject ? (
                                    <XCircle className="h-10 w-10 text-red-600" />
                                ) : (
                                    <CheckCircle className="h-10 w-10 text-green-600" />
                                )}
                            </div>
                        </div>

                        {/* Applicant Info */}
                        <div className="text-center space-y-2">
                            <h2 className="text-xl font-bold">
                                {isReject ? "Reject Application?" : "Approve Application?"}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {isReject
                                    ? "This action cannot be undone. The applicant will be notified that their application was not successful."
                                    : "The applicant will be notified of their acceptance and will receive next steps via email."}
                            </p>
                        </div>

                        {/* Applicant Details */}
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-medium text-primary">
                                    {applicant.name.split(" ").map((n) => n[0]).join("")}
                                </span>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">{applicant.name}</p>
                                <p className="text-xs text-muted-foreground">{applicant.appliedRole}</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={onClose}
                                disabled={isProcessing}
                            >
                                Cancel
                            </Button>
                            <Button
                                className={cn(
                                    "flex-1 gap-2",
                                    isReject ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                                )}
                                onClick={handleConfirm}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : isReject ? (
                                    <XCircle className="h-4 w-4" />
                                ) : (
                                    <CheckCircle className="h-4 w-4" />
                                )}
                                {isProcessing ? 'Processing...' : isReject ? 'Reject' : 'Approve'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Initial step with reject reason input
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />
            <div className="relative bg-white rounded-[20px] w-full max-w-md mx-4 overflow-hidden">
                <div className="p-6 space-y-6">
                    {/* Icon based on action type */}
                    <div className="flex justify-center">
                        <div className={cn(
                            "h-20 w-20 rounded-full flex items-center justify-center",
                            isReject ? "bg-red-100" : "bg-green-100"
                        )}>
                            {isReject ? (
                                <XCircle className="h-10 w-10 text-red-600" />
                            ) : (
                                <CheckCircle className="h-10 w-10 text-green-600" />
                            )}
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center space-y-2">
                        <h2 className="text-xl font-bold">
                            {isReject ? "Reject Application" : "Approve Application"}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {isReject
                                ? "Please provide a reason for rejection (optional)"
                                : "Confirm that you want to accept this applicant"}
                        </p>
                    </div>

                    {/* Applicant Info */}
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-primary">
                                {applicant.name.split(" ").map((n) => n[0]).join("")}
                            </span>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium">{applicant.name}</p>
                            <p className="text-xs text-muted-foreground">{applicant.appliedRole}</p>
                        </div>
                    </div>

                    {/* Reject Reason (only for reject action) */}
                    {isReject && (
                        <div>
                            <Label htmlFor="rejectReason">Rejection Reason (Optional)</Label>
                            <Textarea
                                id="rejectReason"
                                rows={4}
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="w-full mt-2 resize-none"
                                placeholder="E.g., Looking for candidates with more experience in..."
                            />
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            className={cn(
                                "flex-1 gap-2",
                                isReject ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                            )}
                            onClick={handleInitialConfirm}
                        >
                            {isReject ? (
                                <XCircle className="h-4 w-4" />
                            ) : (
                                <CheckCircle className="h-4 w-4" />
                            )}
                            Continue
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
