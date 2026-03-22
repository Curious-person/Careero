"use client";

import React, { useState, useEffect, useCallback } from "react";
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
    DollarSign,
    Calendar,
    FileText,
    Target,
    Loader2,
    Trash2,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    getRoles,
    getRoleStats,
    createRole as apiCreateRole,
    deleteRole as apiDeleteRole,
    Role as ApiRole,
    RoleStats,
    CreateRoleInput,
    formatSalaryRange,
    transformRole,
} from "@/lib/rolesApi";
import {
    getCompanyAccumulations,
    type Accumulation,
} from "@/lib/accumulationsApi";

type Role = ApiRole;

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

// Mock activities removed - now fetching from API
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

// Skills data organized by category
const skillsByCategory = {
    "IT & Software Development": [
        "JavaScript", "TypeScript", "Python", "Java", "C#", "C++", "Go", "Rust",
        "React", "Next.js", "Vue.js", "Angular", "Svelte",
        "Node.js", "Express", "Django", "Flask", "Spring Boot",
        "PostgreSQL", "MySQL", "MongoDB", "Redis", "Firebase",
        "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform",
        "Git", "CI/CD", "DevOps", "Agile", "Scrum"
    ],
    "Computer Science": [
        "Data Structures", "Algorithms", "Machine Learning", "Deep Learning",
        "Artificial Intelligence", "Neural Networks", "TensorFlow", "PyTorch",
        "Computer Vision", "NLP", "Data Science", "Statistics",
        "Linear Algebra", "Calculus", "Discrete Mathematics",
        "Operating Systems", "Computer Networks", "Database Systems",
        "Software Engineering", "System Design", "Cloud Computing",
        "Cybersecurity", "Cryptography", "Blockchain", "IoT"
    ],
    "Business Administration": [
        "Project Management", "Product Management", "Business Analysis",
        "Strategic Planning", "Financial Analysis", "Market Research",
        "Data Analysis", "Excel", "SQL", "Tableau", "Power BI",
        "Leadership", "Team Management", "Communication",
        "Marketing", "Digital Marketing", "SEO", "SEM", "Social Media Marketing",
        "Sales", "Customer Relationship Management", "CRM",
        "Operations Management", "Supply Chain", "Quality Assurance",
        "Human Resources", "Recruitment", "Training & Development"
    ]
};

// Flatten skills for easier selection
const allSkills = Object.values(skillsByCategory).flat();

// Zod schema for role creation validation
const createRoleSchema = z.object({
    title: z
        .string()
        .min(3, "Title must be at least 3 characters")
        .max(100, "Title must be less than 100 characters"),
    department: z
        .string()
        .min(2, "Department must be at least 2 characters")
        .max(50, "Department must be less than 50 characters"),
    location: z
        .string()
        .min(5, "Location must be at least 5 characters"),
    type: z.enum(["Full-time", "Part-time", "Internship", "Contract"]),
    openings: z
        .number()
        .min(1, "Must have at least 1 opening")
        .max(50, "Maximum 50 openings allowed"),
    salaryMin: z
        .number()
        .min(1, "Minimum salary must be greater than 0"),
    salaryMax: z
        .number()
        .min(1, "Maximum salary must be greater than 0"),
    salaryPeriod: z.enum(["month", "hour", "year"]).optional(),
    description: z
        .string()
        .min(20, "Description must be at least 20 characters")
        .max(1000, "Description must be less than 1000 characters"),
    skills: z
        .array(z.string())
        .min(1, "Select at least 1 skill")
        .max(10, "Maximum 10 skills allowed"),
    accumulationIds: z
        .array(z.string())
        .min(1, "Select at least 1 accumulation"),
});

type CreateRoleFormData = z.infer<typeof createRoleSchema>;

