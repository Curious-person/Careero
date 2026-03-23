"use client"

import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { apiClient } from '@/lib/apiClient'
import { AnimatePresence, motion } from 'framer-motion'
import {
    AlarmClock,
    ArrowLeft,
    Award,
    BookOpen,
    Briefcase,
    Building2,
    CalendarDays,
    CheckCircle,
    ChevronRight,
    Clock,
    ExternalLink,
    GraduationCap,
    Layers, LayoutDashboard,
    ListChecks,
    Loader2,
    School,
    Star,
    Target,
    TrendingUp,
    Trophy,
    UserPlus,
    Users,
    X,
    Zap
} from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

// ─── Types ────────────────────────────────────────────────────────────────
interface Participant { name: string; course: string; status: 'In Progress' | 'Completed' }
interface Accumulation {
  _id: string
  title: string
  type: 'Task' | 'Challenge' | 'Course' | 'Event'
  source: 'school' | 'company'
  field: string
  courses: string[]
  deadline: string
  duration: string
  points: number
  status: 'Active' | 'Closing Soon' | 'Ended'
  description: string
  skillTags: string[]
  resourceLink?: string
  objectives: string[]
  inCharge: { name: string; role: string; email: string }[]
  participantList: Participant[]
  challenges?: { title: string; description: string }[]
  modules?: { title: string; description: string }[]
  agenda?: { time: string; activity: string }[]
  tasks?: { title: string; description: string }[]
  participants: number
}

// ─── Nav ──────────────────────────────────────────────────────────────────
const studentNavigation = [
  { name: 'Overview', href: '/dashboard/student', icon: LayoutDashboard },
  { name: 'Accumulations', href: '/dashboard/student/accumulations', icon: Layers },
  { name: 'Offers', href: '/dashboard/student/offers', icon: Briefcase },
  { name: 'My Profile', href: '/dashboard/student/profile', icon: Users },
]

// ─── Helpers ──────────────────────────────────────────────────────────────
const typeIcon = (type: string) => {
  if (type === 'Challenge') return Trophy
  if (type === 'Course') return BookOpen
  if (type === 'Event') return CalendarDays
  return CheckCircle
}
const typeColor = (t: string) => {
  if (t === 'Challenge') return 'bg-orange-100 text-orange-700'
  if (t === 'Course') return 'bg-blue-100 text-blue-700'
  if (t === 'Event') return 'bg-purple-100 text-purple-700'
  return 'bg-gray-100 text-gray-700'
}
const statusColor = (s: string) => {
  if (s === 'Active') return 'bg-green-100 text-green-700'
  if (s === 'Closing Soon') return 'bg-amber-100 text-amber-800'
  return 'bg-gray-100 text-gray-500'
}

// ─── Countdown Hook ───────────────────────────────────────────────────────
function useCountdown(deadline: string) {
  const calc = useCallback(() => {
    const end = new Date(deadline).getTime()
    const now = Date.now()
    const diff = Math.max(0, end - now)
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
      expired: diff === 0,
    }
  }, [deadline])

  const [time, setTime] = useState(calc)

  useEffect(() => {
    const t = setInterval(() => setTime(calc()), 1000)
    return () => clearInterval(t)
  }, [calc])

  return time
}

