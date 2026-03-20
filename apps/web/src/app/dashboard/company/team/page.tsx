"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Plus,
    Users,
    Briefcase,
    TrendingUp,
    Search,
    MoreVertical,
    X,
    CheckCircle,
    Clock,
    MapPin,
    DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Role {
    id: string;
    title: string;
    department: string;
    location: string;
    type: "Full-time" | "Part-time" | "Internship" | "Contract";
    openings: number;
    applicants: number;
    accepted: number;
    status: "Open" | "Closed" | "Paused";
    postedDate: string;
    salaryRange: string;
}

interface Student {
    id: string;
    name: string;
    email: string;
    school: string;
    major: string;
    appliedDate: string;
    status: "pending" | "interview" | "accepted" | "rejected";
    avatar?: string;
}

// Mock data - replace with API calls
const mockRoles: Role[] = [
    {
        id: "1",
        title: "Software Engineer Intern",
        department: "Engineering",
        location: "Manila, Philippines",
        type: "Internship",
        openings: 5,
        applicants: 48,
        accepted: 3,
        status: "Open",
        postedDate: "2026-03-01",
        salaryRange: "₱25,000-₱35,000/month",
    },
    {
        id: "2",
        title: "Product Manager",
        department: "Product",
        location: "Cebu City, Philippines",
        type: "Full-time",
        openings: 2,
        applicants: 32,
        accepted: 1,
        status: "Open",
        postedDate: "2026-02-15",
        salaryRange: "₱90,000-₱120,000/month",
    },
    {
        id: "3",
        title: "Data Analyst",
        department: "Analytics",
        location: "Quezon City, Philippines",
        type: "Full-time",
        openings: 3,
        applicants: 56,
        accepted: 2,
        status: "Open",
        postedDate: "2026-02-20",
        salaryRange: "₱70,000-₱90,000/month",
    },
    {
        id: "4",
        title: "UX Designer Intern",
        department: "Design",
        location: "Davao City, Philippines",
        type: "Internship",
        openings: 2,
        applicants: 24,
        accepted: 2,
        status: "Closed",
        postedDate: "2026-01-10",
        salaryRange: "₱22,000-₱30,000/month",
    },
    {
        id: "5",
        title: "Marketing Coordinator",
        department: "Marketing",
        location: "Makati, Philippines",
        type: "Part-time",
        openings: 1,
        applicants: 18,
        accepted: 0,
        status: "Paused",
        postedDate: "2026-03-10",
        salaryRange: "₱20,000-₱28,000/month",
    },
];

const mockStudents: Record<string, Student[]> = {
    "1": [
        {
            id: "101",
            name: "Sarah Johnson",
            email: "sarah.j@edu.com",
            school: "University of the Philippines",
            major: "Computer Science",
            appliedDate: "2026-03-02",
            status: "accepted",
        },
        {
            id: "102",
            name: "Michael Chen",
            email: "m.chen@edu.com",
            school: "Ateneo de Manila University",
            major: "Software Engineering",
            appliedDate: "2026-03-05",
            status: "accepted",
        },
        {
            id: "103",
            name: "Emma Davis",
            email: "emma.d@edu.com",
            school: "De La Salle University",
            major: "Computer Science",
            appliedDate: "2026-03-08",
            status: "accepted",
        },
    ],
    "2": [
        {
            id: "201",
            name: "James Wilson",
            email: "j.wilson@edu.com",
            school: "University of the Philippines",
            major: "Business Administration",
            appliedDate: "2026-02-18",
            status: "accepted",
        },
    ],
    "3": [
        {
            id: "301",
            name: "Lisa Anderson",
            email: "l.anderson@edu.com",
            school: "University of Santo Tomas",
            major: "Statistics",
            appliedDate: "2026-02-22",
            status: "accepted",
        },
        {
            id: "302",
            name: "David Kim",
            email: "d.kim@edu.com",
            school: "De La Salle University",
            major: "Data Science",
            appliedDate: "2026-02-25",
            status: "accepted",
        },
    ],
    "4": [
        {
            id: "401",
            name: "Emily Rodriguez",
            email: "e.rodriguez@edu.com",
            school: "Ateneo de Manila University",
            major: "Interaction Design",
            appliedDate: "2026-01-12",
            status: "accepted",
        },
        {
            id: "402",
            name: "Alex Thompson",
            email: "a.thompson@edu.com",
            school: "University of Santo Tomas",
            major: "UX Design",
            appliedDate: "2026-01-15",
            status: "accepted",
        },
    ],
};

