"use client"

import { useEffect, useState } from "react"
import DashboardLayout from "@/components/layouts/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Users,
    TrendingUp,
    Activity,
    Award,
    Plus,
    Target,
    BarChart3,
    Star,
} from "lucide-react"
import { getCompanyDetails, getAllApplicantsWithScores, getApplicationStats } from "@/lib/companyApi"
import { ICompanyDetails, IApplicant } from "@/types/company"

interface StatCardProps {
    title: string
    value: string
    description: string
    icon: React.ElementType
}

function StatCard({
    title,
    value,
    description,
    icon: Icon,
}: StatCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-xs text-muted-foreground">
                    {description}
                </div>
            </CardContent>
        </Card>
    )
}

function StudentPotentialCard({ applicant }: { applicant: IApplicant }) {
    const { student, potential, engagement, activities } = applicant;
    
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

    const displayName = student.name || 
                       (student.basicInfo?.firstName && student.basicInfo?.lastName 
                           ? `${student.basicInfo.firstName} ${student.basicInfo.lastName}`
                           : student.email.split('@')[0]);
    
    const skill = student.primarySkill || 
                 (student.skillTags?.length ? student.skillTags[0].tag : 'No skills listed');

    return (
        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="space-y-1 flex-1">
                <p className="text-sm font-medium">{displayName}</p>
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

export default function CompanyDashboardPage() {
    const [companyDetails, setCompanyDetails] = useState<ICompanyDetails | null>(null)
    const [applicants, setApplicants] = useState<IApplicant[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [stats, setStats] = useState<{ total: number; pending: number; reviewing: number; interview: number; accepted: number; rejected: number } | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [companyRes, applicantsRes, statsRes] = await Promise.all([
                    getCompanyDetails(),
                    getAllApplicantsWithScores(),
                    getApplicationStats()
                ])
                setCompanyDetails(companyRes.data)
                setApplicants(applicantsRes.applicants)
                setStats(statsRes.stats)
            } catch (err) {
                console.error('Failed to fetch data:', err)
                setError('Failed to load company information')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">Loading company details...</p>
                </div>
            </DashboardLayout>
        )
    }

    if (error || !companyDetails) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <p className="text-red-500">{error || 'Company details not found'}</p>
                </div>
            </DashboardLayout>
        )
    }

    const { company, user } = companyDetails

    return (
        <DashboardLayout user={{ email: user.email, name: user.email.split('@')[0] }}>
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
                                <CardTitle>{company.name}</CardTitle>
                                <CardDescription>{company.industry}</CardDescription>
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
                                <p className="text-sm font-medium">{company.address || 'Not specified'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Industry</p>
                                <p className="text-sm font-medium">{company.industry}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Established</p>
                                <p className="text-sm font-medium">{company.founded}</p>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {company.description}
                        </p>
                    </CardContent>
                </Card>

                {/* Key Metrics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Applicants"
                        value={stats?.total.toString() || "0"}
                        description={`${stats?.pending || 0} pending review`}
                        icon={Users}
                    />
                    <StatCard
                        title="Avg. Potential Score"
                        value={applicants.length > 0 ? Math.round(applicants.reduce((sum, a) => sum + a.potential, 0) / applicants.length) + "%" : "0%"}
                        description="Based on Careero matching"
                        icon={TrendingUp}
                    />
                    <StatCard
                        title="High Engagement"
                        value={applicants.filter(a => a.engagement === "High").length.toString()}
                        description="Highly engaged students"
                        icon={Activity}
                    />
                    <StatCard
                        title="Ready to Hire"
                        value={applicants.filter(a => a.careero.isEligible).length.toString()}
                        description="Eligible candidates"
                        icon={Award}
                    />
                </div>

                {/* Main Content */}
                <div className="space-y-4">
                    {/* Top Students by Potential */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Star className="h-4 w-4" />
                                Top Students by Potential
                            </CardTitle>
                            <CardDescription>Ranked by Careero match score (highest to lowest)</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {applicants.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">
                                    No applicants yet. Students will appear here once they apply to your roles.
                                </p>
                            ) : (
                                applicants.map((applicant) => (
                                    <StudentPotentialCard key={applicant.student._id} applicant={applicant} />
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <QuickAction title="Applicants" icon={Users} href="/dashboard/company/applicants" />
                            <QuickAction title="Team & Roles" icon={BarChart3} href="/dashboard/company/team" />
                            <QuickAction title="Accumulations" icon={Target} href="/dashboard/company/accumulations" />
                            <QuickAction title="Profile" icon={Target} href="/dashboard/company/profile" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
