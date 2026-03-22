"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { apiClient } from "@/lib/apiClient"
import { motion } from 'framer-motion'
import { ArrowUpDown, Award, BadgeInfo, BookOpen, ChevronLeft, Clock, GraduationCap, HelpCircle, Mail, Pencil, Phone, Plus, Search, ShieldAlert, ShieldCheck, Trash2, UserCheck, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from 'recharts'
import type { Student } from "../_data/school-data"
import { COURSES } from "../_data/school-data"
import type { Accum } from "../accumulations/AccumulationsPage"

const COURSE_CODES = COURSES.map(c => c.code)

type PendingFormData = {
  email: string
  firstName: string
  lastName: string
  middleName: string
  studentId: string
  section: string
  course: string
  yearLevel: string
  term: string
}

function PendingForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: DbPendingStudent
  onSave: (data: PendingFormData) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<PendingFormData>({
    email: initial?.email ?? "",
    firstName: initial?.name?.split(" ")[0] ?? "",
    lastName: initial?.name?.split(" ").slice(-1)[0] ?? "",
    middleName: "",
    studentId: "",
    section: "",
    course: initial?.course ?? COURSE_CODES[0],
    yearLevel: initial?.year ?? "1st Year",
    term: "",
  })
  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"]
  const set = (k: keyof PendingFormData, v: string) => setForm(f => ({ ...f, [k]: v }))
  const inputCls = "w-full px-3 py-2 text-sm rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
  const isValid = form.email && form.firstName && form.lastName && form.course
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background rounded-xl border shadow-xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{initial ? "Edit Pending Student" : "Add Student"}</h2>
          <button type="button" title="Close" onClick={onCancel}><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>
        <div className="space-y-3">
          {([
            { key: "email", label: "Email *" },
            { key: "firstName", label: "First Name *" },
            { key: "lastName", label: "Last Name *" },
            { key: "middleName", label: "Middle Name" },
            { key: "studentId", label: "Student ID" },
            { key: "section", label: "Section" },
            { key: "term", label: "Term" },
          ] as { key: keyof PendingFormData; label: string }[]).map(({ key, label }) => (
            <div key={key}>
              <label className="text-xs font-medium text-muted-foreground">{label}</label>
              <input className={inputCls} value={form[key]} onChange={e => set(key, e.target.value)} placeholder={label.replace(" *", "")} />
            </div>
          ))}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Course *</label>
            <select title="Select course" className={inputCls} value={form.course} onChange={e => set("course", e.target.value)}>
              {COURSE_CODES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Year Level *</label>
            <select title="Select year" className={inputCls} value={form.yearLevel} onChange={e => set("yearLevel", e.target.value)}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="button" onClick={() => onSave(form)} disabled={!isValid}>
            {initial ? "Save Changes" : "Add Student"}
          </Button>
        </div>
      </div>
    </div>
  )
}

const STATUS_MAP: Record<string, string> = {
  VERIFIED: "Active",
  UNDER_EVALUATION: "Pending",
  REJECTED: "Probation",
  PENDING_ONBOARDING: "Pending",
}

function mapProfileToStudent(p: any): Student & { profileId: string } {
  const fullName = [p.basicInfo?.firstName, p.basicInfo?.middleName, p.basicInfo?.lastName].filter(Boolean).join(" ")
  const performance = (p.academicRecords ?? []).map((r: any) => ({
    field: r.subject,
    score: Math.round(120 - 20 * r.grade),
  }))
  const gpa = performance.length
    ? parseFloat((performance.reduce((s: number, p: any) => s + p.score, 0) / performance.length / 25).toFixed(2))
    : 0
  return {
    profileId: p._id,
    name: fullName || "",
    id: p.basicInfo?.studentId || p._id,
    year: p.basicInfo?.yearLevel || "—",
    section: p.basicInfo?.section || "",
    status: STATUS_MAP[p.status] ?? "",
    email: (p.user as any)?.email || "",
    phone: "",
    gpa,
    totalPoints: p.totalPoints ?? 0,
    skillTags: (p.skillTags ?? []).slice(0, 3).map((t: any) => typeof t === 'string' ? t : t.tag),
    performance,
    completedAccums: [],
    currentAccums: [],
  }
}

