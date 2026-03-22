"use client"

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { apiClient } from '@/lib/apiClient'
import { Button } from '@/components/ui/button'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import Image from 'next/image'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Loader2, ShieldCheck, ShieldAlert, BadgeInfo, Network, Award, LayoutDashboard, Layers, Briefcase, Users, CheckCircle, HelpCircle, ChevronRight, Eye, UploadCloud, CheckCircle2, ChevronDown, ChevronUp, FileText, Download, Save, RefreshCw } from 'lucide-react'
import { toast } from "sonner"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'

// We force generic student navigation
const studentNavigation = [
  { name: 'Overview', href: '/dashboard/student', icon: LayoutDashboard },

  { name: 'Accumulations', href: '/dashboard/student/accumulations', icon: Layers },
  { name: 'Offers', href: '/dashboard/student/offers', icon: Briefcase },
    { name: 'My Profile', href: '/dashboard/student/profile', icon: Users },
]

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // State for the locked modal
  const [showLockedModal, setShowLockedModal] = useState(false)
  
  // Layout states
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'roadmap' | 'certifications' | 'resume'>('overview')
  const [uploadingCert, setUploadingCert] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [openNode, setOpenNode] = useState<number | null>(null)

  // Resume Engine States
  const [resumeText, setResumeText] = useState('')
  const [generatingResume, setGeneratingResume] = useState(false)
  const [savingResume, setSavingResume] = useState(false)
  const [isEditingResume, setIsEditingResume] = useState(false)


  useEffect(() => {
    if (profile?.resumeMarkdown) setResumeText(profile.resumeMarkdown)
  }, [profile])

  const [accumulations, setAccumulations] = useState<any[]>([])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, accumRes] = await Promise.all([
          apiClient.get('/profile/me'),
          apiClient.get('/accumulations/student/available').catch(() => ({ data: { data: [] } })),
        ])
        setProfile(profileRes.data.data)
        setAccumulations(accumRes.data.data || [])
      } catch (err: any) {
        setError('Failed to load profile. Please complete onboarding if you haven\'t yet.')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleRestrictedAction = () => {
    if (profile?.status === 'UNDER_EVALUATION' || profile?.status === 'PENDING_ONBOARDING') {
      setShowLockedModal(true)
    } else {
      // Normal logic
      toast.success('Action fully unlocked!')
    }
  }

  const handleGenerateResume = async () => {
    setGeneratingResume(true)
    try {
      const res = await apiClient.post('/profile/resume/generate')
      setResumeText(res.data.data)
      setProfile({ ...profile, resumeMarkdown: res.data.data })
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to connect to Cloud AI Engine.')

    } finally {
      setGeneratingResume(false)
    }
  }

  const handleSaveResume = async () => {
    setSavingResume(true)
    try {
      await apiClient.post('/profile/resume/save', { resumeMarkdown: resumeText })
      setProfile({ ...profile, resumeMarkdown: resumeText })
      setIsEditingResume(false)
      toast.success('Resume saved and synced for Company access!')
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to save')
    } finally {
      setSavingResume(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload a valid image file (PNG, JPG, WebP). PDFs and other documents are not currently supported by our OCR engine.');
      // Clear the invalid input so they can click again
      e.target.value = '';
      return;
    }

    setUploadingCert(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64String = reader.result as string;

        // 1. Process OCR & Labels
        const studentName = profile?.basicInfo 
          ? `${profile.basicInfo.firstName} ${profile.basicInfo.lastName}`.trim().toLowerCase() 
          : '';

        const ocrRes = await apiClient.post('/profile/ocr-upload', { 
          imageBase64: base64String,
          studentName 
        });
        const { ocrText, classification } = ocrRes.data;

        // Calculate dynamic points using the AI's confidence map!
        const maxScore = Math.max(...(classification?.scores || [0.5]));
        const dynamicPoints = Math.round(maxScore * 100);

        // 2. Append to Profile explicitly
        const addRes = await apiClient.post('/profile/certifications/add', {
          certification: {
            fileName: file.name,
            fileData: base64String,
            ocrText,
            classification,
            verified: true,
            awardedPoints: dynamicPoints
          }
        });

        // 3. Hot swap the whole profile UI state so points adjust immediately!
        setProfile(addRes.data.data);
      } catch (err: any) {
        const serverMsg = err.response?.data?.message || err.message;
        setUploadError(serverMsg);
      } finally {
        setUploadingCert(false);
        // Clear input to allow re-uploading the same file if needed
        e.target.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

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

  const isVerified = profile.status === 'VERIFIED'

  // ── Unified 6-Node Hexagon Graph ──
  // Based STRICTLY on the actual exact points from the Profile Calculation.

  // Precisely map the exact weighted contribution points.
  const isSoftSkill = (tag: string) => ['leadership', 'agile', 'scrum', 'communication', 'teamwork'].includes(tag.toLowerCase());
  const hardSkillsCount = profile.skillTags.filter((s: any) => !isSoftSkill(typeof s === 'string' ? s : s.tag)).length;
  const softSkillsCount = profile.skillTags.filter((s: any) => isSoftSkill(typeof s === 'string' ? s : s.tag)).length;
  
  const hardSkillsScore = profile.pointsBreakdown?.hardSkills || 0; 
  const softSkillsScore = profile.pointsBreakdown?.softSkills || 0; 

  const studentFullName = `${profile.basicInfo.firstName} ${profile.basicInfo.lastName}`.trim();
  const completedAccumList = accumulations.filter((a: any) => 
    a.participantList?.some((p: any) => p.name === studentFullName && p.status === 'Completed')
  );

  const radarData = profile ? [
    { subject: 'Academic Rating', score: profile.pointsBreakdown?.academic || 0, fullMark: 1000, desc: 'Weighted GPA from university courses.', details: profile.academicRecords.map((r: any) => ({ label: r.subject, value: `${r.grade} Grade` })) },
    { subject: 'Valid Certs', score: profile.pointsBreakdown?.cert || 0, fullMark: 1000, desc: 'Validated external credentials.', details: profile.certifications.filter((c: any) => c.verified).map((c: any) => ({ label: c.classification?.labels?.[0] || 'Verification', value: `${c.awardedPoints} pts` })) },
    { subject: 'Accumulations', score: profile.pointsBreakdown?.accumulations || 0, fullMark: 1000, desc: 'Bounty & hackathon performance.', details: completedAccumList.map((a: any) => ({ label: a.title, value: `+${a.points} pts` })) },
    { subject: 'Extracurricular', score: profile.pointsBreakdown?.achievement || 0, fullMark: 1000, desc: 'Leadership & club participation awards.', details: [] },
    { subject: 'Hard Skills', score: profile.pointsBreakdown?.hardSkills || 0, fullMark: 1000, desc: `${hardSkillsCount} technical capabilities strictly mapped.`, details: profile.skillTags.filter((t: any) => t.tag && !['leadership', 'communication', 'teamwork', 'agile', 'scrum'].includes(t.tag.toLowerCase())).map((t: any) => ({ label: typeof t === 'string' ? t : t.tag, value: typeof t === 'string' ? '100%' : `${Math.round(t.confidence * 100)}% Confidence` })) },
    { subject: 'Soft Skills', score: profile.pointsBreakdown?.softSkills || 0, fullMark: 1000, desc: `${softSkillsCount} interpersonal strengths verified.`, details: profile.skillTags.filter((t: any) => t.tag && ['leadership', 'communication', 'teamwork', 'agile', 'scrum'].includes(t.tag.toLowerCase())).map((t: any) => ({ label: typeof t === 'string' ? t : t.tag, value: typeof t === 'string' ? '100%' : `${Math.round(t.confidence * 100)}% Confidence` })) }
  ] : []

  return (
    <DashboardLayout navigation={studentNavigation}>
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 max-w-5xl mx-auto pb-20"
      >
        
        {/* Verification Alert Banner */}
        {!isVerified && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex gap-4 items-start shadow-sm">
            <BadgeInfo className="w-6 h-6 text-yellow-600 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-yellow-800">Account Under Evaluation</h3>
              <p className="text-sm text-yellow-700 mt-1 leading-relaxed">
                Your uploaded documents and mapped skill tags are currently being reviewed by your School Administration. 
                Certain features like Accumulations, Jobs, and Public Sharing are temporarily locked until you receive the Verified Badge.
              </p>
            </div>
          </div>
        )}

        {/* Global Stats Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm shadow-gray-200/50">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {profile.basicInfo.lastName}, {profile.basicInfo.firstName} {profile.basicInfo.middleName?.charAt(0)}.
              </h1>
              {isVerified ? (
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase tracking-widest rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> Verified Target
                </span>
              ) : (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold uppercase tracking-widest rounded-full flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4" /> Unverified
                </span>
              )}
            </div>
            <p className="text-gray-500 font-medium">
              {profile.basicInfo.course} {profile.basicInfo.section && `- ${profile.basicInfo.section}`} • {profile.basicInfo.yearLevel} • {profile.basicInfo.studentId}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
                    {profile.skillTags?.map((skill: any, i: number) => {
                      // Handle old format (string) or new format ({ tag, confidence })
                      const tagString = typeof skill === 'string' ? skill : skill.tag;

                      return (
                        <div key={i} className="px-3 py-1.5 bg-black text-white text-xs font-bold rounded-full inline-flex items-center shadow-sm">
                          #{tagString}
                        </div>
                      )
                    })}       </div>
          </div>

          <div className="text-right">
            <p className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-1">Total Score</p>
            <div className="flex items-center justify-end gap-3">
              <div className="text-5xl font-black tracking-tighter text-brand-blue">
                {profile.totalPoints.toLocaleString()} <span className="text-xl text-gray-300">pts</span>
              </div>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full text-gray-400 hover:text-brand-blue">
                    <HelpCircle className="w-5 h-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-5 rounded-[24px] shadow-xl border-gray-100 mr-8 mt-2" align="end">
                  <h4 className="font-bold text-sm mb-4 tracking-tight flex items-center gap-2">
                    <Award className="w-4 h-4 text-brand-orange" /> Points Breakdown
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                      <span className="text-gray-500 font-medium">Academic Rating</span>
                      <span className="font-bold">{profile.pointsBreakdown?.academic || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                      <span className="text-gray-500 font-medium">Valid Certifications</span>
                      <span className="font-bold">{profile.pointsBreakdown?.cert || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                      <span className="text-gray-500 font-medium">Accumulations</span>
                      <span className="font-bold">{profile.pointsBreakdown?.accumulations || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                      <span className="text-gray-500 font-medium">Extracurricular</span>
                      <span className="font-bold">{profile.pointsBreakdown?.achievement || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                      <span className="text-gray-500 font-medium">Hard Skills</span>
                      <span className="font-bold">{profile.pointsBreakdown?.hardSkills || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm pb-1">
                      <span className="text-gray-500 font-medium">Soft Skills</span>
                      <span className="font-bold">{profile.pointsBreakdown?.softSkills || 0}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 bg-gray-50/50 -mx-5 -mb-5 p-4 rounded-b-[24px]">
                    <p className="text-xs text-center text-gray-400 font-medium leading-relaxed">
                      Math: (Acad * 30%) + (Cert * 20%) + (Hard * 20%) + (Soft * 10%) + (Extra * 10%) + (Accum * 10%)
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-gray-50/50 p-1.5 rounded-full border border-gray-100 max-w-2xl overflow-x-auto hide-scrollbar">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'skills', label: 'Calculated Skill Graph' },
            { id: 'roadmap', label: 'Smart Career Roadmap' },
            { id: 'certifications', label: 'Certifications' },
            { id: 'resume', label: 'AI Resume' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative flex-1 px-4 py-3 text-sm font-bold tracking-tight rounded-full transition-colors whitespace-nowrap ${
                activeTab === tab.id ? 'text-black' : 'text-gray-500 hover:text-black'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white shadow-sm border border-gray-100 rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Tab Content Area */}
        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">
            
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {/* Academic Transcripts */}
                <Card className="rounded-[32px] shadow-sm border-gray-100">
                  <CardHeader>
                    <CardTitle className="text-xl">Academic Transcripts</CardTitle>
                    <CardDescription>Mapped historically from your University.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {profile.academicRecords.slice(0, 6).map((r: any, i: number) => (
                        <div key={i} className="flex justify-between items-center bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
                          <span className="text-gray-900 font-bold truncate mr-4">{r.subject}</span>
                          <span className="px-3 py-1 bg-white border border-gray-100 rounded-full font-black text-brand-blue shadow-sm">
                            {r.grade}
                          </span>
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

                {/* Accumulations Tracker */}
                {(() => {
                  const studentName = profile?.basicInfo ? `${profile.basicInfo.firstName} ${profile.basicInfo.lastName}`.trim() : ''
                  const myAccums = accumulations.filter(a =>
                    a.participantList?.some((p: any) => p.name === studentName)
                  )
                  const inProgress = myAccums.filter(a =>
                    a.participantList?.find((p: any) => p.name === studentName)?.status === 'In Progress'
                  )
                  const completed = myAccums.filter(a =>
                    a.participantList?.find((p: any) => p.name === studentName)?.status === 'Completed'
                  )

                  return (
                    <Card className="rounded-[32px] shadow-2xl border-none bg-zinc-950 text-white h-fit overflow-hidden relative group">
                      {/* Decorative gradient blur */}
                      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 blur-[80px] rounded-full group-hover:bg-blue-600/20 transition-all duration-700" />
                      
                      <CardHeader className="relative z-10">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-2xl font-black text-white tracking-tight">Your Path Track</CardTitle>
                            <CardDescription className="text-zinc-500 font-medium mt-1">
                              {myAccums.length === 0
                                ? 'No accumulations yet. Start your journey.'
                                : `${completed.length} Milestones Reached · ${inProgress.length} Active`}
                            </CardDescription>
                          </div>
                          <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                            <Layers className="w-5 h-5 text-blue-400" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-8 space-y-4 relative z-10">
                        {myAccums.length === 0 ? (
                          <div className="space-y-6">
                            <p className="text-zinc-400 leading-relaxed text-sm">
                              Participate in real-world technical bounties, hackathons, and design sprints hosted directly by partner companies and your school to boost your Skill Graph.
                            </p>
                            <a href="/dashboard/student/accumulations" className="block">
                              <Button className="rounded-2xl bg-white text-black hover:bg-zinc-200 w-full h-12 font-bold group transition-all">
                                Browse Challenges <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                              </Button>
                            </a>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {inProgress.length > 0 && (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">In Progress</p>
                                  <div className="h-px bg-zinc-800 flex-1 ml-4" />
                                </div>
                                {inProgress.map((a: any) => (
                                  <div key={a._id} className="group/item flex items-center justify-between bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-[20px] px-4 py-3.5 transition-all">
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] flex-shrink-0" />
                                      <p className="text-sm font-bold text-zinc-200 truncate">{a.title}</p>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0 ml-3">
                                      <span className="text-xs font-black text-blue-400">+{a.points}</span>
                                      <span className="text-[10px] px-2 py-0.5 rounded-lg bg-white/5 text-zinc-500 font-bold border border-white/5">{a.type}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {completed.length > 0 && (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Successes</p>
                                  <div className="h-px bg-zinc-800 flex-1 ml-4" />
                                </div>
                                {completed.map((a: any) => (
                                  <div key={a._id} className="flex items-center justify-between bg-emerald-500/[0.03] border border-emerald-500/10 rounded-[20px] px-4 py-3.5">
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                        <CheckCircle className="w-2.5 h-2.5 text-emerald-500" />
                                      </div>
                                      <p className="text-sm font-bold text-zinc-300 truncate">{a.title}</p>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0 ml-3">
                                      <span className="text-xs font-black text-emerald-400">+{a.points}</span>
                                      <span className="text-[10px] px-2 py-0.5 rounded-lg bg-emerald-500/5 text-emerald-500/40 font-bold border border-emerald-500/5 uppercase tracking-tighter">Done</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            <a href="/dashboard/student/accumulations" className="block pt-2">
                              <Button variant="outline" className="rounded-2xl border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 hover:border-white/20 w-full font-bold h-11 transition-all">
                                View Full Dashboard <ChevronRight className="w-4 h-4 ml-1" />
                              </Button>
                            </a>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })()}
              </motion.div>
            )}

            {/* TAB 2: SKILL GRAPH */}
            {activeTab === 'skills' && (
              <motion.div
                key="skills"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="rounded-[32px] shadow-sm border-gray-100 overflow-hidden">
                  <CardHeader className="bg-gray-50/50">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Network className="w-5 h-5 text-gray-400" />
                      Calculated Skill Graph
                    </CardTitle>
                    <CardDescription>Visual map calculated strictly from your validated {profile.skillTags.length} abilities.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row h-auto md:h-[450px]">
                      {/* Left: Recharts SVG Hexagon */}
                      <div className="w-full md:w-[55%] h-80 md:h-full p-4 relative flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="90%">
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
                      </div>
                      
                      {/* Right: Scrollable Breakdown Panel with Accordion */}
                      <div className="w-full md:w-[45%] h-[350px] md:h-full border-t md:border-t-0 md:border-l border-gray-100 bg-gray-50/30 overflow-y-auto">
                        <div className="p-6 space-y-4">
                          {radarData.map((node, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300">
                              <button 
                                onClick={() => setOpenNode(openNode === i ? null : i)}
                                className="w-full text-left p-4 flex justify-between items-center group hover:bg-gray-50/80 transition-colors"
                              >
                                <div>
                                  <span className="text-sm font-bold text-gray-900 tracking-wider flex items-center gap-2">
                                    {node.subject}
                                    {openNode === i ? 
                                      <ChevronUp className="w-4 h-4 text-gray-400" /> : 
                                      <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
                                    }
                                  </span>
                                  <p className="text-xs text-gray-500 leading-relaxed font-medium mt-1">
                                    {node.desc}
                                  </p>
                                </div>
                                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-black shrink-0">
                                  {node.score} PTS
                                </span>
                              </button>
                              
                              <AnimatePresence>
                                {openNode === i && node.details && node.details.length > 0 && (
                                  <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="px-4 pb-4 pt-2 border-t border-gray-50 bg-gray-50/50"
                                  >
                                    <div className="flex flex-col gap-2">
                                      {node.details.map((dt: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center w-full bg-white px-3 py-2 rounded-lg border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                          <span className="text-xs font-bold text-gray-800 capitalize truncate max-w-[150px]">{dt.label}</span>
                                          <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest bg-blue-100/50 px-2 py-1 rounded">
                                            {dt.value}
                                          </span>
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

            {/* TAB 3: SMART CAREER ROADMAP */}
            {activeTab === 'roadmap' && (
              <motion.div
                key="roadmap"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                {profile.careerRoadmap ? (
                  <Card className="rounded-[32px] shadow-sm border-blue-200 bg-gradient-to-br from-blue-50/50 to-white overflow-hidden">
                    <CardHeader className="p-8">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
                        <div>
                          <CardTitle className="text-2xl text-black flex items-center gap-2 mb-2">
                            <Network className="w-6 h-6 text-blue-600" />
                            Smart Career Roadmap
                          </CardTitle>
                          <CardDescription className="text-base">
                            Algorithmically calculated using {profile.skillTags.length} dynamic capability strings to forge your fastest route to hire.
                          </CardDescription>
                        </div>
                        <div className="md:text-right bg-white p-4 rounded-2xl border border-blue-100 shadow-sm min-w-[200px]">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Target Role</p>
                          <p className="text-xl font-black text-blue-600 leading-tight">{profile.careerRoadmap.targetRole}</p>
                          <div className="mt-2 w-full bg-blue-50 h-2 rounded-full overflow-hidden">
                            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${profile.careerRoadmap.matchPercentage}%` }} />
                          </div>
                          <p className="text-[10px] font-bold text-blue-800 mt-2 tracking-widest uppercase">
                            {profile.careerRoadmap.matchPercentage}% Match Alignment
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="px-8 pb-8">
                      <div className="space-y-4">
                        {profile.careerRoadmap.roadmap.map((step: any, i: number) => (
                          <div key={i} className="flex gap-6 p-6 bg-white rounded-[24px] border border-gray-100 shadow-sm relative group hover:-translate-y-1 transition-transform">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xl z-10 shadow-lg shadow-blue-600/20">
                              {step.step}
                            </div>
                            {i !== profile.careerRoadmap.roadmap.length - 1 && (
                              <div className="absolute left-12 top-16 bottom-[-24px] w-[3px] bg-blue-100 group-hover:bg-blue-200 transition-colors" />
                            )}
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
                    <p className="text-gray-500 font-medium">Roadmap engine is currently calibrating your metrics.</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 4: CERTIFICATIONS & UPLOADS */}
            {activeTab === 'certifications' && (
              <motion.div
                key="certifications"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {/* Visual Validations Log */}
                <Card className="rounded-[32px] shadow-sm border-gray-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Award className="w-5 h-5 text-brand-orange" />
                      Valid Certifications
                    </CardTitle>
                    <CardDescription>Documents historically analyzed by the AI engine.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profile.certifications.length === 0 && (
                      <p className="text-sm text-gray-500 italic">No certificates attached yet.</p>
                    )}
                    {profile.certifications.map((cert: any, i: number) => (
                      <div key={i} className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors rounded-2xl p-4 border border-gray-100">
                        <div className="overflow-hidden pr-4">
                          <p className="text-sm font-bold text-gray-900 truncate flex items-center gap-2">
                            {cert.fileName}
                            {cert.verified && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                          </p>
                          <p className="text-xs text-brand-blue font-medium mt-1 line-clamp-1 italic">
                            &quot;{cert.ocrText}&quot;
                          </p>
                        </div>
                        {cert.fileData && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-10 w-10 bg-white shadow-sm border border-gray-100 rounded-full text-gray-400 hover:text-brand-blue shrink-0">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-transparent border-0 rounded-[24px]">
                              <Image src={cert.fileData} alt={cert.fileName} width={800} height={600} className="w-full h-auto object-contain bg-black/90 backdrop-blur-xl" unoptimized />
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Secure File Upload Zone */}
                <Card className="rounded-[32px] shadow-sm border-brand-blue/20 bg-blue-50/30 overflow-hidden h-fit relative text-center">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">Upload New Artifact</CardTitle>
                    <CardDescription>Process external validation continuously.</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-8 space-y-4">
                    
                    {/* UI Rejection Banner */}
                    <AnimatePresence>
                      {uploadError && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="bg-red-50 border border-red-100 text-red-800 p-4 rounded-2xl flex items-start gap-3 shadow-sm text-left mb-2">
                            <ShieldAlert className="w-5 h-5 mt-0.5 shrink-0 text-red-600" />
                            <p className="text-sm font-medium leading-relaxed">{uploadError}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="border-2 border-dashed border-blue-200 bg-white rounded-3xl p-8 hover:border-blue-400 transition-colors relative">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileUpload} 
                        disabled={uploadingCert}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                      />
                      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-blue">
                        {uploadingCert ? (
                          <Loader2 className="w-8 h-8 animate-spin" />
                        ) : (
                          <UploadCloud className="w-8 h-8" />
                        )}
                      </div>
                      <h3 className="font-bold mb-2">
                        {uploadingCert ? 'Xenova AI Processing...' : 'Tap to select an image'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        We will run an exact Zero-Shot pipeline classification over your document to augment your Smart Roadmap right now.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* TAB 5: AI RESUME BUILDER */}
            {activeTab === 'resume' && (
              <motion.div
                key="resume"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="print:mt-0 print:p-0"
              >
                <Card className="rounded-[32px] shadow-sm border-gray-100 overflow-hidden bg-white print:border-none print:shadow-none">
                  <CardHeader className="bg-gray-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 print:hidden border-b border-gray-100">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <FileText className="w-5 h-5 text-gray-400" />
                        AI Resume Builder
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Utilizing LLM Intelligence to dynamically format your ATS-compliant sheet.
                      </CardDescription>
                    </div>
                    <div className="flex gap-2 mt-4 sm:mt-0 no-print">
                      <Button onClick={handleGenerateResume} disabled={generatingResume} variant="secondary" className="font-bold rounded-xl shadow-sm bg-gray-100 hover:bg-gray-200 text-black">
                        {generatingResume ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2 text-blue-600" />}
                        {resumeText ? 'Regenerate via AI' : 'Generate via AI'}
                      </Button>
                      {resumeText && (
                        <>
                          <Button 
                            onClick={() => setIsEditingResume(!isEditingResume)} 
                            variant="outline" 
                            className="font-bold rounded-xl shadow-sm border-gray-200"
                          >
                            {isEditingResume ? <Eye className="w-4 h-4 mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
                            {isEditingResume ? 'Preview' : 'Edit Mode'}
                          </Button>
                          <Button onClick={handleSaveResume} disabled={savingResume} className="font-bold rounded-xl shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white">
                            {savingResume ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Save
                          </Button>
                          <Button onClick={() => window.print()} variant="outline" className="font-bold rounded-xl shadow-sm border-gray-200">
                            <Download className="w-4 h-4 mr-2 text-gray-600" />
                            PDF
                          </Button>
                        </>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 bg-gray-100/30 print:bg-white print:p-0">
                    {resumeText ? (
                      <div className="w-full min-h-[600px] md:min-h-[800px] p-4 md:p-8 print:p-0 print:m-0 resume-print-container">
                        {isEditingResume ? (
                          <textarea 
                            value={resumeText}
                            onChange={(e) => setResumeText(e.target.value)}
                            className="w-full h-[600px] md:h-[800px] p-8 md:p-12 border border-gray-200 rounded-[24px] shadow-sm font-mono text-sm leading-relaxed resize-none focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-300 transition-all font-mono"
                            placeholder="Your ATS-friendly markdown resume will appear here..."
                          />
                        ) : (
                          <div className="bg-white shadow-xl rounded-[24px] p-10 md:p-16 border border-gray-100 print:shadow-none print:border-none print:p-0 print:rounded-none">
                            <div className="max-w-[800px] mx-auto space-y-8 font-sans text-gray-800 printable-resume text-left">
                              {/* Resume Header - ATS Professional Style */}
                              <div className="text-center space-y-2 border-b-2 border-gray-900 pb-6 mb-8">
                                <h1 className="text-4xl font-serif font-bold text-black tracking-tight brightness-50">
                                  {profile.basicInfo.firstName} {profile.basicInfo.lastName}
                                </h1>
                                <div className="text-sm font-semibold text-gray-600 flex justify-center divide-x divide-gray-300 gap-3">
                                  <span className="px-3 tracking-wide">{profile.basicInfo.course}</span>
                                  <span className="px-3">{profile.basicInfo.studentId}</span>
                                  <span className="px-3">{profile.status === 'VERIFIED' ? 'Verified Target' : 'Student'}</span>
                                </div>
                              </div>

                              {/* Advanced Markdown Parser/Renderer for ATS look */}
                              <div className="space-y-6 text-[15px] leading-relaxed text-left">
                                {(() => {
                                  // Helper to strip and style inline markdown like **bold**
                                  const formatLine = (text: string) => {
                                    const parts = text.split(/(\*\*.*?\*\*)/g);
                                    return parts.map((part, i) => {
                                      if (part.startsWith('**') && part.endsWith('**')) {
                                        return <strong key={i} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
                                      }
                                      return part;
                                    });
                                  };

                                  const lines = resumeText.split('\n');
                                  // Skip the first few lines if they appear to be a header (Name/Contact info)
                                  // to avoid duplication with the professional UI header we added.
                                  let skipHeader = true;

                                  return lines.reduce((acc: any[], line, idx) => {
                                    const trimmed = line.trim();
                                    if (!trimmed) return acc;

                                    // If we are still in "skip mode", check if this is the end of the header
                                    // Usually the first section starts with ##
                                    if (skipHeader) {
                                      if (trimmed.startsWith('## ')) {
                                        skipHeader = false;
                                      } else {
                                        return acc; // Skip this line
                                      }
                                    }

                                    // Header Selection (##)
                                    if (trimmed.startsWith('## ')) {
                                      acc.push(
                                        <h2 key={idx} className="text-lg font-bold tracking-wide text-black border-b border-gray-200 pb-1 mt-8 mb-4">
                                          {trimmed.replace('## ', '')}
                                        </h2>
                                      );
                                    }
                                    // Bullet points
                                    else if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                                      const prev = acc[acc.length - 1];
                                      const content = formatLine(trimmed.replace(/^[*\-]\s+/, ''));
                                      
                                      if (prev && prev.type === 'ul') {
                                        prev.props.children.push(<li key={idx} className="pl-1 font-normal text-gray-700">{content}</li>);
                                      } else {
                                        acc.push(
                                          <ul key={idx} className="space-y-2 pl-4 list-disc marker:text-black mt-2">
                                            {[<li key={idx} className="pl-1 font-normal text-gray-700">{content}</li>]}
                                          </ul>
                                        );
                                      }
                                    }
                                    // Normal Paragraph
                                    else {
                                      acc.push(
                                        <p key={idx} className="text-gray-700 font-normal leading-relaxed">
                                          {formatLine(trimmed)}
                                        </p>
                                      );
                                    }
                                    return acc;
                                  }, []);
                                })()}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (

                      <div className="w-full h-[500px] flex flex-col items-center justify-center text-center p-8 bg-white/50">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                          {generatingResume ? (
                            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                          ) : (
                            <FileText className="w-10 h-10 text-blue-600" />
                          )}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          {generatingResume ? 'AI Resume Builder is writing your resume...' : 'No Resume Generated Yet'}
                        </h3>
                        <p className="text-gray-500 max-w-md mx-auto leading-relaxed font-medium">
                          {generatingResume 
                            ? 'Gemini Cloud AI is mapping your exact School Certifications, Skill Graph Points, and Activity into a structured Applicant Tracking System standard.'
                            : 'Let our Cloud-powered LLM automatically extract your real skills, validated artifacts, and academic records to write the perfect foundational bullet points for you.'}
                        </p>
                        {!generatingResume && (
                          <Button onClick={handleGenerateResume} className="mt-8 font-bold text-white bg-blue-600 hover:bg-blue-700 px-8 py-6 rounded-full shadow-lg shadow-blue-600/20 text-md group">
                            <RefreshCw className="w-5 h-5 mr-3 group-hover:rotate-180 transition-transform duration-700" />
                            Construct ATS Resume Now
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </motion.div>

      {/* Validation Gate Modal */}
      <AnimatePresence>
        {showLockedModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowLockedModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-[32px] p-8 max-w-sm w-full relative z-10 shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-center mb-2">Feature Locked</h2>
              <p className="text-gray-500 text-center text-sm leading-relaxed mb-8">
                Your profile is currently <span className="font-bold text-black">Under Evaluation</span>. 
                You cannot interact with Company Challenges or Accumulations until your School Administration verifies your artifacts.
              </p>
              <Button 
                onClick={() => setShowLockedModal(false)}
                className="w-full rounded-full h-12 font-bold"
              >
                Understood
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </DashboardLayout>
  )
}
