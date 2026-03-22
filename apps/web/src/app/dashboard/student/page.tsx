"use client"

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/apiClient'
import DashboardLayout from "@/components/layouts/DashboardLayout"
import { Layers, Briefcase, Trophy, CheckCircle, Activity, LayoutDashboard, Users, Settings, ArrowRight, ShieldCheck, MapPin, Network, Loader2, ShieldAlert, Award } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'

const studentNavigation = [
  { name: 'Overview', href: '/dashboard/student', icon: LayoutDashboard },
  { name: 'Accumulations', href: '/dashboard/student/accumulations', icon: Layers },
  { name: 'Offers', href: '/dashboard/student/offers', icon: Briefcase },
    { name: 'My Profile', href: '/dashboard/student/profile', icon: Users },
]

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null)
  const [accumStats, setAccumStats] = useState<{ inProgress: number; completed: number; inProgressItems: any[]; completedItems: any[] }>({ 
    inProgress: 0, 
    completed: 0, 
    inProgressItems: [], 
    completedItems: [] 
  })
  const [accumTab, setAccumTab] = useState<'active' | 'done'>('active')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, accumRes] = await Promise.all([
          apiClient.get('/profile/me'),
          apiClient.get('/accumulations/student/available').catch(() => ({ data: { data: [] } })),
        ])
        const prof = profileRes.data.data
        setProfile(prof)

        // Derive counts using the student's name
        const studentName = `${prof?.basicInfo?.firstName} ${prof?.basicInfo?.lastName}`.trim()
        const accums: any[] = accumRes.data.data || []
        const inProgress = accums.filter(a =>
          a.participantList?.some((p: any) => p.name === studentName && p.status === 'In Progress')
        ).length
        const completed = accums.filter(a =>
          a.participantList?.some((p: any) => p.name === studentName && p.status === 'Completed')
        ).length
        
        // Find real in-progress items for the list
        const inProgressItems = accums.filter(a =>
          a.participantList?.some((p: any) => p.name === studentName && p.status === 'In Progress')
        ).slice(0, 3)

        // Find real completed items for the list
        const completedItems = accums.filter(a =>
          a.participantList?.some((p: any) => p.name === studentName && p.status === 'Completed')
        ).slice(0, 3)

        setAccumStats({ inProgress, completed, inProgressItems, completedItems })
      } catch (err: any) {
        setError('Failed to load profile. Please complete onboarding.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <DashboardLayout navigation={studentNavigation}>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-gray-300" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !profile) {
    return (
      <DashboardLayout navigation={studentNavigation}>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="text-center">
            <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Profile Locked</h2>
            <p className="text-gray-500">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // --- Real Radar Data Calculation ---
  const isSoftSkill = (tag: string) => ['leadership', 'agile', 'scrum', 'communication', 'teamwork'].includes(tag.toLowerCase());
  const hardSkillsCount = profile.skillTags.filter((s: any) => !isSoftSkill(typeof s === 'string' ? s : s.tag)).length;
  const softSkillsCount = profile.skillTags.filter((s: any) => isSoftSkill(typeof s === 'string' ? s : s.tag)).length;
  
  const radarData = profile ? [
    { subject: 'Academic', score: profile.pointsBreakdown?.academic || 0, fullMark: 1000 },
    { subject: 'Valid Certs', score: profile.pointsBreakdown?.cert || 0, fullMark: 1000 },
    { subject: 'Accumulations', score: profile.pointsBreakdown?.accumulations || 0, fullMark: 1000 },
    { subject: 'Extracurricular', score: profile.pointsBreakdown?.achievement || 0, fullMark: 1000 },
    { subject: 'Hard Skills', score: profile.pointsBreakdown?.hardSkills || 0, fullMark: 1000 },
    { subject: 'Soft Skills', score: profile.pointsBreakdown?.softSkills || 0, fullMark: 1000 }
  ] : []

  // Dynamic KPI Stats
  const totalVerifiedCerts = profile.certifications?.filter((c: any) => c.verified).length || 0;

  return (
    <DashboardLayout navigation={studentNavigation}>
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        
        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Student Overview</h1>
            <p className="text-gray-500 mt-1">
              Welcome back, <span className="font-bold text-gray-900">{profile.basicInfo.firstName}</span>. Monitor your holistic path trajectory below.
            </p>
          </div>
          {/* Removed Upload Artifact button as requested */}
        </div>

        {/* Dynamic KPIs connected to real profile! */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Skill Points"
            value={profile.totalPoints.toLocaleString()}
            description="Overall calculated trajectory"
            icon={Trophy}
            iconColor="text-yellow-600"
            iconBg="bg-yellow-100"
            trend={accumStats.completed > 0 ? `+${accumStats.completed * 100} this week` : '+0 this week'}
            trendUp={accumStats.completed > 0}
          />
          <StatCard
            title="Unlocked Offers"
            value="24"
            description="Based on Match Score"
            icon={Briefcase}
            iconColor="text-indigo-600"
            iconBg="bg-indigo-100"
            trend="5 new matches"
            trendUp={true}
          />
          <StatCard
            title="Active Accumulations"
            value={accumStats.inProgress.toString()}
            description="In progress accumulations"
            icon={Layers}
            iconColor="text-blue-600"
            iconBg="bg-blue-100"
            trend={accumStats.completed > 0 ? `${accumStats.completed} completed` : 'None completed yet'}
            trendUp={accumStats.completed > 0}
          />
          <StatCard
            title="Verified Artifacts"
            value={totalVerifiedCerts.toString()}
            description="AI-Validated certs"
            icon={CheckCircle}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-100"
            trend="100% Legitimacy"
            trendUp={true}
          />
        </div>

        {/* ── Core Insight Visualization ── */}
        <div className="grid gap-6 lg:grid-cols-2">
          
          {/* Main Radar Hexagon Feature */}
          <Card className="rounded-[32px] shadow-sm border-gray-100 overflow-hidden bg-white h-full flex flex-col">
            <CardHeader className="bg-gray-50/50 flex flex-row items-center justify-between pb-6">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Network className="w-5 h-5 text-gray-400" />
                  Calculated Skill Graph
                </CardTitle>
                <CardDescription className="mt-1">
                  Your live 6-Node visual map calculated strictly from your validated abilities.
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-blue-600 font-bold hover:bg-blue-50 rounded-xl" asChild>
                <a href="/dashboard/student/profile">Details <ArrowRight className="w-4 h-4 ml-1" /></a>
              </Button>
            </CardHeader>
            <CardContent className="h-[400px] w-full p-4 flex items-center justify-center flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#E5E7EB" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#6B7280', fontSize: 11, fontWeight: 700 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                  <Radar
                    name="Competency"
                    dataKey="score"
                    stroke="#007AFF"
                    fill="#007AFF"
                    fillOpacity={0.15}
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#007AFF', strokeWidth: 2 }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Smart Career Roadmap */}
          {profile.careerRoadmap ? (
            <Card className="rounded-[32px] shadow-[0_2px_15px_rgba(0,0,0,0.06)] border-blue-200 bg-gradient-to-br from-blue-50/50 to-white overflow-hidden h-full flex flex-col pt-2">
              <CardHeader className="pb-6">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <CardTitle className="text-xl text-black flex items-center gap-2 mb-2">
                      <Network className="w-5 h-5 text-blue-600" />
                      Smart Career Roadmap
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Algorithmically calculated route to hire.
                    </CardDescription>
                  </div>
                  <div className="text-right bg-white px-3 py-2 rounded-2xl border border-blue-100 shadow-sm shrink-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">Target Role</p>
                    <p className="text-sm font-black text-blue-600 leading-tight">{profile.careerRoadmap.targetRole}</p>
                    <div className="mt-1.5 w-full bg-blue-50 h-[3px] rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: `${profile.careerRoadmap.matchPercentage}%` }} />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6 flex-1 overflow-y-auto max-h-[400px] hide-scrollbar relative">
                <div className="space-y-4">
                  {(profile.careerRoadmap.phases?.flatMap((p: any) => p.nodes) || []).map((node: any, i: number, arr: any[]) => (
                    <div key={i} className="flex gap-4 p-4 bg-white rounded-2xl border border-blue-50 shadow-[0_1px_3px_rgba(0,0,0,0.02)] relative group hover:-translate-y-0.5 transition-transform cursor-default">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] z-10 shadow-md ${
                        node.status === 'Completed' ? 'bg-green-500 text-white' :
                        node.status === 'Current' ? 'bg-blue-600 text-white animate-pulse' :
                        'bg-gray-100 text-gray-400'
                      }`}>
                        {i + 1}
                      </div>
                      {i !== arr.length - 1 && (
                        <div className="absolute left-8 top-12 bottom-[-16px] w-[2px] bg-blue-100 group-hover:bg-blue-300 transition-colors" />
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-sm text-gray-900 leading-tight">{node.title}</h4>
                          <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md ${
                            node.status === 'Completed' ? 'text-green-700 bg-green-100' :
                            node.status === 'Current' ? 'text-blue-700 bg-blue-100' :
                            'text-gray-400 bg-gray-50'
                          }`}>
                            {node.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 lines-clamp-2 leading-relaxed bg-gray-50 p-2 rounded-lg italic">
                          &quot;{node.description.slice(0, 60)}...&quot;
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-[32px] shadow-sm border-gray-100 flex items-center justify-center bg-gray-50 h-full">
              <div className="text-center p-8">
                <Network className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium text-sm">Roadmap engine is currently calibrating your metrics.</p>
              </div>
            </Card>
          )}

        </div>

        {/* Split Core Dashboard View */}
        <div className="grid gap-6 lg:grid-cols-2">
          
          {/* Top Unlocked Offers */}
          <Card className="rounded-[32px] border-none shadow-[0_2px_10px_rgba(0,0,0,0.04)] bg-white h-full flex flex-col pt-2">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg">Top Unlocked Offers</CardTitle>
                  <CardDescription className="mt-1">Ranked by your AI Match Score</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="text-indigo-600 font-bold hover:bg-indigo-50 rounded-xl" asChild>
                  <a href="/dashboard/student/offers">View All <ArrowRight className="w-4 h-4 ml-1" /></a>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <OfferItem
                role="Cybersecurity Intern"
                company="TechCorp Solutions"
                location="San Francisco, CA"
                score={94}
              />
              <OfferItem
                role="Junior Full-Stack Engineer"
                company="Pathly Design Labs"
                location="Remote"
                score={88}
              />
              <OfferItem
                role="Data Analyst Fellow"
                company="Global Finance Analytics"
                location="New York, NY"
                score={82}
              />
            </CardContent>
          </Card>

          {/* My Accumulations (Tabbed) */}
          <Card className="rounded-[32px] border-none shadow-[0_2px_10px_rgba(0,0,0,0.04)] bg-white h-full flex flex-col pt-2">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg">My Accumulations</CardTitle>
                  <CardDescription className="mt-1">Track your progress and wins</CardDescription>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  <button 
                    onClick={() => setAccumTab('active')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${accumTab === 'active' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    Active
                  </button>
                  <button 
                    onClick={() => setAccumTab('done')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${accumTab === 'done' ? 'bg-white shadow-sm text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    Done
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              {accumTab === 'active' ? (
                accumStats.inProgressItems.length > 0 ? (
                  accumStats.inProgressItems.map((item: any) => (
                    <AccumulationItem
                      key={item._id}
                      title={item.title}
                      type={item.type}
                      progress={65} 
                      points={item.points}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-gray-400">
                    <Layers className="w-8 h-8 opacity-20 mb-2" />
                    <p className="text-xs font-medium italic">No active accumulations</p>
                  </div>
                )
              ) : (
                accumStats.completedItems.length > 0 ? (
                  accumStats.completedItems.map((item: any) => (
                    <AccumulationItem
                      key={item._id}
                      title={item.title}
                      type={item.type}
                      progress={100} 
                      points={item.points}
                      isCompleted={true}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-gray-400">
                    <CheckCircle className="w-8 h-8 opacity-20 mb-2" />
                    <p className="text-xs font-medium italic">No completed accumulations yet</p>
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor,
  iconBg,
  trend,
  trendUp,
}: {
  title: string
  value: string
  description: string
  icon: React.ElementType
  iconColor: string
  iconBg: string
  trend: string
  trendUp: boolean
}) {
  return (
    <Card className="rounded-[24px] border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] bg-white relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-[100px] opacity-10 ${iconBg} transition-all group-hover:scale-110`} />
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <p className="text-sm font-bold text-gray-500">{title}</p>
          <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center ${iconColor}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-3xl font-black text-gray-900 tracking-tight">{value}</h3>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${trendUp ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {trend}
            </span>
            <span className="text-xs font-medium text-gray-400">{description}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function OfferItem({
  role,
  company,
  location,
  score,
}: {
  role: string
  company: string
  location: string
  score: number
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 bg-gray-50/50 hover:bg-indigo-50/50 hover:border-indigo-100 transition-colors group cursor-pointer">
      <div className="space-y-1 w-full">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">{role}</p>
          <span className="text-[10px] uppercase tracking-wider font-black px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
            {score}% Match
          </span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-3 text-xs font-medium text-gray-500">
            <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {company}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {location}</span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 transition-colors" />
        </div>
      </div>
    </div>
  )
}

function AccumulationItem({
  title,
  type,
  progress,
  points,
  isCompleted = false,
}: {
  title: string
  type: string
  progress: number
  points: number
  isCompleted?: boolean
}) {
  return (
    <div className={`flex flex-col gap-3 p-4 rounded-2xl border transition-all cursor-pointer group ${
      isCompleted 
        ? 'bg-emerald-50/30 border-emerald-50 hover:bg-emerald-50/50 hover:border-emerald-100' 
        : 'bg-gray-50/50 border-gray-50 hover:bg-blue-50/50 hover:border-blue-100'
    }`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1 w-full">
          <p className={`text-sm font-bold ${isCompleted ? 'text-emerald-900' : 'text-gray-900 group-hover:text-blue-700'} transition-colors flex items-center justify-between`}>
            <span className="flex items-center gap-1.5">
              {isCompleted && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
              {title}
            </span>
             <span className={`text-[10px] font-black px-2 py-0.5 rounded ${isCompleted ? 'text-emerald-700 bg-emerald-100' : 'text-blue-700 bg-blue-100'}`}>
               +{points} PTS
             </span>
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500">
              {isCompleted ? 'Milestone' : type}
            </span>
          </div>
        </div>
      </div>
      <div className="space-y-1.5 mt-1">
        <div className="flex justify-between text-xs font-bold text-gray-500">
          <span>{isCompleted ? 'Status' : 'Progress'}</span>
          <span className={isCompleted ? 'text-emerald-600' : 'text-blue-600'}>{isCompleted ? 'Completed' : `${progress}%`}</span>
        </div>
        <div className={`h-2 w-full rounded-full overflow-hidden ${isCompleted ? 'bg-emerald-100/50' : 'bg-blue-100/50'}`}>
          <div 
            className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-blue-500'}`} 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
