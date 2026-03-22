"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { apiClient } from '@/lib/apiClient'
import { Button } from '@/components/ui/button'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import Image from 'next/image'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import {
  Loader2, ShieldCheck, ShieldAlert, BadgeInfo, Network, Award,
  LayoutDashboard, GraduationCap, Building2, Layers, Settings, ChevronLeft, Eye, CheckCircle2,
  ChevronDown, ChevronUp, HelpCircle, UserCheck,
} from 'lucide-react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'

const schoolNavigation = [
  { name: 'Dashboard',     href: '/dashboard/school',               icon: LayoutDashboard },
  { name: 'Students',      href: '/dashboard/school',               icon: GraduationCap },
  { name: 'Companies',     href: '/dashboard/school',               icon: Building2 },
  { name: 'Accumulations', href: '/dashboard/school',               icon: Layers },
  { name: 'Settings',      href: '/dashboard/school/settings',      icon: Settings },
]

export default function SchoolStudentProfilePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'roadmap' | 'certifications'>('overview')
  const [openNode, setOpenNode] = useState<number | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [showVerifyDialog, setShowVerifyDialog] = useState(false)

  const handleVerify = async () => {
    setVerifying(true)
    try {
      await apiClient.patch(`/profile/${id}/verify`)
      setProfile((prev: any) => ({ ...prev, status: 'VERIFIED' }))
      setShowVerifyDialog(false)
    } catch {
      // silently fail — user can retry
    } finally {
      setVerifying(false)
    }
  }

  useEffect(() => {
    apiClient.get(`/profile/${id}`)
      .then(res => setProfile(res.data.data))
      .catch(() => setError('Failed to load student profile.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <DashboardLayout navigation={schoolNavigation}>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-gray-300" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !profile) {
    return (
      <DashboardLayout navigation={schoolNavigation}>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="text-center">
            <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Profile Not Found</h2>
            <p className="text-gray-500">{error}</p>
            <Button className="mt-4" onClick={() => router.back()}>Go Back</Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const isVerified = profile.status === 'VERIFIED'

  const isSoftSkill = (tag: string) => ['leadership', 'agile', 'scrum', 'communication', 'teamwork'].includes(tag.toLowerCase())
  const hardSkillsCount = profile.skillTags.filter((s: any) => !isSoftSkill(typeof s === 'string' ? s : s.tag)).length
  const softSkillsCount = profile.skillTags.filter((s: any) => isSoftSkill(typeof s === 'string' ? s : s.tag)).length

  const radarData = [
    { subject: 'Academic Rating', score: profile.pointsBreakdown?.academic || 0, fullMark: 1000, desc: 'Weighted GPA from university courses.', details: profile.academicRecords.map((r: any) => ({ label: r.subject, value: `${r.grade} Grade` })) },
    { subject: 'Valid Certs', score: profile.pointsBreakdown?.cert || 0, fullMark: 1000, desc: 'Validated external credentials.', details: profile.certifications.filter((c: any) => c.verified).map((c: any) => ({ label: c.classification?.labels?.[0] || 'Verification', value: `${c.awardedPoints} pts` })) },
    { subject: 'Accumulations', score: profile.pointsBreakdown?.accumulations || 0, fullMark: 1000, desc: 'Bounty & hackathon performance.', details: [] },
    { subject: 'Extracurricular', score: profile.pointsBreakdown?.achievement || 0, fullMark: 1000, desc: 'Leadership & club participation awards.', details: [] },
    { subject: 'Hard Skills', score: profile.pointsBreakdown?.hardSkills || 0, fullMark: 1000, desc: `${hardSkillsCount} technical capabilities strictly mapped.`, details: profile.skillTags.filter((t: any) => t.tag && !['leadership', 'communication', 'teamwork', 'agile', 'scrum'].includes(t.tag.toLowerCase())).map((t: any) => ({ label: typeof t === 'string' ? t : t.tag, value: typeof t === 'string' ? '100%' : `${Math.round(t.confidence * 100)}% Confidence` })) },
    { subject: 'Soft Skills', score: profile.pointsBreakdown?.softSkills || 0, fullMark: 1000, desc: `${softSkillsCount} interpersonal strengths verified.`, details: profile.skillTags.filter((t: any) => t.tag && ['leadership', 'communication', 'teamwork', 'agile', 'scrum'].includes(t.tag.toLowerCase())).map((t: any) => ({ label: typeof t === 'string' ? t : t.tag, value: typeof t === 'string' ? '100%' : `${Math.round(t.confidence * 100)}% Confidence` })) },
  ]

  return (
    <DashboardLayout navigation={schoolNavigation}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 max-w-5xl mx-auto pb-20"
      >
        {/* Back button */}
        <Button variant="ghost" onClick={() => router.back()} className="gap-2 -ml-2">
          <ChevronLeft className="w-4 h-4" /> Back to Students
        </Button>

        {/* Verification Alert Banner */}
        {!isVerified && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm">
            <div className="flex gap-4 items-start">
              <BadgeInfo className="w-6 h-6 text-yellow-600 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-yellow-800">Account Pending Verification</h3>
                <p className="text-sm text-yellow-700 mt-1 leading-relaxed">
                  This student&apos;s profile is awaiting school verification.
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowVerifyDialog(true)}
              className="bg-green-600 hover:bg-green-700 text-white shrink-0 gap-2"
            >
              <UserCheck className="w-4 h-4" /> Verify Student
            </Button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {profile.basicInfo.lastName}, {profile.basicInfo.firstName} {profile.basicInfo.middleName?.charAt(0) ? `${profile.basicInfo.middleName.charAt(0)}.` : ''}
              </h1>
              {isVerified ? (
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase tracking-widest rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> Verified
                </span>
              ) : (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold uppercase tracking-widest rounded-full flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4" /> Unverified
                </span>
              )}
            </div>
            <p className="text-gray-500 font-medium">
              {profile.basicInfo.course}{profile.basicInfo.section ? ` - ${profile.basicInfo.section}` : ''} • {profile.basicInfo.yearLevel} • {profile.basicInfo.studentId}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {profile.skillTags?.map((skill: any, i: number) => {
                const tagString = typeof skill === 'string' ? skill : skill.tag
                return (
                  <div key={i} className="px-3 py-1.5 bg-black text-white text-xs font-bold rounded-full inline-flex items-center shadow-sm">
                    #{tagString}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-1">Total Score</p>
            <div className="flex items-center justify-end gap-3">
              <div className="text-5xl font-black tracking-tighter text-blue-600">
                {profile.totalPoints.toLocaleString()} <span className="text-xl text-gray-300">pts</span>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full text-gray-400 hover:text-blue-600">
                    <HelpCircle className="w-5 h-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-5 rounded-[24px] shadow-xl border-gray-100 mr-8 mt-2" align="end">
                  <h4 className="font-bold text-sm mb-4 tracking-tight flex items-center gap-2">
                    <Award className="w-4 h-4 text-orange-500" /> Points Breakdown
                  </h4>
                  <div className="space-y-3">
                    {[
                      ['Academic Rating', profile.pointsBreakdown?.academic],
                      ['Valid Certifications', profile.pointsBreakdown?.cert],
                      ['Accumulations', profile.pointsBreakdown?.accumulations],
                      ['Extracurricular', profile.pointsBreakdown?.achievement],
                      ['Hard Skills', profile.pointsBreakdown?.hardSkills],
                      ['Soft Skills', profile.pointsBreakdown?.softSkills],
                    ].map(([label, val]) => (
                      <div key={label as string} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 last:border-0">
                        <span className="text-gray-500 font-medium">{label}</span>
                        <span className="font-bold">{val || 0}</span>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-50/50 p-1.5 rounded-full border border-gray-100 max-w-2xl overflow-x-auto">
          {([
            { id: 'overview', label: 'Overview' },
            { id: 'skills', label: 'Skill Graph' },
            { id: 'roadmap', label: 'Career Roadmap' },
            { id: 'certifications', label: 'Certifications' },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex-1 px-4 py-3 text-sm font-bold tracking-tight rounded-full transition-colors whitespace-nowrap ${activeTab === tab.id ? 'text-black' : 'text-gray-500 hover:text-black'}`}
            >
              {activeTab === tab.id && (
                <motion.div layoutId="schoolStudentTab" className="absolute inset-0 bg-white shadow-sm border border-gray-100 rounded-full" transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">

            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="rounded-[32px] shadow-sm border-gray-100">
                  <CardHeader>
                    <CardTitle className="text-xl">Academic Transcripts</CardTitle>
                    <CardDescription>Mapped from university records.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {profile.academicRecords.length === 0 && <p className="text-sm text-gray-500 italic">No academic records yet.</p>}
                      {profile.academicRecords.slice(0, 6).map((r: any, i: number) => (
                        <div key={i} className="flex justify-between items-center bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
                          <span className="text-gray-900 font-bold truncate mr-4">{r.subject}</span>
                          <span className="px-3 py-1 bg-white border border-gray-100 rounded-full font-black text-blue-600 shadow-sm">{r.grade}</span>
                        </div>
                      ))}
                      {profile.academicRecords.length > 6 && (
                        <div className="text-center pt-2">
                          <span className="px-4 py-2 bg-gray-50 text-xs text-gray-400 font-bold uppercase tracking-wider rounded-full">
                            +{profile.academicRecords.length - 6} More Subjects
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-[32px] shadow-sm border-gray-100 h-fit">
                  <CardHeader>
                    <CardTitle className="text-xl">Basic Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {[
                      ['Email', (profile.user as any)?.email || '—'],
                      ['Student ID', profile.basicInfo.studentId || '—'],
                      ['Section', profile.basicInfo.section || '—'],
                      ['Term', profile.basicInfo.term || '—'],
                      ['Year Level', profile.basicInfo.yearLevel],
                      ['Course', profile.basicInfo.course],
                      ['Status', profile.status],
                    ].map(([label, val]) => (
                      <div key={label} className="flex justify-between border-b border-gray-50 pb-2 last:border-0">
                        <span className="text-gray-500 font-medium">{label}</span>
                        <span className="font-bold text-right">{val}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'skills' && (
              <motion.div key="skills" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.2 }}>
                <Card className="rounded-[32px] shadow-sm border-gray-100 overflow-hidden">
                  <CardHeader className="bg-gray-50/50">
                    <CardTitle className="flex items-center gap-2 text-xl"><Network className="w-5 h-5 text-gray-400" />Calculated Skill Graph</CardTitle>
                    <CardDescription>Visual map from {profile.skillTags.length} validated abilities.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row h-auto md:h-[450px]">
                      <div className="w-full md:w-[55%] h-80 md:h-full p-4 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="90%">
                          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                            <PolarGrid stroke="#E5E7EB" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#6B7280', fontSize: 11, fontWeight: 700 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                            <Radar name="Competency" dataKey="score" stroke="#007AFF" fill="#007AFF" fillOpacity={0.15} strokeWidth={3} dot={{ r: 4, fill: '#007AFF', strokeWidth: 2 }} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="w-full md:w-[45%] h-[350px] md:h-full border-t md:border-t-0 md:border-l border-gray-100 bg-gray-50/30 overflow-y-auto">
                        <div className="p-6 space-y-4">
                          {radarData.map((node, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                              <button onClick={() => setOpenNode(openNode === i ? null : i)} className="w-full text-left p-4 flex justify-between items-center group hover:bg-gray-50/80 transition-colors">
                                <div>
                                  <span className="text-sm font-bold text-gray-900 tracking-wider flex items-center gap-2">
                                    {node.subject}
                                    {openNode === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                  </span>
                                  <p className="text-xs text-gray-500 font-medium mt-1">{node.desc}</p>
                                </div>
                                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-black shrink-0">{node.score} PTS</span>
                              </button>
                              <AnimatePresence>
                                {openNode === i && node.details.length > 0 && (
                                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="px-4 pb-4 pt-2 border-t border-gray-50 bg-gray-50/50">
                                    <div className="flex flex-col gap-2">
                                      {node.details.map((dt: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center bg-white px-3 py-2 rounded-lg border border-gray-100">
                                          <span className="text-xs font-bold text-gray-800 capitalize truncate max-w-[150px]">{dt.label}</span>
                                          <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest bg-blue-100/50 px-2 py-1 rounded">{dt.value}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'roadmap' && (
              <motion.div key="roadmap" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }}>
                {profile.careerRoadmap ? (
                  <Card className="rounded-[32px] shadow-sm border-blue-200 bg-gradient-to-br from-blue-50/50 to-white overflow-hidden">
                    <CardHeader className="p-8">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
                        <div>
                          <CardTitle className="text-2xl flex items-center gap-2 mb-2"><Network className="w-6 h-6 text-blue-600" />Smart Career Roadmap</CardTitle>
                          <CardDescription className="text-base">Algorithmically calculated from {profile.skillTags.length} skill tags.</CardDescription>
                        </div>
                        <div className="md:text-right bg-white p-4 rounded-2xl border border-blue-100 shadow-sm min-w-[200px]">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Target Role</p>
                          <p className="text-xl font-black text-blue-600 leading-tight">{profile.careerRoadmap.targetRole}</p>
                          <div className="mt-2 w-full bg-blue-50 h-2 rounded-full overflow-hidden">
                            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${profile.careerRoadmap.matchPercentage}%` }} />
                          </div>
                          <p className="text-[10px] font-bold text-blue-800 mt-2 tracking-widest uppercase">{profile.careerRoadmap.matchPercentage}% Match</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="px-8 pb-8">
                      <div className="space-y-4">
                        {profile.careerRoadmap.roadmap.map((step: any, i: number) => (
                          <div key={i} className="flex gap-6 p-6 bg-white rounded-[24px] border border-gray-100 shadow-sm relative group hover:-translate-y-1 transition-transform">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xl z-10 shadow-lg shadow-blue-600/20">{step.step}</div>
                            {i !== profile.careerRoadmap.roadmap.length - 1 && <div className="absolute left-12 top-16 bottom-[-24px] w-[3px] bg-blue-100" />}
                            <div className="pt-1">
                              <h4 className="font-bold text-lg text-gray-900 mb-1">{step.title}</h4>
                              <p className="text-base text-gray-500 leading-relaxed">{step.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="p-12 text-center bg-gray-50 rounded-[32px] border border-gray-100 border-dashed">
                    <p className="text-gray-500 font-medium">No roadmap data available for this student yet.</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'certifications' && (
              <motion.div key="certifications" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }}>
                <Card className="rounded-[32px] shadow-sm border-gray-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl"><Award className="w-5 h-5 text-orange-500" />Certifications</CardTitle>
                    <CardDescription>Documents analyzed by the AI engine.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profile.certifications.length === 0 && <p className="text-sm text-gray-500 italic">No certificates attached yet.</p>}
                    {profile.certifications.map((cert: any, i: number) => (
                      <div key={i} className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors rounded-2xl p-4 border border-gray-100">
                        <div className="overflow-hidden pr-4">
                          <p className="text-sm font-bold text-gray-900 truncate flex items-center gap-2">
                            {cert.fileName}
                            {cert.verified && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                          </p>
                          <p className="text-xs text-blue-600 font-medium mt-1 line-clamp-1 italic">&quot;{cert.ocrText}&quot;</p>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 bg-white shadow-sm border border-gray-100 rounded-full text-gray-400 hover:text-blue-600 shrink-0">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-transparent border-0 rounded-[24px]">
                            {cert.fileData ? (
                              <Image src={cert.fileData} alt={cert.fileName} width={800} height={600} className="w-full h-auto object-contain bg-black/90" unoptimized />
                            ) : (
                              <div className="bg-white rounded-[24px] p-8 text-center">
                                <p className="text-sm text-gray-500">No image preview available for this certificate.</p>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>

      {/* Verify Confirm Dialog */}
      {showVerifyDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-[24px] border shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto">
              <UserCheck className="w-7 h-7 text-green-600" />
            </div>
            <h2 className="text-lg font-bold text-center">Verify Student</h2>
            <p className="text-sm text-gray-500 text-center">
              Are you sure you want to verify <span className="font-semibold text-gray-900">{profile.basicInfo.firstName} {profile.basicInfo.lastName}</span>? Their account will be activated and they will gain full access.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowVerifyDialog(false)} disabled={verifying}>Cancel</Button>
              <Button className="bg-green-600 hover:bg-green-700 text-white gap-2" onClick={handleVerify} disabled={verifying}>
                {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                Confirm Verify
              </Button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  )
}
