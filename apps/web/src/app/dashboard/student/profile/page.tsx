"use client"

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { apiClient } from '@/lib/apiClient'
import { Button } from '@/components/ui/button'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Loader2, ShieldCheck, ShieldAlert, BadgeInfo, Network, Award, LayoutDashboard, Users, Settings, HelpCircle, ChevronRight, Eye } from 'lucide-react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'

// We force generic student navigation
const studentNavigation = [
  { name: "Dashboard", href: "/dashboard/student", icon: LayoutDashboard },
  { name: "My Profile", href: "/dashboard/student/profile", icon: Users },
  { name: "Settings", href: "/dashboard/student/settings", icon: Settings },
]

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // State for the locked modal
  const [showLockedModal, setShowLockedModal] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await apiClient.get('/profile/me')
        setProfile(data.data)
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
      alert('Action fully unlocked!')
    }
  }

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
  const academicScore = profile.pointsBreakdown?.academic || 0;
  const certScore = profile.pointsBreakdown?.cert || 0;
  const extraScore = profile.pointsBreakdown?.achievement || 0;
  const accumulationsScore = 0; // Currently 0, locked behind Company Challenges
  
  // Deriving Hard Skills vs Soft Skills from Tags explicitly for visual mapping context
  const isSoftSkill = (tag: string) => ['leadership', 'agile', 'scrum', 'communication', 'teamwork'].includes(tag.toLowerCase());
  const hardSkillsCount = profile.skillTags.filter((t: string) => !isSoftSkill(t)).length;
  const softSkillsCount = profile.skillTags.filter((t: string) => isSoftSkill(t)).length;
  
  const hardSkillsScore = profile.pointsBreakdown?.hardSkills || 0; 
  const softSkillsScore = profile.pointsBreakdown?.softSkills || 0; 

  const radarData = [
    { 
      subject: 'ACADEMICS', 
      score: academicScore, 
      desc: `Exact Grade Points (Max 40): ${academicScore} PTS from synced records.` 
    },
    { 
      subject: 'CERTIFICATIONS', 
      score: certScore, 
      desc: `Exact Certificate Points (Max 30): ${certScore} PTS derived from completed AI validations.` 
    },
    { 
      subject: 'ACCUMULATIONS', 
      score: accumulationsScore, 
      desc: `Current Value: ${accumulationsScore} PTS. Complete institutional verification to unlock Company Challenges.` 
    },
    { 
      subject: 'EXTRACURRICULAR', 
      score: extraScore, 
      desc: `Exact Extracurricular Points (Max 20): ${extraScore} PTS.` 
    },
    { 
      subject: 'HARD SKILLS', 
      score: hardSkillsScore, 
      desc: `Exact Technical Points (Max 20): ${hardSkillsScore} PTS mapped from ${hardSkillsCount} explicit technical keywords.` 
    },
    { 
      subject: 'SOFT SKILLS', 
      score: softSkillsScore, 
      desc: `Exact Interpersonal Points (Max 10): ${softSkillsScore} PTS mapped from ${softSkillsCount} abstract behavioural tags.` 
    },
  ];

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
              {profile.skillTags.map((tag: string) => (
                <span key={tag} className="px-3 py-1 bg-black text-white text-xs font-semibold rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
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

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Skill Tree (Mock View) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-[32px] shadow-sm border-gray-100 overflow-hidden">
              <CardHeader className="bg-gray-50/50">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Network className="w-5 h-5 text-gray-400" />
                  Calculated Skill Graph
                </CardTitle>
                <CardDescription>Visual map of your mapped academic and AI-certified tags.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row h-auto md:h-80">
                  {/* Left: Recharts SVG Hexagon */}
                  <div className="w-full md:w-3/5 h-72 md:h-full p-4 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid stroke="#E5E7EB" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#6B7280', fontSize: 10, fontWeight: 700 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                        <Radar
                          name="Competency"
                          dataKey="score"
                          stroke="#007AFF"
                          fill="#007AFF"
                          fillOpacity={0.15}
                          strokeWidth={2}
                          dot={{ r: 3, fill: '#007AFF', strokeWidth: 2 }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Right: Scrollable Breakdown Panel spanning full height */}
                  <div className="w-full md:w-2/5 h-64 md:h-full border-t md:border-t-0 md:border-l border-gray-100 bg-gray-50/30 overflow-y-auto">
                    <div className="p-5 space-y-4">
                      {radarData.map((node, i) => (
                        <div key={i} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-gray-900 tracking-wider">{node.subject}</span>
                            <span className="text-xs font-black text-brand-blue">{node.score} PTS</span>
                          </div>
                          <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                            {node.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[32px] shadow-sm border-gray-100 overflow-hidden">
              <CardHeader className="bg-gray-50/50 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-black">Company Accumulations</CardTitle>
                  <CardDescription>Locked behind institutional verification.</CardDescription>
                </div>
                <Button variant="outline" onClick={handleRestrictedAction} className="rounded-full">
                  Browse Challenges
                </Button>
              </CardHeader>
            </Card>
          </div>

          {/* Sidebar Modules */}
          <div className="space-y-6">
            {/* Certifications & Badges */}
            <Card className="rounded-[32px] shadow-sm border-gray-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Award className="w-5 h-5 text-gray-400" />
                  Valid Certifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.certifications.length === 0 && (
                  <p className="text-sm text-gray-500 italic">No certificates attached during onboarding.</p>
                )}
                {profile.certifications.map((cert: any, i: number) => (
                  <div key={i} className="flex justify-between items-center bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-gray-900 truncate">{cert.fileName}</p>
                      <p className="text-xs text-brand-blue font-medium mt-1 line-clamp-1 italic max-w-[200px]">
                        &quot;{cert.ocrText}&quot;
                      </p>
                    </div>
                    {cert.fileData && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-brand-blue shrink-0">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-transparent border-0 rounded-[24px]">
                          <img src={cert.fileData} alt={cert.fileName} className="w-full h-auto object-contain bg-black/90 backdrop-blur-xl" />
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
            
            <Card className="rounded-[32px] shadow-sm border-gray-100">
              <CardHeader>
                <CardTitle className="text-lg">Academic Transcripts</CardTitle>
                <CardDescription>Mapped by University</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profile.academicRecords.slice(0, 4).map((r: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 truncate mr-2">{r.subject}</span>
                      <span className="font-bold">{r.grade}</span>
                    </div>
                  ))}
                  {profile.academicRecords.length > 4 && (
                    <div className="text-center pt-2">
                      <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">+{profile.academicRecords.length - 4} More</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>
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