export default function TeamRolesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false);
    const [roles, setRoles] = useState<Role[]>([]);
    const [stats, setStats] = useState<RoleStats | null>(null);
    const [accumulations, setAccumulations] = useState<Accumulation[]>([]);
    const [isLoadingAccumulations, setIsLoadingAccumulations] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch roles, stats, and accumulations from API
    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const [rolesResponse, statsResponse, accumulationsResponse] = await Promise.all([
                getRoles(searchQuery),
                getRoleStats(),
                getCompanyAccumulations(),
            ]);
            console.log('📥 Fetched accumulations:', accumulationsResponse.data);
            setRoles(rolesResponse.roles.map(transformRole));
            setStats(statsResponse.stats);
            setAccumulations(accumulationsResponse.data || []);
            setIsLoadingAccumulations(false);
        } catch (err) {
            console.error('Failed to fetch data:', err);
            setError('Failed to load data. Please try again.');
            setIsLoadingAccumulations(false);
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const totalOpenings = stats?.totalOpenings ?? 0;
    const totalApplicants = stats?.totalApplicants ?? 0;
    const totalAccepted = stats?.totalAccepted ?? 0;
    const openRoles = stats?.openRoles ?? 0;
    const acceptanceRate = stats?.acceptanceRate ?? 0;

    const filteredRoles = roles.filter(
        (role) =>
            role.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            role.department.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreateRole = async (data: CreateRoleFormData) => {
        setIsSubmitting(true);
        try {
            const response = await apiCreateRole({
                title: data.title,
                department: data.department,
                location: data.location,
                type: data.type,
                openings: data.openings,
                salaryMin: data.salaryMin,
                salaryMax: data.salaryMax,
                salaryPeriod: data.salaryPeriod,
                description: data.description,
                skills: data.skills,
                accumulationIds: data.accumulationIds,
            });
            const newRole = transformRole(response.role);
            setRoles(prev => [newRole, ...prev]);
            
            // Refresh stats
            const statsResponse = await getRoleStats();
            setStats(statsResponse.stats);
            
            setError(null);
            setIsCreateModalOpen(false);
        } catch (err: any) {
            console.error('Failed to create role:', err);
            setError(err.response?.data?.message || 'Failed to create role. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteRole = async (roleId: string, roleTitle: string) => {
        if (!confirm(`Are you sure you want to delete "${roleTitle}"?`)) {
            return;
        }

        try {
            await apiDeleteRole(roleId);
            setRoles(prev => prev.filter(r => r.id !== roleId));
            
            // Refresh stats
            const statsResponse = await getRoleStats();
            setStats(statsResponse.stats);
            
            setError(null);
        } catch (err: any) {
            console.error('Failed to delete role:', err);
            setError(err.response?.data?.message || 'Failed to delete role. Please try again.');
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Error Banner */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-red-900">{error}</p>
                        </div>
                        <button
                            onClick={() => setError(null)}
                            className="text-red-600 hover:text-red-800"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Team & Roles</h1>
                        <p className="text-muted-foreground">
                            Manage your open positions and accepted candidates
                        </p>
                    </div>
                    <Button 
                        className="gap-2" 
                        onClick={() => setIsCreateModalOpen(true)}
                        disabled={isLoading}
                    >
                        <Plus className="h-4 w-4" />
                        Create Role
                    </Button>
                </div>

                {/* Stats Cards - Show loading skeleton or actual data */}
                {isLoading ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Card key={i}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                                    <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                                </CardHeader>
                                <CardContent>
                                    <div className="h-8 w-16 bg-muted rounded animate-pulse mb-2" />
                                    <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
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
                            value={`${acceptanceRate}%`}
                            description="Of all applicants"
                            icon={TrendingUp}
                            trend="+3%"
                            trendUp={true}
                        />
                    </div>
                )}

                {/* Roles Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Open Roles</CardTitle>
                                <CardDescription>
                                    {isLoading ? 'Loading...' : `${filteredRoles.length} positions found`}
                                </CardDescription>
                            </div>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search roles..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-4 p-4">
                                        <div className="h-12 w-48 bg-muted rounded animate-pulse" />
                                        <div className="h-12 w-32 bg-muted rounded animate-pulse" />
                                        <div className="h-12 w-24 bg-muted rounded animate-pulse" />
                                        <div className="h-12 w-40 bg-muted rounded animate-pulse" />
                                        <div className="h-12 w-32 bg-muted rounded animate-pulse" />
                                        <div className="h-12 w-20 bg-muted rounded animate-pulse" />
                                    </div>
                                ))}
                            </div>
                        ) : filteredRoles.length === 0 ? (
                            <EmptyState onCreateRole={() => setIsCreateModalOpen(true)} />
                        ) : (
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
                                                Points
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
                                                onDelete={() => role.id && handleDeleteRole(role.id, role.title)}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Create Role Modal */}
            {isCreateModalOpen && (
                <CreateRoleModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onSubmit={handleCreateRole}
                    isSubmitting={isSubmitting}
                    accumulations={accumulations}
                    isLoadingAccumulations={isLoadingAccumulations}
                />
            )}

            {/* Students Modal */}
            {isStudentsModalOpen && selectedRole && (
                <StudentsModal
                    role={selectedRole}
                    students={[]}
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

function EmptyState({ onCreateRole }: { onCreateRole: () => void }) {
    return (
        <div className="text-center py-16">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <Briefcase className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No roles yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Get started by creating your first role. You can manage job postings, track applicants, and hire candidates.
            </p>
            <Button onClick={onCreateRole} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Role
            </Button>
        </div>
    );
}

function RoleRow({
    role,
    onViewStudents,
    onDelete,
}: {
    role: Role;
    onViewStudents: () => void;
    onDelete: () => void;
}) {
    const progress = Math.min(Math.round((role.accepted / role.openings) * 100), 100);

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
                <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-brand-blue" />
                    <span className="text-sm font-semibold text-foreground">{role.points}</span>
                    <span className="text-xs text-muted-foreground">pts</span>
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
                    <div className="relative group">
                        <button className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-[120px]">
                            <button
                                onClick={onDelete}
                                className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                                <Trash2 className="h-3 w-3" />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </td>
        </tr>
    );
}

interface CreateRoleModalProps {
    onClose: () => void;
    onSubmit?: (data: CreateRoleFormData) => void;
    isSubmitting?: boolean;
    accumulations: Accumulation[];
    isLoadingAccumulations: boolean;
}

function CreateRoleModal({ onClose, onSubmit, isSubmitting = false, accumulations, isLoadingAccumulations }: CreateRoleModalProps) {
    const [activeTab, setActiveTab] = useState<"general" | "requirements">("general");
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [selectedAccumulationIds, setSelectedAccumulationIds] = useState<string[]>([]);
    const [skillSearchQuery, setSkillSearchQuery] = useState("");

    // Debug: Log accumulations when modal opens
    React.useEffect(() => {
        console.log('🔔 CreateRoleModal - accumulations prop:', accumulations);
        console.log('🔢 Accumulations count:', accumulations?.length);
    }, [accumulations]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        setValue,
        trigger,
        getValues,
    } = useForm<CreateRoleFormData>({
        resolver: zodResolver(createRoleSchema),
        defaultValues: {
            title: "",
            department: "",
            location: "",
            type: "Internship",
            openings: 1,
            salaryPeriod: "month",
            description: "",
            skills: [],
            accumulationIds: [],
        },
    });

    // Sync local state with react-hook-form
    React.useEffect(() => {
        setValue("skills", selectedSkills);
    }, [selectedSkills, setValue]);

    React.useEffect(() => {
        setValue("accumulationIds", selectedAccumulationIds);
    }, [selectedAccumulationIds, setValue]);

    const handleFormSubmit = async (data: CreateRoleFormData) => {
        // Validate salary max > salary min
        if (data.salaryMax <= data.salaryMin) {
            alert("Maximum salary must be greater than minimum salary");
            return;
        }

        const selectedAccumulations = accumulations.filter(a => data.accumulationIds.includes(a._id));

        console.log("╔══════════════════════════════════════════════════════════╗");
        console.log("║              CREATE ROLE FORM SUBMITTED                  ║");
        console.log("╚══════════════════════════════════════════════════════════╝");
        console.log("📝 Form Data (validated with Zod):", {
            ...data,
            accumulationTitles: selectedAccumulations.map(a => a.title),
        });
        console.log("🎯 Selected Skills:", data.skills);
        console.log("📅 Linked Accumulations:", selectedAccumulations.map(a => a.title));
        console.log("💰 Salary Range:", `₱${data.salaryMin.toLocaleString('en-PH')} - ₱${data.salaryMax.toLocaleString('en-PH')} / ${data.salaryPeriod}`);
        console.log("✅ Validation Status: PASSED");
        console.log("═══════════════════════════════════════════════════════════");

        // Call the API onSubmit handler
        onSubmit?.(data);

        // Reset will be called after API response in parent
        reset();
        setSelectedSkills([]);
        setSelectedAccumulationIds([]);
        setSkillSearchQuery("");
    };

    const handleSkillToggle = (skill: string) => {
        setSelectedSkills(prev => {
            if (prev.includes(skill)) {
                return prev.filter(s => s !== skill);
            }
            if (prev.length >= 10) {
                return prev;
            }
            return [...prev, skill];
        });
    };

    const handleRemoveSkill = (skill: string) => {
        setSelectedSkills(prev => prev.filter(s => s !== skill));
    };

    const handleToggleAccumulation = (id: string) => {
        setSelectedAccumulationIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(a => a !== id);
            }
            return [...prev, id];
        });
    };

    const handleRemoveAccumulation = (id: string) => {
        setSelectedAccumulationIds(prev => prev.filter(a => a !== id));
    };

    // Filter skills based on search
    const filteredSkills = allSkills.filter(skill =>
        skill.toLowerCase().includes(skillSearchQuery.toLowerCase())
    );

    const isGeneralTabValid = () => {
        const values = watch(["title", "department", "location", "type", "openings", "description"]);
        return values.every(v => v && (typeof v === "string" ? v.length > 0 : true));
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div
                    className="absolute inset-0 bg-black/50"
                    onClick={onClose}
                />
                <div className="relative bg-white rounded-[20px] w-full max-w-3xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                        <h2 className="text-xl font-bold">Create New Role</h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-100">
                        <button
                            type="button"
                            onClick={() => setActiveTab("general")}
                            className={cn(
                                "flex-1 px-6 py-3 text-sm font-medium transition-colors border-b-2 flex items-center justify-center gap-2",
                                activeTab === "general"
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <FileText className="h-4 w-4" />
                            General Info
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("requirements")}
                            className={cn(
                                "flex-1 px-6 py-3 text-sm font-medium transition-colors border-b-2 flex items-center justify-center gap-2",
                                activeTab === "requirements"
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Target className="h-4 w-4" />
                            Requirements
                            {selectedSkills.length > 0 && (
                                <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">
                                    {selectedSkills.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {activeTab === "general" ? (
                            <div className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Role Title *</Label>
                                        <Input
                                            id="title"
                                            {...register("title")}
                                            placeholder="e.g., Software Engineer Intern"
                                        />
                                        {errors.title && (
                                            <p className="text-xs text-red-600">{errors.title.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="department">Department *</Label>
                                        <Input
                                            id="department"
                                            {...register("department")}
                                            placeholder="e.g., Engineering"
                                        />
                                        {errors.department && (
                                            <p className="text-xs text-red-600">{errors.department.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="location">Location *</Label>
                                        <Input
                                            id="location"
                                            {...register("location")}
                                            placeholder="e.g., Manila, Philippines"
                                        />
                                        {errors.location && (
                                            <p className="text-xs text-red-600">{errors.location.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="type">Employment Type *</Label>
                                        <select
                                            id="type"
                                            {...register("type")}
                                            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                                        >
                                            <option value="Full-time">Full-time</option>
                                            <option value="Part-time">Part-time</option>
                                            <option value="Internship">Internship</option>
                                            <option value="Contract">Contract</option>
                                        </select>
                                        {errors.type && (
                                            <p className="text-xs text-red-600">{errors.type.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="openings">Number of Openings *</Label>
                                        <Input
                                            id="openings"
                                            type="number"
                                            min="1"
                                            max="50"
                                            {...register("openings", { valueAsNumber: true })}
                                            placeholder="3"
                                        />
                                        {errors.openings && (
                                            <p className="text-xs text-red-600">{errors.openings.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="salaryMin">Min Salary *</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₱</span>
                                            <Input
                                                id="salaryMin"
                                                type="number"
                                                min="1"
                                                {...register("salaryMin", { valueAsNumber: true })}
                                                placeholder="25,000"
                                                className="pl-8"
                                            />
                                        </div>
                                        {errors.salaryMin && (
                                            <p className="text-xs text-red-600">{errors.salaryMin.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="salaryMax">Max Salary *</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₱</span>
                                            <Input
                                                id="salaryMax"
                                                type="number"
                                                min="1"
                                                {...register("salaryMax", { valueAsNumber: true })}
                                                placeholder="35,000"
                                                className="pl-8"
                                            />
                                        </div>
                                        {errors.salaryMax && (
                                            <p className="text-xs text-red-600">{errors.salaryMax.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="salaryPeriod">Period *</Label>
                                        <select
                                            id="salaryPeriod"
                                            {...register("salaryPeriod")}
                                            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                                        >
                                            <option value="month">Per Month</option>
                                            <option value="hour">Per Hour</option>
                                            <option value="year">Per Year</option>
                                        </select>
                                        {errors.salaryPeriod && (
                                            <p className="text-xs text-red-600">{errors.salaryPeriod.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Role Description *</Label>
                                    <textarea
                                        id="description"
                                        rows={4}
                                        {...register("description")}
                                        className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                                        placeholder="Describe the role responsibilities and requirements... (min 20 characters)"
                                    />
                                    {errors.description && (
                                        <p className="text-xs text-red-600">{errors.description.message}</p>
                                    )}
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs text-muted-foreground">
                                            Minimum 20 characters
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {watch("description")?.length || 0}/1000
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Skills Selection - Badge Style */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label>Required Skills *</Label>
                                        <span className="text-xs text-muted-foreground">
                                            {selectedSkills.length}/10 selected
                                        </span>
                                    </div>

                                    {/* Selected Skills Badges */}
                                    {selectedSkills.length > 0 && (
                                        <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-muted/30">
                                            {selectedSkills.map((skill) => (
                                                <span
                                                    key={skill}
                                                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-primary text-primary-foreground"
                                                >
                                                    {skill}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveSkill(skill)}
                                                        className="hover:bg-primary/80 rounded-full p-0.5"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Skill Search */}
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            value={skillSearchQuery}
                                            onChange={(e) => setSkillSearchQuery(e.target.value)}
                                            placeholder="Search skills..."
                                            className="pl-9"
                                        />
                                    </div>

                                    {/* Skills Grid */}
                                    <div className="max-h-64 overflow-y-auto border rounded-lg p-3">
                                        <div className="space-y-4">
                                            {Object.entries(skillsByCategory).map(([category, skills]) => {
                                                const categorySkills = skills.filter(s =>
                                                    s.toLowerCase().includes(skillSearchQuery.toLowerCase())
                                                );
                                                if (categorySkills.length === 0) return null;
                                                return (
                                                    <div key={category}>
                                                        <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">
                                                            {category}
                                                        </p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {categorySkills.map((skill) => {
                                                                const isSelected = selectedSkills.includes(skill);
                                                                return (
                                                                    <button
                                                                        key={skill}
                                                                        type="button"
                                                                        onClick={() => handleSkillToggle(skill)}
                                                                        disabled={!isSelected && selectedSkills.length >= 10}
                                                                        className={cn(
                                                                            "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                                                                            isSelected
                                                                                ? "bg-primary text-primary-foreground border-primary"
                                                                                : "bg-background text-foreground border-input hover:border-primary/50",
                                                                            !isSelected && selectedSkills.length >= 10
                                                                                ? "opacity-50 cursor-not-allowed"
                                                                                : "cursor-pointer"
                                                                        )}
                                                                    >
                                                                        {skill}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    {errors.skills && (
                                        <p className="text-xs text-red-600">{errors.skills.message}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Click to select/deselect skills (maximum 10)
                                    </p>
                                </div>

                                {/* Accumulations - Card List Style (Multiple Select) */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label>Related Accumulations *</Label>
                                        <span className="text-xs text-muted-foreground">
                                            {selectedAccumulationIds.length} selected
                                        </span>
                                    </div>

                                    {/* Selected Accumulations Badges */}
                                    {selectedAccumulationIds.length > 0 && (
                                        <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-muted/30">
                                            {selectedAccumulationIds.map((id) => {
                                                const accumulation = accumulations.find(a => a._id === id);
                                                if (!accumulation) return null;
                                                return (
                                                    <span
                                                        key={id}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm bg-primary text-primary-foreground"
                                                    >
                                                        <Calendar className="h-3 w-3" />
                                                        {accumulation.title}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveAccumulation(id)}
                                                            className="hover:bg-primary/80 rounded-full p-0.5"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Accumulations Grid */}
                                    <div className="grid gap-3">
                                        {isLoadingAccumulations ? (
                                            <div className="text-center py-8">
                                                <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-muted-foreground" />
                                                <p className="text-sm text-muted-foreground">Loading accumulations...</p>
                                            </div>
                                        ) : accumulations.length === 0 ? (
                                            <div className="text-center py-8 text-muted-foreground">
                                                <Briefcase className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                <p className="text-sm">No accumulations available</p>
                                                <p className="text-xs mt-1">Create an accumulation first to link it to a role</p>
                                            </div>
                                        ) : (
                                            accumulations.map((accumulation) => {
                                                const isSelected = selectedAccumulationIds.includes(accumulation._id);
                                                return (
                                                    <button
                                                        key={accumulation._id}
                                                        type="button"
                                                        onClick={() => handleToggleAccumulation(accumulation._id)}
                                                        className={cn(
                                                            "flex items-center justify-between p-4 border rounded-lg transition-all text-left",
                                                            isSelected
                                                                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                                                : "border-input hover:border-primary/50 hover:bg-muted/30"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={cn(
                                                                "h-10 w-10 rounded-lg flex items-center justify-center",
                                                                isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                                                            )}>
                                                                <Calendar className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-sm">{accumulation.title}</p>
                                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                    <span className="capitalize">{accumulation.type}</span>
                                                                    <span>•</span>
                                                                    <span>{new Date(accumulation.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {isSelected && (
                                                            <CheckCircle className="h-5 w-5 text-primary" />
                                                        )}
                                                    </button>
                                                );
                                            })
                                        )}
                                    </div>
                                    {errors.accumulationIds && (
                                        <p className="text-xs text-red-600">{errors.accumulationIds.message}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Click to select/deselect multiple accumulations (at least 1 required)
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer with Navigation */}
                    <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <div className="flex items-center gap-3">
                            {activeTab === "requirements" && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setActiveTab("general")}
                                >
                                    Back
                                </Button>
                            )}
                            {activeTab === "general" ? (
                                <Button
                                    type="button"
                                    onClick={async () => {
                                        const isValid = await trigger(["title", "department", "location", "type", "openings", "salaryMin", "salaryMax", "salaryPeriod", "description"]);
                                        if (isValid) {
                                            setActiveTab("requirements");
                                        }
                                    }}
                                    className="gap-2"
                                >
                                    Next
                                    <Plus className="h-4 w-4 rotate-90" />
                                </Button>
                            ) : (
                                <Button 
                                    type="submit" 
                                    className="gap-2"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="h-4 w-4" />
                                            Create Role
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </form>
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
                            <h3 className="text-lg font-semibold text-foreground mb-2">No accepted candidates yet</h3>
                            <p className="text-muted-foreground">
                                Once students apply and are accepted for this role, they will appear here.
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