// ─── Active Accumulation Full-Page View ───────────────────────────────────
function ActiveAccumulationView({
  accum,
  studentName,
  onBack,
  onComplete,
}: {
  accum: Accumulation
  studentName: string
  onBack: () => void
  onComplete: (id: string) => Promise<void>
}) {
  const [completing, setCompleting] = useState(false)
  const [checked, setChecked] = useState<Record<number, boolean>>({})
  const countdown = useCountdown(accum.deadline)
  const TypeIcon = typeIcon(accum.type)

  const myParticipant = accum.participantList.find(p => p.name === studentName)
  const isCompleted = myParticipant?.status === 'Completed'

  // Build checklist items from type-specific content
  const checklistItems: string[] = []
  if (accum.type === 'Challenge' && accum.challenges?.length)
    accum.challenges.forEach(c => checklistItems.push(c.title))
  else if (accum.type === 'Course' && accum.modules?.length)
    accum.modules.forEach(m => checklistItems.push(m.title))
  else if (accum.type === 'Task' && accum.tasks?.length)
    accum.tasks.forEach(t => checklistItems.push(t.title))
  else if (accum.type === 'Event' && accum.agenda?.length)
    accum.agenda.forEach(a => checklistItems.push(a.activity))
  else
    // fallback: use objectives or generic "Complete the accumulation"
    accum.objectives?.forEach(o => checklistItems.push(o))

  if (checklistItems.length === 0) checklistItems.push('Complete the accumulation')

  const totalChecked = Object.values(checked).filter(Boolean).length
  const allChecked = totalChecked === checklistItems.length
  const progress = Math.round((totalChecked / checklistItems.length) * 100)

  const handleComplete = async () => {
    setCompleting(true)
    await onComplete(accum._id)
    setCompleting(false)
  }


  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.35 }}
      className="max-w-7xl mx-auto space-y-6 pb-12"
    >
      {/* Top Bar */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-bold text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Accumulations
        </button>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${typeColor(accum.type)}`}>
          <TypeIcon className="w-3.5 h-3.5" />{accum.type}
        </div>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${statusColor(accum.status)}`}>{accum.status}</span>
        {isCompleted && (
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Completed
          </span>
        )}
      </div>

      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 leading-tight">{accum.title}</h1>
        <p className="text-gray-500 mt-2 max-w-2xl leading-relaxed">{accum.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Checklist + Content ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress bar */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-blue-500" />
                <h2 className="text-base font-bold text-gray-900">Your Progress</h2>
              </div>
              <span className="text-sm font-black text-blue-600">{totalChecked}/{checklistItems.length} done</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mb-2">
              <motion.div
                className="h-full bg-blue-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <p className="text-xs text-gray-400">{progress}% complete</p>
          </div>

          {/* Checklist */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 space-y-3">
            <h2 className="text-base font-bold text-gray-900 mb-4">
              {accum.type === 'Course' ? 'Modules' : accum.type === 'Event' ? 'Agenda Items' : accum.type === 'Challenge' ? 'Challenges' : 'Tasks'}
            </h2>
            {checklistItems.map((item, i) => (
              <motion.div
                key={i}
                whileTap={{ scale: 0.98 }}
                onClick={() => !isCompleted && setChecked(prev => ({ ...prev, [i]: !prev[i] }))}
                className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                  checked[i]
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50/60 border-gray-100 hover:border-blue-200 hover:bg-blue-50/30'
                } ${isCompleted ? 'cursor-default' : ''}`}
              >
                <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  checked[i] ? 'bg-green-500 border-green-500' : 'border-gray-300'
                }`}>
                  {checked[i] && <CheckCircle className="w-3 h-3 text-white fill-white" />}
                </div>
                <span className={`text-sm font-medium leading-relaxed ${checked[i] ? 'text-green-700 line-through' : 'text-gray-700'}`}>
                  {item}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Objectives */}
          {accum.objectives?.length > 0 && (
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" /> Learning Objectives
              </h2>
              <ul className="space-y-2">
                {accum.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <ChevronRight className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />{obj}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Resource Link */}
          {accum.resourceLink && (
            <a href={accum.resourceLink} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors p-2">
              <ExternalLink className="w-4 h-4" /> View Resource / Reference Material
            </a>
          )}

          {/* Complete CTA */}
          {!isCompleted && (
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
              {!allChecked && (
                <p className="text-xs text-amber-600 bg-amber-50 px-4 py-2 rounded-xl inline-flex items-center gap-2 mb-4 border border-amber-100">
                  <AlarmClock className="w-3.5 h-3.5" />
                  Mark all items above as done before completing
                </p>
              )}
              <Button
                onClick={handleComplete}
                disabled={completing}
                className={`w-full h-14 rounded-2xl text-white font-bold text-base transition-all ${
                  allChecked
                    ? 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {completing
                  ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Recording Completion...</>
                  : <><Award className="w-5 h-5 mr-2" /> Complete & Earn +{accum.points} Points</>}
              </Button>
            </div>
          )}

          {isCompleted && (
            <div className="flex items-center gap-4 p-6 bg-green-50 rounded-[24px] border border-green-200">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <Trophy className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-black text-green-700">Accumulation Completed!</p>
                <p className="text-sm text-green-600">You earned +{accum.points} points and new skill tags.</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Countdown + Metadata ── */}
        <div className="space-y-6">
          {/* Countdown Timer */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlarmClock className={`w-5 h-5 ${countdown.expired ? 'text-red-500' : 'text-amber-500'}`} />
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">
                {countdown.expired ? 'Deadline Passed' : 'Time Remaining'}
              </h3>
            </div>
            {countdown.expired ? (
              <p className="text-red-500 font-bold text-sm">This accumulation&apos;s deadline has passed.</p>
            ) : (
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { val: countdown.days, label: 'Days' },
                  { val: countdown.hours, label: 'Hrs' },
                  { val: countdown.minutes, label: 'Min' },
                  { val: countdown.seconds, label: 'Sec' },
                ].map(({ val, label }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-2xl font-black text-gray-900 tabular-nums">{Pad(val)}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-400 mt-3">Deadline: {accum.deadline}</p>
          </div>

          {/* Rewards */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" /> Rewards
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Star className="w-5 h-5 text-blue-600 fill-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold">Skill Points</p>
                <p className="text-2xl font-black text-blue-600">+{accum.points} <span className="text-sm">PTS</span></p>
              </div>
            </div>
            {accum.skillTags.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 font-semibold mb-2">Skill Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {accum.skillTags.map(tag => (
                    <span key={tag} className="text-xs font-bold px-2.5 py-1 rounded-full bg-black text-white">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 space-y-3">
            {[
              { icon: Clock, label: 'Duration', value: accum.duration },
              { icon: Users, label: 'Participants', value: `${accum.participants}` },
              { icon: accum.source === 'school' ? School : Building2, label: 'Source', value: accum.source === 'school' ? 'School' : 'Company' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  <Icon className="w-3.5 h-3.5" />{label}
                </div>
                <p className="text-sm font-bold text-gray-700">{value}</p>
              </div>
            ))}
          </div>

          {/* In Charge */}
          {accum.inCharge?.length > 0 && (
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <GraduationCap className="w-3.5 h-3.5" /> Coordinators
              </h3>
              <div className="space-y-2">
                {accum.inCharge.map((p, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-black flex-shrink-0">
                      {p.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">{p.name}</p>
                      <p className="text-xs text-gray-400 truncate">{p.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )

  // helper inside component
  function Pad(n: number) { return String(n).padStart(2, '0') }
}

// ─── Main Page ────────────────────────────────────────────────────────────
function StudentAccumulationsPageContent() {
  const searchParams = useSearchParams()
  const targetId = searchParams.get('id')

  const [accumulations, setAccumulations] = useState<Accumulation[]>([])
  const [loading, setLoading] = useState(true)
  const [studentName, setStudentName] = useState('')
  const [studentCourse, setStudentCourse] = useState('')
  const [activeTab, setActiveTab] = useState<'available' | 'in-progress' | 'completed'>('available')
  const [filter, setFilter] = useState<string>('All')
  const [activeView, setActiveView] = useState<Accumulation | null>(null)
  const [selectedAccumForDrawer, setSelectedAccumForDrawer] = useState<Accumulation | null>(null)
  const [joiningId, setJoiningId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [accumRes, profileRes] = await Promise.all([
        apiClient.get('/accumulations/student/available'),
        apiClient.get('/profile/me'),
      ])
      setAccumulations(accumRes.data.data || [])
      setStudentCourse(accumRes.data.studentCourse || '')
      const profile = profileRes.data?.data
      if (profile) {
        setStudentName(`${profile.basicInfo?.firstName} ${profile.basicInfo?.lastName}`.trim())
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load accumulations.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Keep activeView in sync after refresh
  useEffect(() => {
    if (activeView) {
      const refreshed = accumulations.find(a => a._id === activeView._id)
      if (refreshed) setActiveView(refreshed)
    }
  }, [accumulations, activeView])

  const getParticipantStatus = useCallback((accum: Accumulation) =>
    accum.participantList.find(p => p.name === studentName)?.status, [studentName])

  // Handle auto-opening from URL params (e.g. from Profile page)
  useEffect(() => {
    if (targetId && accumulations.length > 0 && !loading && studentName) {
      const target = accumulations.find(a => a._id === targetId)
      if (target) {
        const status = getParticipantStatus(target)
        if (status === 'In Progress' || status === 'Completed') {
          setActiveView(target)
          setActiveTab(status === 'In Progress' ? 'in-progress' : 'completed')
        } else {
          setSelectedAccumForDrawer(target)
          setActiveTab('available')
        }
      }
    }
  }, [targetId, accumulations, loading, studentName, getParticipantStatus])

  const filtered = accumulations.filter(a => {
    if (filter !== 'All' && a.type !== filter) return false
    const status = getParticipantStatus(a)
    if (activeTab === 'in-progress') return status === 'In Progress'
    if (activeTab === 'completed') return status === 'Completed'
    return !status
  })

  const availableCount = accumulations.filter(a => !getParticipantStatus(a)).length
  const inProgressCount = accumulations.filter(a => getParticipantStatus(a) === 'In Progress').length
  const completedCount = accumulations.filter(a => getParticipantStatus(a) === 'Completed').length

  const handleJoin = async (id: string) => {
    try {
      setJoiningId(id)
      const res = await apiClient.post(`/accumulations/${id}/join`)
      toast.success(res.data.message || 'Successfully joined!')
      
      // Close drawer if open
      setSelectedAccumForDrawer(null)
      
      await fetchData()

      // Immediately open the active view with fresh data
      const freshRes = await apiClient.get('/accumulations/student/available')
      const freshList: Accumulation[] = freshRes.data.data || []
      const target = freshList.find(a => a._id === id)
      if (target) setActiveView(target)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to join accumulation.')
    } finally {
      setJoiningId(null)
    }
  }

  const handleComplete = async (id: string) => {
    try {
      const res = await apiClient.post(`/accumulations/${id}/complete`)
      toast.success(res.data.message || 'Accumulation completed! 🎉')
      await fetchData()
      setActiveView(null) // Return to list, switch to completed tab
      setActiveTab('completed')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to mark as complete.')
    }
  }

  const TYPES = ['All', 'Challenge', 'Course', 'Task', 'Event']

  // ── If in active view, render that instead ──
  if (activeView) {
    const refreshedAccum = accumulations.find(a => a._id === activeView._id) ?? activeView
    return (
      <DashboardLayout navigation={studentNavigation}>
        <AnimatePresence mode="wait">
          <ActiveAccumulationView
            key={activeView._id}
            accum={refreshedAccum}
            studentName={studentName}
            onBack={() => setActiveView(null)}
            onComplete={handleComplete}
          />
        </AnimatePresence>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout navigation={studentNavigation}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 border border-gray-200">
              <GraduationCap className="w-3 h-3" /> {studentCourse || 'Your Course'}
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Accumulations</h1>
            <p className="text-gray-500 mt-1">Challenges, courses, and events tailored for your course to boost your Skill Graph.</p>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-xl w-fit shrink-0">
            {(['available', 'in-progress', 'completed'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                  activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab.replace('-', ' ')}
                {tab === 'in-progress' && inProgressCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-black bg-blue-600 text-white rounded-full">{inProgressCount}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Available', value: availableCount, icon: Layers, from: 'from-blue-50', to: 'to-indigo-50/50', ring: 'bg-blue-100 text-blue-600', text: 'text-blue-950', sub: 'text-blue-900/60' },
            { label: 'In Progress', value: inProgressCount, icon: TrendingUp, from: 'from-orange-50', to: 'to-amber-50/50', ring: 'bg-orange-100 text-orange-600', text: 'text-orange-950', sub: 'text-orange-900/60' },
            { label: 'Completed', value: completedCount, icon: Trophy, from: 'from-green-50', to: 'to-emerald-50/50', ring: 'bg-green-100 text-green-600', text: 'text-green-950', sub: 'text-green-900/60' },
          ].map(({ label, value, icon: Icon, from, to, ring, text, sub }) => (
            <Card key={label} className={`rounded-[24px] border-none shadow-[0_2px_10px_rgba(0,0,0,0.03)] bg-gradient-to-br ${from} ${to}`}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${ring}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${sub}`}>{label}</p>
                    <h3 className={`text-2xl font-black ${text}`}>{value}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Type Filter Pills */}
        <div className="flex gap-2 flex-wrap">
          {TYPES.map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className={`text-xs px-4 py-2 rounded-full font-bold border transition-all ${
                filter === t ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
              }`}>
              {t}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-400">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="text-sm font-semibold">Loading accumulations for your course...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center text-gray-400">
            <Layers className="w-14 h-14 mb-4 opacity-30" />
            <h3 className="text-lg font-bold text-gray-700 mb-1">No accumulations found</h3>
            <p className="text-sm max-w-sm">
              {activeTab === 'available'
                ? `No active accumulations available for ${studentCourse} right now. Check back soon!`
                : `You don't have any ${activeTab.replace('-', ' ')} accumulations yet.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((accum, i) => {
                const TypeIcon = typeIcon(accum.type)
                const myStatus = getParticipantStatus(accum)
                const isInProgress = myStatus === 'In Progress'
                const isCompleted = myStatus === 'Completed'
                return (
                  <motion.div
                    key={accum._id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.04 }}
                    whileHover={{ y: -4 }}
                  >
                    <Card
                      onClick={() => {
                        if (isInProgress || isCompleted) {
                          setActiveView(accum)
                        } else {
                          setSelectedAccumForDrawer(accum)
                        }
                      }}
                      className="rounded-[24px] shadow-sm hover:shadow-lg transition-all border-gray-100 flex flex-col h-full bg-white overflow-hidden group cursor-pointer"
                    >
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start mb-4">
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${typeColor(accum.type)}`}>
                            <TypeIcon className="w-3.5 h-3.5" />{accum.type}
                          </div>
                          <div className="flex items-center gap-1.5">
                            {isCompleted && <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Done</span>}
                            {isInProgress && <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1"><TrendingUp className="w-3 h-3" />Active</span>}
                          </div>
                        </div>
                        <CardTitle className={`text-lg leading-tight line-clamp-2 transition-colors ${(isInProgress || isCompleted) ? 'group-hover:text-blue-600' : ''}`}>
                          {accum.title}
                        </CardTitle>
                        <CardDescription className="text-sm font-medium text-gray-400 flex items-center gap-1.5 mt-1">
                          {accum.source === 'school' ? <School className="w-3.5 h-3.5 text-emerald-500" /> : <Building2 className="w-3.5 h-3.5 text-blue-400" />}
                          {accum.source === 'school' ? 'School' : 'Company'} • {accum.field || 'General'}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="mt-auto flex flex-col gap-4">
                        <p className="text-sm text-gray-600 line-clamp-2">{accum.description}</p>
                        {accum.skillTags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {accum.skillTags.slice(0, 3).map(tag => (
                              <span key={tag} className="px-2 py-0.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-semibold text-gray-600">{tag}</span>
                            ))}
                            {accum.skillTags.length > 3 && <span className="text-xs font-semibold text-gray-400 px-2 py-0.5">+{accum.skillTags.length - 3}</span>}
                          </div>
                        )}

                        <div className="pt-4 mt-2 border-t border-gray-50 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-xs font-bold text-blue-600">
                              <Star className="w-3.5 h-3.5 fill-blue-600" />+{accum.points} PTS
                            </div>
                            <div className="flex items-center gap-1 text-xs font-bold text-gray-400">
                              <Clock className="w-3.5 h-3.5" /> {accum.duration}
                            </div>
                          </div>
                          {/* CTA based on status */}
                          {!myStatus ? (
                            <Button
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); setSelectedAccumForDrawer(accum) }}
                              className="text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white h-8 px-3"
                            >
                              Details
                            </Button>
                          ) : isInProgress ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setActiveView(accum)}
                              className="text-xs font-bold rounded-xl h-8 px-3 border-blue-200 text-blue-600 hover:bg-blue-50"
                            >
                              Continue →
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setActiveView(accum)}
                              className="text-xs font-bold rounded-xl h-8 px-3 border-green-200 text-green-600 hover:bg-green-50"
                            >
                              View →
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
      {/* Detail Drawer for Join */}
      <AnimatePresence>
        {selectedAccumForDrawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAccumForDrawer(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[70] overflow-y-auto"
            >
              <div className="p-6 space-y-8">
                <div className="flex items-center justify-between">
                  <div className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${typeColor(selectedAccumForDrawer.type)}`}>
                    {(() => {
                      const Icon = typeIcon(selectedAccumForDrawer.type)
                      return <Icon className="w-3.5 h-3.5" />
                    })()}
                    {selectedAccumForDrawer.type}
                  </div>
                  <button onClick={() => setSelectedAccumForDrawer(null)} aria-label="Close" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div>
                  <h2 className="text-2xl font-black text-gray-900 leading-tight">{selectedAccumForDrawer.title}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    {selectedAccumForDrawer.source === 'school' ? <School className="w-4 h-4 text-emerald-500" /> : <Building2 className="w-4 h-4 text-blue-400" />}
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{selectedAccumForDrawer.source} Accumulation</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p className="text-sm text-gray-600 leading-relaxed">{selectedAccumForDrawer.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100">
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Rewards</p>
                      <p className="text-xl font-black text-blue-600">+{selectedAccumForDrawer.points} PTS</p>
                    </div>
                    <div className="bg-orange-50/50 rounded-2xl p-4 border border-orange-100">
                      <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Time</p>
                      <p className="text-xl font-black text-orange-600">{selectedAccumForDrawer.duration}</p>
                    </div>
                  </div>
                </div>

                {selectedAccumForDrawer.skillTags.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Skills You&apos;ll Master</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedAccumForDrawer.skillTags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-black text-white rounded-full text-xs font-bold">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedAccumForDrawer.objectives && selectedAccumForDrawer.objectives.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Expected Outcomes</h3>
                    <ul className="space-y-2">
                      {selectedAccumForDrawer.objectives.map((obj, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" /> {obj}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-8 border-t border-gray-100">
                  <Button
                    onClick={() => handleJoin(selectedAccumForDrawer._id)}
                    disabled={joiningId === selectedAccumForDrawer._id}
                    className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-xl shadow-blue-100"
                  >
                    {joiningId === selectedAccumForDrawer._id ? (
                      <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Joining...</>
                    ) : (
                      <><UserPlus className="w-5 h-5 mr-2" /> Join Accumulation</>
                    )}
                  </Button>
                  <p className="text-center text-xs text-gray-400 mt-4">
                    By joining, you agree to complete this within the set deadline.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}

export default function StudentAccumulationsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="w-10 h-10 animate-spin text-gray-400" /></div>}>
      <StudentAccumulationsPageContent />
    </Suspense>
  )
}