type DbPendingStudent = {
  _id: string
  name: string
  email: string
  course: string
  year: string
  status: string
  registeredAt: string
}

export default function StudentsPage({
  selectedCourse,
  selectedStudent,
  onSelectCourse,
  onSelectStudent,
  onSelectAccum,
  onBack,
  accums = [],
}: {
  selectedCourse: typeof COURSES[0] | null
  selectedStudent: Student | null
  onSelectCourse: (course: typeof COURSES[0]) => void
  onSelectStudent: (student: Student) => void
  onSelectAccum: (accum: Accum) => void
  onBack: () => void
  accums?: Accum[]
}) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("name")
  const [dbCourses, setDbCourses] = useState<typeof COURSES>([])
  const [pending, setPending] = useState<DbPendingStudent[]>([])
  const [selectedPending, setSelectedPending] = useState<DbPendingStudent | null>(null)
  const [formTarget, setFormTarget] = useState<DbPendingStudent | "new" | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DbPendingStudent | null>(null)
  const [pendingSearch, setPendingSearch] = useState("")
  const [pendingSort, setPendingSort] = useState("name")
  const [fullProfile, setFullProfile] = useState<any>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  const loadStudents = () => {
    apiClient.get('/profile/students').then(res => {
      const profiles: any[] = res.data.data

      // Verified → course cards
      const courseMap = new Map<string, typeof COURSES[0]>()
      COURSES.forEach(c => courseMap.set(c.code, { ...c, students: [] }))
      profiles
        .filter(p => p.status === 'VERIFIED')
        .forEach(p => {
          const code = p.basicInfo?.course?.toUpperCase()
          if (code && courseMap.has(code)) {
            courseMap.get(code)!.students.push(mapProfileToStudent(p))
          }
        })
      setDbCourses(Array.from(courseMap.values()))

      // Non-verified → pending section
      const pendingProfiles = profiles
        .filter(p => p.status !== 'VERIFIED')
        .map(p => ({
          _id: p._id,
          name: [p.basicInfo?.firstName, p.basicInfo?.lastName].filter(Boolean).join(" ") || "Unknown",
          email: (p.user as any)?.email || "",
          course: p.basicInfo?.course?.toUpperCase() || "",
          year: p.basicInfo?.yearLevel || "—",
          status: p.status,
          registeredAt: new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        }))
      setPending(pendingProfiles)
    }).catch(console.error)
  }

  useEffect(() => { loadStudents() }, [])

  useEffect(() => {
    if (selectedStudent && selectedStudent.profileId) {
      setProfileLoading(true)
      apiClient.get(`/profile/${selectedStudent.profileId}`)
        .then(res => setFullProfile(res.data.data))
        .catch(() => setFullProfile(null))
        .finally(() => setProfileLoading(false))
    } else {
      setFullProfile(null)
    }
  }, [selectedStudent])

  const courses = dbCourses.length ? dbCourses : COURSES

  // ── Pending CRUD helpers ──────────────────────────────────────────────────
  function handleSave(data: PendingFormData) {
    if (formTarget === "new") {
      apiClient.post('/profile/admin/create', {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName,
        studentId: data.studentId,
        section: data.section,
        course: data.course,
        yearLevel: data.yearLevel,
        term: data.term,
      }).then(() => {
        loadStudents()
      }).catch(console.error)
    } else if (formTarget) {
      const name = `${data.firstName} ${data.lastName}`.trim()
      setPending(p => p.map(s => s._id === (formTarget as DbPendingStudent)._id ? { ...s, name, email: data.email, course: data.course, year: data.yearLevel } : s))
      if (selectedPending?._id === (formTarget as DbPendingStudent)._id)
        setSelectedPending(prev => prev ? { ...prev, name, email: data.email, course: data.course, year: data.yearLevel } : prev)
    }
    setFormTarget(null)
  }

  function handleDelete(target: DbPendingStudent) {
    setPending(p => p.filter(s => s._id !== target._id))
    if (selectedPending?._id === target._id) setSelectedPending(null)
    setDeleteTarget(null)
  }

  function handleVerify(target: DbPendingStudent) {
    apiClient.patch(`/profile/${target._id}/verify`)
      .then(() => {
        setPending(p => p.filter(s => s._id !== target._id))
        setSelectedPending(null)
        setDeleteTarget(null)
        loadStudents()
      })
      .catch(console.error)
  }

  // ── Verified student detail view ──────────────────────────────────────────
  if (selectedStudent && selectedCourse) {
    if (profileLoading) {
      return (
        <div className="flex h-[80vh] items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500">Loading student profile...</p>
          </div>
        </div>
      )
    }

    if (!fullProfile) {
      return (
        <div className="flex h-[80vh] items-center justify-center">
          <div className="text-center">
            <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Profile Not Found</h2>
            <p className="text-gray-500">Unable to load student profile.</p>
            <Button className="mt-4" onClick={onBack}>Go Back</Button>
          </div>
        </div>
      )
    }

    const isVerified = fullProfile.status === 'VERIFIED'

    // Radar data calculation
    const isSoftSkill = (tag: string) => ['leadership', 'agile', 'scrum', 'communication', 'teamwork'].includes(tag.toLowerCase());
    const hardSkillsCount = fullProfile.skillTags.filter((s: any) => !isSoftSkill(typeof s === 'string' ? s : s.tag)).length;
    const softSkillsCount = fullProfile.skillTags.filter((s: any) => isSoftSkill(typeof s === 'string' ? s : s.tag)).length;
    
    const radarData = fullProfile ? [
      { subject: 'Academic Rating', score: fullProfile.pointsBreakdown?.academic || 0, fullMark: 1000, desc: 'Weighted GPA from university courses.', details: fullProfile.academicRecords.map((r: any) => ({ label: r.subject, value: `${r.grade} Grade` })) },
      { subject: 'Valid Certs', score: fullProfile.pointsBreakdown?.cert || 0, fullMark: 1000, desc: 'Validated external credentials.', details: fullProfile.certifications.filter((c: any) => c.verified).map((c: any) => ({ label: c.classification?.labels?.[0] || 'Verification', value: `${c.awardedPoints} pts` })) },
      { subject: 'Accumulations', score: fullProfile.pointsBreakdown?.accumulations || 0, fullMark: 1000, desc: 'Bounty & hackathon performance.', details: [] },
      { subject: 'Extracurricular', score: fullProfile.pointsBreakdown?.achievement || 0, fullMark: 1000, desc: 'Leadership & club participation awards.', details: [] },
      { subject: 'Hard Skills', score: fullProfile.pointsBreakdown?.hardSkills || 0, fullMark: 1000, desc: `${hardSkillsCount} technical capabilities strictly mapped.`, details: fullProfile.skillTags.filter((t: any) => t.tag && !['leadership', 'communication', 'teamwork', 'agile', 'scrum'].includes(t.tag.toLowerCase())).map((t: any) => ({ label: typeof t === 'string' ? t : t.tag, value: typeof t === 'string' ? '100%' : `${Math.round(t.confidence * 100)}% Confidence` })) },
      { subject: 'Soft Skills', score: fullProfile.pointsBreakdown?.softSkills || 0, fullMark: 1000, desc: `${softSkillsCount} interpersonal strengths verified.`, details: fullProfile.skillTags.filter((t: any) => t.tag && ['leadership', 'communication', 'teamwork', 'agile', 'scrum'].includes(t.tag.toLowerCase())).map((t: any) => ({ label: typeof t === 'string' ? t : t.tag, value: typeof t === 'string' ? '100%' : `${Math.round(t.confidence * 100)}% Confidence` })) }
    ] : []

    return (
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
                This student's profile is currently being reviewed by your School Administration. 
                Certain features like Accumulations, Jobs, and Public Sharing are temporarily locked until verification is complete.
              </p>
            </div>
          </div>
        )}

        {/* Global Stats Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm shadow-gray-200/50">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {fullProfile.basicInfo.lastName}, {fullProfile.basicInfo.firstName} {fullProfile.basicInfo.middleName?.charAt(0)}.
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
              {fullProfile.basicInfo.course} {fullProfile.basicInfo.section && `- ${fullProfile.basicInfo.section}`} • {fullProfile.basicInfo.yearLevel} • {fullProfile.basicInfo.studentId}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {fullProfile.skillTags?.map((skill: any, i: number) => {
                const tagString = typeof skill === 'string' ? skill : skill.tag;
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
                {fullProfile.totalPoints.toLocaleString()} <span className="text-xl text-gray-300">pts</span>
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
                    <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                      <span className="text-gray-500 font-medium">Academic Rating</span>
                      <span className="font-bold">{fullProfile.pointsBreakdown?.academic || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                      <span className="text-gray-500 font-medium">Valid Certifications</span>
                      <span className="font-bold">{fullProfile.pointsBreakdown?.cert || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                      <span className="text-gray-500 font-medium">Accumulations</span>
                      <span className="font-bold">{fullProfile.pointsBreakdown?.accumulations || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                      <span className="text-gray-500 font-medium">Extracurricular</span>
                      <span className="font-bold">{fullProfile.pointsBreakdown?.achievement || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                      <span className="text-gray-500 font-medium">Hard Skills</span>
                      <span className="font-bold">{fullProfile.pointsBreakdown?.hardSkills || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm pb-1">
                      <span className="text-gray-500 font-medium">Soft Skills</span>
                      <span className="font-bold">{fullProfile.pointsBreakdown?.softSkills || 0}</span>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Radar Chart */}
        <Card className="p-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Skill Assessment Radar</CardTitle>
            <CardDescription>Comprehensive evaluation across all competency areas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={90} domain={[0, 1000]} />
                  <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Back button */}
        <Button variant="ghost" onClick={onBack} className="gap-2 -ml-2">
          <ChevronLeft className="w-4 h-4" /> Back to Students
        </Button>
      </motion.div>
    )
  }

  // ── Pending student detail view ───────────────────────────────────────────
  if (selectedPending) {
    const parts = selectedPending.name.split(" "); const initials = [parts[0], parts[parts.length - 1]].filter(Boolean).map(n => n[0]).join("")
    const courseName = COURSES.find(c => c.code === selectedPending.course)?.name ?? selectedPending.course
    return (
      <>
        {formTarget && formTarget !== "new" && (
          <PendingForm initial={formTarget} onSave={handleSave} onCancel={() => setFormTarget(null)} />
        )}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" size="icon" title="Go back" onClick={() => setSelectedPending(null)}><ChevronLeft className="h-5 w-5" /></Button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight">{selectedPending.name}</h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">Pending</span>
              </div>
              <p className="text-muted-foreground">{selectedPending.course} · {selectedPending.year}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setFormTarget(selectedPending)}>
                <Pencil className="h-4 w-4 mr-1" />Edit
              </Button>
              <Button type="button" variant="outline" size="sm" className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300" onClick={() => setDeleteTarget(selectedPending)}>
                <Trash2 className="h-4 w-4 mr-1" />Delete
              </Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-yellow-700">{initials}</span>
                  </div>
                  <div>
                    <CardTitle>{selectedPending.name}</CardTitle>
                    <CardDescription>Registered {selectedPending.registeredAt}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground shrink-0" /><span>{selectedPending.email}</span></div>
                <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground shrink-0" /><span>—</span></div>
                <div className="flex items-center gap-2 text-sm"><BookOpen className="h-4 w-4 text-muted-foreground shrink-0" /><span>{courseName}</span></div>
                <div className="flex items-center gap-2 text-sm"><GraduationCap className="h-4 w-4 text-muted-foreground shrink-0" /><span>{selectedPending.year}</span></div>
              </CardContent>
            </Card>

            <Card className="border-yellow-200 bg-yellow-50/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-yellow-600" />Verification Review</CardTitle>
                <CardDescription>Review the student&apos;s submitted details before approving their account.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Registration Date</span><span className="font-medium">{selectedPending.registeredAt}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Applied Course</span><span className="font-medium">{selectedPending.course}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Year Level</span><span className="font-medium">{selectedPending.year}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Account Status</span><span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">Pending Verification</span></div>
                </div>
                <Button
                  type="button"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => setDeleteTarget({ ...selectedPending, _verify: true } as DbPendingStudent & { _verify: boolean })}
                >
                  <UserCheck className="h-4 w-4 mr-2" />Verify Student
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Delete / Verify confirm dialog */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-background rounded-xl border shadow-xl w-full max-w-sm p-6 space-y-4">
              {(deleteTarget as DbPendingStudent & { _verify?: boolean })._verify ? (
                <>
                  <h2 className="text-lg font-semibold">Verify Student</h2>
                  <p className="text-sm text-muted-foreground">Are you sure you want to verify <span className="font-medium text-foreground">{deleteTarget.name}</span>? Their account will be activated as a verified student.</p>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                    <Button type="button" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleVerify(deleteTarget as DbPendingStudent)}>
                      <UserCheck className="h-4 w-4 mr-1" />Confirm Verify
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-semibold">Delete Pending Student</h2>
                  <p className="text-sm text-muted-foreground">Are you sure you want to remove <span className="font-medium text-foreground">{deleteTarget.name}</span>? This action cannot be undone.</p>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                    <Button type="button" variant="destructive" onClick={() => handleDelete(deleteTarget as DbPendingStudent)}>Delete</Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </>
    )
  }

  // ── Course student list ───────────────────────────────────────────────────
  if (selectedCourse) {
    const liveCourse = courses.find(c => c.code === selectedCourse.code) ?? selectedCourse
    const filtered = liveCourse.students
      .filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.id.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) =>
        sort === "gpa" ? b.gpa - a.gpa :
        sort === "status" ? a.status.localeCompare(b.status) :
        a.name.localeCompare(b.name)
      )
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="icon" title="Go back" onClick={onBack}><ChevronLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{selectedCourse.code}</h1>
            <p className="text-muted-foreground">{selectedCourse.name} — {liveCourse.students.length} students enrolled</p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle>Student List</CardTitle>
                <CardDescription>All enrolled students in {liveCourse.code}</CardDescription>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex items-center gap-1.5 border rounded-md px-2 py-2 bg-background text-sm">
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  <select value={sort} onChange={e => setSort(e.target.value)} title="Sort students" className="bg-transparent focus:outline-none text-sm cursor-pointer">
                    <option value="name">Name</option>
                    <option value="gpa">Points</option>
                    <option value="status">Status</option>
                  </select>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input type="text" placeholder="Search by name or ID…" value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No students match &ldquo;{search}&rdquo;</p>
            ) : (
              <div className="space-y-2">
                {filtered.map(student => {
                  const parts = student.name.split(" "); const initials = [parts[0], parts[parts.length - 1]].filter(Boolean).map(n => n[0]).join("")
                  return (
                    <button type="button" key={student.id} onClick={() => router.push(`/dashboard/school/students/${(student as any).profileId}`)} className="w-full text-left flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 hover:border-primary transition-all">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-medium text-primary">{initials}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.id} · {student.year}{student.section ? ` · ${student.section}` : ""}</p>
                          {student.skillTags && student.skillTags.length > 0 && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {student.skillTags.map((tag, i) => (
                                <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">#{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground hidden sm:block">{(student.totalPoints ?? 0).toLocaleString()} pts</span>
                        <ChevronLeft className="h-4 w-4 text-muted-foreground rotate-180" />
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // ── Main view: course cards + pending list ────────────────────────────────
  return (
    <>
      {formTarget && (
        <PendingForm
          initial={formTarget === "new" ? undefined : formTarget}
          onSave={handleSave}
          onCancel={() => setFormTarget(null)}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-background rounded-xl border shadow-xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold">Delete Pending Student</h2>
            <p className="text-sm text-muted-foreground">Are you sure you want to remove <span className="font-medium text-foreground">{deleteTarget.name}</span>? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button type="button" variant="destructive" onClick={() => handleDelete(deleteTarget)}>Delete</Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">Select a course to view its enrolled students.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {courses.map(course => {
            const progress = Math.round((course.enrolled / course.capacity) * 100)
            return (
              <button type="button" key={course.code} onClick={() => { setSearch(""); onSelectCourse(course) }} className="text-left">
                <Card className="hover:border-primary hover:shadow-md transition-all cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{course.code}</span>
                    </div>
                    <CardTitle className="text-base mt-2">{course.name}</CardTitle>
                    <CardDescription>{course.students.length} students enrolled</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Enrolment</span><span>{course.enrolled}/{course.capacity}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </button>
            )
          })}
        </div>

        {/* Pending Verification Section */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    Pending Verification
                    {pending.length > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">{pending.length}</span>
                    )}
                  </CardTitle>
                  <CardDescription>Students who have registered and are awaiting review</CardDescription>
                </div>
                <Button type="button" size="sm" onClick={() => setFormTarget("new")}>
                  <Plus className="h-4 w-4 mr-1" />Add
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex items-center gap-1.5 border rounded-md px-2 py-2 bg-background text-sm shrink-0">
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  <select value={pendingSort} onChange={e => setPendingSort(e.target.value)} title="Sort pending students" className="bg-transparent focus:outline-none text-sm cursor-pointer">
                    <option value="name">Name</option>
                    <option value="course">Course</option>
                    <option value="year">Year</option>
                    <option value="date">Date</option>
                  </select>
                </div>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input type="text" placeholder="Search by name, course or email…" value={pendingSearch} onChange={e => setPendingSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {(() => {
              const q = pendingSearch.toLowerCase()
              const filteredPending = pending
                .filter(s => !q || s.name.toLowerCase().includes(q) || s.course.toLowerCase().includes(q) || s.email.toLowerCase().includes(q))
                .sort((a, b) =>
                  pendingSort === "course" ? a.course.localeCompare(b.course) :
                  pendingSort === "year" ? a.year.localeCompare(b.year) :
                  pendingSort === "date" ? new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime() :
                  a.name.localeCompare(b.name)
                )
              return filteredPending.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  {pendingSearch ? `No results for "${pendingSearch}"` : "No students pending verification."}
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredPending.map(student => {
                    const parts = student.name.split(" "); const initials = [parts[0], parts[parts.length - 1]].filter(Boolean).map(n => n[0]).join("")
                    return (
                      <div key={student._id} className="flex items-center justify-between p-3 rounded-lg border bg-yellow-50/40 hover:bg-yellow-50/70 transition-all">
                        <button type="button" className="flex items-center gap-3 flex-1 text-left" onClick={() => router.push(`/dashboard/school/students/${student._id}`)}>
                          <div className="h-9 w-9 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                            <span className="text-xs font-medium text-yellow-700">{initials}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{student.name}</p>
                            <p className="text-xs text-muted-foreground">{student.course} · {student.year} · Registered {student.registeredAt}</p>
                          </div>
                        </button>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <Button type="button" variant="ghost" size="icon" title="Edit student" className="h-8 w-8" onClick={() => setFormTarget(student)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button type="button" variant="ghost" size="icon" title="Delete student" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => setDeleteTarget(student)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