const getStatusColor = (status: string) => {
    switch (status) {
        case "Open":
            return "bg-green-100 text-green-700";
        case "Closed":
            return "bg-gray-100 text-gray-700";
        case "Paused":
            return "bg-yellow-100 text-yellow-700";
        default:
            return "bg-gray-100 text-gray-700";
    }
};

const getStudentStatusColor = (status: string) => {
    switch (status) {
        case "accepted":
            return "bg-green-100 text-green-700";
        case "interview":
            return "bg-blue-100 text-blue-700";
        case "pending":
            return "bg-yellow-100 text-yellow-700";
        case "rejected":
            return "bg-gray-100 text-gray-700";
        default:
            return "bg-gray-100 text-gray-700";
    }
};

const getTypeColor = (type: string) => {
    switch (type) {
        case "Full-time":
            return "bg-brand-blue/10 text-brand-blue";
        case "Part-time":
            return "bg-brand-purple/10 text-brand-purple";
        case "Internship":
            return "bg-brand-orange/10 text-brand-orange";
        case "Contract":
            return "bg-brand-green/10 text-brand-green";
        default:
            return "bg-gray-100 text-gray-700";
    }
};

export default function TeamRolesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false);

    const filteredRoles = mockRoles.filter(
        (role) =>
            role.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            role.department.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalOpenings = mockRoles.reduce((sum, role) => sum + role.openings, 0);
    const totalApplicants = mockRoles.reduce((sum, role) => sum + role.applicants, 0);
    const totalAccepted = mockRoles.reduce((sum, role) => sum + role.accepted, 0);
    const openRoles = mockRoles.filter((r) => r.status === "Open").length;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Team & Roles</h1>
                        <p className="text-muted-foreground">
                            Manage your open positions and accepted candidates
                        </p>
                    </div>
                    <Button className="gap-2" onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="h-4 w-4" />
                        Create Role
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Openings"
                        value={totalOpenings.toString()}
                        description={`${openRoles} active roles`}
                        icon={Briefcase}
                        trend={`${openRoles} open`}
                        trendUp={true}
                    />
                    <StatCard
                        title="Total Applicants"
                        value={totalApplicants.toString()}
                        description="Across all positions"
                        icon={Users}
                        trend="+24 this week"
                        trendUp={true}
                    />
                    <StatCard
                        title="Accepted"
                        value={totalAccepted.toString()}
                        description="Candidates hired"
                        icon={CheckCircle}
                        trend="+8 this month"
                        trendUp={true}
                    />
                    <StatCard
                        title="Acceptance Rate"
                        value={`${Math.round((totalAccepted / totalApplicants) * 100)}%`}
                        description="Of all applicants"
                        icon={TrendingUp}
                        trend="+3%"
                        trendUp={true}
                    />
                </div>

                {/* Roles Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Open Roles</CardTitle>
                                <CardDescription>
                                    {filteredRoles.length} positions found
                                </CardDescription>
                            </div>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search roles..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Department
                                        </th>
                                        <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Location
                                        </th>
                                        <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Progress
                                        </th>
                                        <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRoles.map((role) => (
                                        <RoleRow
                                            key={role.id}
                                            role={role}
                                            onViewStudents={() => {
                                                setSelectedRole(role);
                                                setIsStudentsModalOpen(true);
                                            }}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Create Role Modal */}
            {isCreateModalOpen && (
                <CreateRoleModal onClose={() => setIsCreateModalOpen(false)} />
            )}

            {/* Students Modal */}
            {isStudentsModalOpen && selectedRole && (
                <StudentsModal
                    role={selectedRole}
                    students={mockStudents[selectedRole.id] || []}
                    onClose={() => {
                        setIsStudentsModalOpen(false);
                        setSelectedRole(null);
                    }}
                />
            )}
        </DashboardLayout>
    );
}

function StatCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
    trendUp,
}: {
    title: string;
    value: string;
    description: string;
    icon: React.ElementType;
    trend: string;
    trendUp: boolean;
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
    );
}

function RoleRow({
    role,
    onViewStudents,
}: {
    role: Role;
    onViewStudents: () => void;
}) {
    const progress = Math.round((role.accepted / role.openings) * 100);

    return (
        <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
            <td className="py-4 px-4">
                <div className="space-y-1">
                    <p className="text-sm font-medium">{role.title}</p>
                    <p className="text-xs text-muted-foreground">{role.salaryRange}</p>
                </div>
            </td>
            <td className="py-4 px-4">
                <p className="text-sm text-gray-700">{role.department}</p>
            </td>
            <td className="py-4 px-4">
                <span
                    className={cn(
                        "text-xs px-2 py-1 rounded-full font-medium",
                        getTypeColor(role.type)
                    )}
                >
                    {role.type}
                </span>
            </td>
            <td className="py-4 px-4">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin className="h-3 w-3" />
                    {role.location}
                </div>
            </td>
            <td className="py-4 px-4">
                <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                            {role.accepted}/{role.openings} filled
                        </span>
                        <span className="font-medium">{progress}%</span>
                    </div>
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </td>
            <td className="py-4 px-4">
                <span
                    className={cn(
                        "text-xs px-2 py-1 rounded-full font-medium",
                        getStatusColor(role.status)
                    )}
                >
                    {role.status}
                </span>
            </td>
            <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={onViewStudents}
                    >
                        <Users className="h-3 w-3 mr-1" />
                        {role.accepted} Accepted
                    </Button>
                    <button className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </button>
                </div>
            </td>
        </tr>
    );
}

function CreateRoleModal({ onClose }: { onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />
            <div className="relative bg-white rounded-[20px] w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold">Create New Role</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="title">Role Title</Label>
                            <Input id="title" placeholder="e.g., Software Engineer Intern" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="department">Department</Label>
                            <Input id="department" placeholder="e.g., Engineering" />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input id="location" placeholder="e.g., San Francisco, CA" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type">Employment Type</Label>
                            <select
                                id="type"
                                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                            >
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Internship">Internship</option>
                                <option value="Contract">Contract</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="openings">Number of Openings</Label>
                            <Input id="openings" type="number" placeholder="3" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="salary">Salary Range</Label>
                            <Input id="salary" placeholder="e.g., $25-35/hour" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Role Description</Label>
                        <textarea
                            id="description"
                            rows={4}
                            className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                            placeholder="Describe the role responsibilities and requirements..."
                        />
                    </div>
                </div>
                <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create Role
                    </Button>
                </div>
            </div>
        </div>
    );
}

function StudentsModal({
    role,
    students,
    onClose,
}: {
    role: Role;
    students: Student[];
    onClose: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />
            <div className="relative bg-white rounded-[20px] w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold">Accepted Candidates</h2>
                        <p className="text-sm text-muted-foreground">{role.title}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="p-6">
                    {students.length > 0 ? (
                        <div className="space-y-4">
                            {students.map((student) => (
                                <div
                                    key={student.id}
                                    className="flex items-start justify-between p-4 rounded-[16px] border border-gray-100 hover:bg-gray-50/50 transition-colors"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <span className="text-sm font-medium text-primary">
                                                {student.name.split(" ").map((n) => n[0]).join("")}
                                            </span>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-semibold">{student.name}</p>
                                            <p className="text-sm text-muted-foreground">{student.email}</p>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <span>{student.school}</span>
                                                <span>•</span>
                                                <span>{student.major}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={cn(
                                                "text-xs px-3 py-1 rounded-full font-medium capitalize",
                                                getStudentStatusColor(student.status)
                                            )}
                                        >
                                            {student.status}
                                        </span>
                                        <Button variant="outline" size="sm" className="h-8 text-xs">
                                            View Profile
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">
                                No accepted candidates for this role yet.
                            </p>
                        </div>
                    )}
                </div>
                <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        {students.length} accepted out of {role.openings} openings
                    </p>
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
}
