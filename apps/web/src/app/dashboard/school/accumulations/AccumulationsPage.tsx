"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Building2, CalendarDays, CheckCircle, ChevronLeft, ClipboardList, Clock, GraduationCap, Layers, Link, Mail, Phone, Plus, School, Star, TrendingUp, Trophy, Users, X } from "lucide-react"
import { useState } from "react"
import { PerformanceBar, StatCard, StatusBadge } from "../_components/shared"
import type { AccumSource, Student } from "../_data/school-data"
import { COURSES } from "../_data/school-data"
import { apiClient } from "@/lib/apiClient"

type SkillRatings = Record<string, number> // key: skillTag, value: 1-5
type ParticipantGrade = { grade: string; skillRatings: SkillRatings; feedback: string }
type GradesMap = Record<string, ParticipantGrade> // key: participantName

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          aria-label={`Rate ${n}`}
        >
          <Star className={`h-4 w-4 transition-colors ${
            n <= (hovered || value) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
          }`} />
        </button>
      ))}
    </div>
  )
}

const typeIcon = (type: string) =>
  type === "Challenge" ? Trophy : type === "Course" ? BookOpen : type === "Event" ? CalendarDays : CheckCircle

const statusColor = (s: string) =>
  s === "Active" ? "bg-green-100 text-green-700" : s === "Closing Soon" ? "bg-yellow-100 text-yellow-700" : "bg-muted text-muted-foreground"

const typeColor = (t: string) =>
  t === "Challenge" ? "bg-orange-100 text-orange-700" : t === "Course" ? "bg-blue-100 text-blue-700" : t === "Event" ? "bg-purple-100 text-purple-700" : "bg-muted text-muted-foreground"

const ACCUM_TYPES = ["Challenge", "Course", "Task", "Event"]
const ACCUM_COURSES = ["BSIT", "BSCS", "BSBA"]
const ACCUM_FIELDS = ["Web Development", "Cybersecurity", "Cloud Computing", "Networking", "Software Development", "Mobile Development", "UI/UX Design", "Data Analytics", "Project Management", "Business", "Communication"]

// Keyword → skill tag mapping for auto-detection
const SKILL_KEYWORD_MAP: Record<string, string[]> = {
  "#webdev": ["web", "html", "css", "frontend", "backend", "fullstack", "react", "next", "vue", "angular"],
  "#cybersec": ["security", "cyber", "hacking", "penetration", "firewall", "vulnerability", "ctf"],
  "#cloud": ["cloud", "aws", "azure", "gcp", "devops", "kubernetes", "docker", "serverless"],
  "#networking": ["network", "routing", "switching", "cisco", "tcp", "ip", "dns", "vpn"],
  "#softwaredev": ["software", "programming", "algorithm", "data structure", "oop", "api", "microservice"],
  "#mobiledev": ["mobile", "android", "ios", "flutter", "react native", "swift", "kotlin"],
  "#uiux": ["ui", "ux", "design", "figma", "prototype", "wireframe", "user experience"],
  "#dataanalytics": ["data", "analytics", "sql", "excel", "tableau", "power bi", "statistics", "machine learning", "ai"],
  "#projectmgmt": ["project", "management", "agile", "scrum", "kanban", "sprint", "planning"],
  "#business": ["business", "analysis", "strategy", "marketing", "finance", "entrepreneurship"],
  "#communication": ["communication", "presentation", "writing", "speaking", "leadership", "teamwork"],
}

function extractTagsFromText(title: string, description: string): string[] {
  const text = `${title} ${description}`.toLowerCase()
  return Object.entries(SKILL_KEYWORD_MAP)
    .filter(([, keywords]) => keywords.some(kw => text.includes(kw)))
    .map(([tag]) => tag)
}

type PersonInCharge = { name: string; role: string; email: string }
type TypeSpecificItem = { title: string; description: string }
type AgendaItem = { time: string; activity: string }

type NewAccum = {
  title: string; type: string;
  courses: string[]; deadline: string; duration: string; points: string; description: string
  skillTags: string[]; inCharge: PersonInCharge[]; resourceLink: string
  challenges: TypeSpecificItem[]; modules: TypeSpecificItem[]
  tasks: TypeSpecificItem[]; agenda: AgendaItem[]
}

const EMPTY_FORM: NewAccum = {
  title: "", type: "Challenge", courses: [], deadline: "", duration: "", points: "",
  description: "", skillTags: [], inCharge: [], resourceLink: "",
  challenges: [], modules: [], tasks: [], agenda: [],
}
const EMPTY_PERSON: PersonInCharge = { name: "", role: "", email: "" }
const EMPTY_ITEM: TypeSpecificItem = { title: "", description: "" }
const EMPTY_AGENDA: AgendaItem = { time: "", activity: "" }

const inputCls = "w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"

function CreateAccumulationModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: NewAccum) => void }) {
  const [form, setForm] = useState<NewAccum>(EMPTY_FORM)
  const [tagInput, setTagInput] = useState("")
  const [errors, setErrors] = useState<Partial<Record<keyof NewAccum, string>>>({})

  const set = <K extends keyof NewAccum>(k: K, v: NewAccum[K]) => setForm(f => ({ ...f, [k]: v }))

  const mergeSkillTags = (title: string, description: string, currentTags: string[]) => {
    const auto = extractTagsFromText(title, description)
    return Array.from(new Set([...currentTags, ...auto]))
  }

  const syncText = (k: 'title' | 'description', value: string) => {
    const trimmed = k === 'title' ? value.slice(0, 100) : value.slice(0, 1000)
    const nextForm = { ...form, [k]: trimmed }
    const nextTags = mergeSkillTags(nextForm.title, nextForm.description, form.skillTags)
    setForm({ ...nextForm, skillTags: nextTags })
  }

  const toggleCourse = (c: string) =>
    set("courses", form.courses.includes(c) ? form.courses.filter(x => x !== c) : [...form.courses, c])

  const addTag = () => {
    const raw = tagInput.trim().replace(/^#+/, "")
    if (!raw) return
    const tag = `#${raw.toLowerCase().replace(/\s+/g, "")}`
    if (!form.skillTags.includes(tag)) set("skillTags", [...form.skillTags, tag])
    setTagInput("")
  }

  const removeTag = (tag: string) => set("skillTags", form.skillTags.filter(t => t !== tag))

  const updatePerson = (i: number, k: keyof PersonInCharge, v: string) =>
    set("inCharge", form.inCharge.map((p, idx) => idx === i ? { ...p, [k]: v } : p))

  const addPerson = () => set("inCharge", [...form.inCharge, { ...EMPTY_PERSON }])
  const removePerson = (i: number) => set("inCharge", form.inCharge.filter((_, idx) => idx !== i))

  const validate = () => {
    const e: Partial<Record<keyof NewAccum, string>> = {}
    if (!form.title.trim()) e.title = "Required"
    else if (form.title.length > 100) e.title = "Max 100 characters"
    if (!form.courses.length) e.courses = "Select at least one"
    if (!form.deadline) e.deadline = "Required"
    if (!form.duration.trim()) e.duration = "Required"
    if (!form.points || isNaN(Number(form.points)) || Number(form.points) <= 0) e.points = "Must be a positive number"
    if (!form.description.trim()) e.description = "Required"
    else if (form.description.length > 1000) e.description = "Max 1000 characters"

    if (form.type === "Challenge") {
      if (!form.challenges.length) e.challenges = "Add at least one challenge"
      else if (form.challenges.some(c => !c.title.trim() || !c.description.trim())) e.challenges = "Each challenge must have title and description"
    }
    if (form.type === "Course") {
      if (!form.modules.length) e.modules = "Add at least one module"
      else if (form.modules.some(m => !m.title.trim() || !m.description.trim())) e.modules = "Each module must have title and description"
    }
    if (form.type === "Event") {
      if (!form.agenda.length) e.agenda = "Add at least one agenda item"
      else if (form.agenda.some(a => !a.time.trim() || !a.activity.trim())) e.agenda = "Each agenda item must have time and activity"
    }
    if (form.type === "Task") {
      if (!form.tasks.length) e.tasks = "Add at least one task"
      else if (form.tasks.some(t => !t.title.trim() || !t.description.trim())) e.tasks = "Each task must have title and description"
    }

    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) onSubmit(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-semibold">Create Accumulation</h2>
          <button type="button" onClick={onClose} aria-label="Close modal"><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">

          {/* Title */}
          <div className="space-y-1">
            <label htmlFor="accum-title" className="text-sm font-medium">Title</label>
            <input id="accum-title" maxLength={100} value={form.title} onChange={e => syncText('title', e.target.value)} placeholder="e.g. Web Dev Bootcamp" className={inputCls} />
            <p className="text-xs text-muted-foreground">{form.title.length}/100</p>
            {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
          </div>

          {/* Type */}
          <div className="space-y-1">
            <label htmlFor="accum-type" className="text-sm font-medium">Type</label>
            <select id="accum-type" value={form.type} onChange={e => set("type", e.target.value)} className={inputCls}>
              {ACCUM_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          {/* Skill Tags */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Skill Tags</label>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag() } }}
                placeholder="e.g. webdev, cybersec"
                aria-label="Add skill tag"
                className={`${inputCls} flex-1`}
              />
              <Button type="button" variant="outline" onClick={addTag} className="shrink-0">Add</Button>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Button type="button" variant="outline" size="sm" onClick={() => set("skillTags", mergeSkillTags(form.title, form.description, form.skillTags))}>Auto-detect from text</Button>
              <span className="text-xs text-muted-foreground">Matches tokens in title and description</span>
            </div>
            {form.skillTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {form.skillTags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Courses */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Courses</label>
            <div className="flex gap-2">
              {ACCUM_COURSES.map(c => (
                <button key={c} type="button" onClick={() => toggleCourse(c)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    form.courses.includes(c) ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground hover:border-primary"
                  }`}>{c}</button>
              ))}
            </div>
            {errors.courses && <p className="text-xs text-red-500">{errors.courses}</p>}
          </div>

          {/* Deadline & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="accum-deadline" className="text-sm font-medium">Deadline</label>
              <input id="accum-deadline" type="date" value={form.deadline} onChange={e => set("deadline", e.target.value)} className={inputCls} />
              {errors.deadline && <p className="text-xs text-red-500">{errors.deadline}</p>}
            </div>
            <div className="space-y-1">
              <label htmlFor="accum-duration" className="text-sm font-medium">Duration</label>
              <input id="accum-duration" value={form.duration} onChange={e => set("duration", e.target.value)} placeholder="e.g. 2 weeks" className={inputCls} />
              {errors.duration && <p className="text-xs text-red-500">{errors.duration}</p>}
            </div>
          </div>

          {/* Points */}
          <div className="space-y-1">
            <label htmlFor="accum-points" className="text-sm font-medium">Points</label>
            <input id="accum-points" type="number" min={1} value={form.points} onChange={e => set("points", e.target.value)} placeholder="e.g. 150" className={inputCls} />
            {errors.points && <p className="text-xs text-red-500">{errors.points}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label htmlFor="accum-desc" className="text-sm font-medium">Description</label>
            <textarea id="accum-desc" maxLength={1000} rows={3} value={form.description} onChange={e => syncText('description', e.target.value)} placeholder="Describe the accumulation..." className={`${inputCls} resize-none`} />
            <p className="text-xs text-muted-foreground">{form.description.length}/1000</p>
            {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
          </div>

          {/* Type-specific parameters */}
          <div className="space-y-3">
            {form.type === "Challenge" && (
              <div className="space-y-2 border p-3 rounded-lg bg-muted/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Challenges</h3>
                  <Button type="button" variant="outline" size="sm" onClick={() => set("challenges", [...form.challenges, { ...EMPTY_ITEM }])} className="h-7 text-xs gap-1"><Plus className="h-3 w-3" />Add Challenge</Button>
                </div>
                {form.challenges.length === 0 && <p className="text-xs text-muted-foreground">Add at least one challenge item.</p>}
                {form.challenges.map((item, idx) => (
                  <div key={`challenge-${idx}`} className="grid gap-2 md:grid-cols-2 p-2 rounded border bg-white">
                    <input value={item.title} onChange={e => set("challenges", form.challenges.map((c, i) => i === idx ? { ...c, title: e.target.value } : c))} placeholder="Challenge title" className={inputCls} />
                    <input value={item.description} onChange={e => set("challenges", form.challenges.map((c, i) => i === idx ? { ...c, description: e.target.value } : c))} placeholder="Challenge description" className={inputCls} />
                    <button type="button" onClick={() => set("challenges", form.challenges.filter((_, i) => i !== idx))} className="text-xs text-red-600">Remove</button>
                  </div>
                ))}
                {errors.challenges && <p className="text-xs text-red-500">{errors.challenges}</p>}
              </div>
            )}

            {form.type === "Course" && (
              <div className="space-y-2 border p-3 rounded-lg bg-muted/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Course Modules</h3>
                  <Button type="button" variant="outline" size="sm" onClick={() => set("modules", [...form.modules, { ...EMPTY_ITEM }])} className="h-7 text-xs gap-1"><Plus className="h-3 w-3" />Add Module</Button>
                </div>
                {form.modules.length === 0 && <p className="text-xs text-muted-foreground">Add at least one module.</p>}
                {form.modules.map((item, idx) => (
                  <div key={`module-${idx}`} className="grid gap-2 md:grid-cols-2 p-2 rounded border bg-white">
                    <input value={item.title} onChange={e => set("modules", form.modules.map((c, i) => i === idx ? { ...c, title: e.target.value } : c))} placeholder="Module title" className={inputCls} />
                    <input value={item.description} onChange={e => set("modules", form.modules.map((c, i) => i === idx ? { ...c, description: e.target.value } : c))} placeholder="Module description" className={inputCls} />
                    <button type="button" onClick={() => set("modules", form.modules.filter((_, i) => i !== idx))} className="text-xs text-red-600">Remove</button>
                  </div>
                ))}
                {errors.modules && <p className="text-xs text-red-500">{errors.modules}</p>}
              </div>
            )}

            {form.type === "Event" && (
              <div className="space-y-2 border p-3 rounded-lg bg-muted/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Event Agenda</h3>
                  <Button type="button" variant="outline" size="sm" onClick={() => set("agenda", [...form.agenda, { ...EMPTY_AGENDA }])} className="h-7 text-xs gap-1"><Plus className="h-3 w-3" />Add Agenda Item</Button>
                </div>
                {form.agenda.length === 0 && <p className="text-xs text-muted-foreground">Add at least one agenda item.</p>}
                {form.agenda.map((item, idx) => (
                  <div key={`agenda-${idx}`} className="grid gap-2 md:grid-cols-3 p-2 rounded border bg-white">
                    <input value={item.time} onChange={e => set("agenda", form.agenda.map((c, i) => i === idx ? { ...c, time: e.target.value } : c))} placeholder="Time" className={inputCls} />
                    <input value={item.activity} onChange={e => set("agenda", form.agenda.map((c, i) => i === idx ? { ...c, activity: e.target.value } : c))} placeholder="Activity" className={inputCls} />
                    <button type="button" onClick={() => set("agenda", form.agenda.filter((_, i) => i !== idx))} className="text-xs text-red-600">Remove</button>
                  </div>
                ))}
                {errors.agenda && <p className="text-xs text-red-500">{errors.agenda}</p>}
              </div>
            )}

            {form.type === "Task" && (
              <div className="space-y-2 border p-3 rounded-lg bg-muted/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Tasks</h3>
                  <Button type="button" variant="outline" size="sm" onClick={() => set("tasks", [...form.tasks, { ...EMPTY_ITEM }])} className="h-7 text-xs gap-1"><Plus className="h-3 w-3" />Add Task</Button>
                </div>
                {form.tasks.length === 0 && <p className="text-xs text-muted-foreground">Add at least one task item.</p>}
                {form.tasks.map((item, idx) => (
                  <div key={`task-${idx}`} className="grid gap-2 md:grid-cols-2 p-2 rounded border bg-white">
                    <input value={item.title} onChange={e => set("tasks", form.tasks.map((c, i) => i === idx ? { ...c, title: e.target.value } : c))} placeholder="Task title" className={inputCls} />
                    <input value={item.description} onChange={e => set("tasks", form.tasks.map((c, i) => i === idx ? { ...c, description: e.target.value } : c))} placeholder="Task description" className={inputCls} />
                    <button type="button" onClick={() => set("tasks", form.tasks.filter((_, i) => i !== idx))} className="text-xs text-red-600">Remove</button>
                  </div>
                ))}
                {errors.tasks && <p className="text-xs text-red-500">{errors.tasks}</p>}
              </div>
            )}
          </div>

          {/* People in Charge */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">People in Charge</label>
              <Button type="button" variant="outline" size="sm" onClick={addPerson} className="h-7 text-xs gap-1"><Plus className="h-3 w-3" />Add Person</Button>
            </div>
            {form.inCharge.map((p, i) => (
              <div key={i} className="grid grid-cols-3 gap-2 p-3 rounded-lg border bg-muted/20">
                <input value={p.name} onChange={e => updatePerson(i, "name", e.target.value)} placeholder="Name" aria-label="Person name" className={inputCls} />
                <input value={p.role} onChange={e => updatePerson(i, "role", e.target.value)} placeholder="Role" aria-label="Person role" className={inputCls} />
                <div className="flex gap-1">
                  <input value={p.email} onChange={e => updatePerson(i, "email", e.target.value)} placeholder="Email" aria-label="Person email" className={`${inputCls} flex-1 min-w-0`} />
                  <button type="button" onClick={() => removePerson(i)} aria-label="Remove person" className="shrink-0 text-muted-foreground hover:text-red-500"><X className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>

          {/* Resource Link */}
          <div className="space-y-1">
            <label htmlFor="accum-link" className="text-sm font-medium">Resource Link <span className="text-muted-foreground font-normal">(optional)</span></label>
            <input id="accum-link" value={form.resourceLink} onChange={e => set("resourceLink", e.target.value)} placeholder="https://..." className={inputCls} />
            <p className="text-xs text-muted-foreground">Link to external platform, docs, or additional details for students.</p>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export type Accum = {
  id: string; _id?: string; title: string; type: string; source: AccumSource; createdBy: string
  field: string; courses: string[]; deadline: string; duration: string; points: number
  status: string; participants: number; description: string; skillTags: string[]
  resourceLink: string; objectives: string[]; inCharge: { name: string; role: string; email: string }[]
  participantList: { name: string; course: string; status: string }[]
}

export default function AccumulationsPage({
  accums,
  selectedAccum,
  selectedPerson,
  selectedStudent,
  onSelectAccum,
  onSelectPerson,
  onSelectStudent,
  onBack,
  onAccumUpdate,
  onAccumCreate,
}: {
  accums: Accum[]
  selectedAccum: Accum | null
  selectedPerson: { name: string; role: string; email: string } | null
  selectedStudent: Student | null
  onSelectAccum: (a: Accum) => void
  onSelectPerson: (person: { name: string; role: string; email: string }) => void
  onSelectStudent: (student: Student, course: typeof COURSES[0]) => void
  onBack: () => void
  onAccumUpdate?: (updated: Accum) => void
  onAccumCreate?: (created: Accum) => void
}) {
  const [tab, setTab] = useState<AccumSource>("school")
  const [showModal, setShowModal] = useState(false)
  const [gradesMap, setGradesMap] = useState<Record<string, GradesMap>>({})
  const [gradingName, setGradingName] = useState<string | null>(null)

  const getGrade = (accumId: string, name: string): ParticipantGrade =>
    gradesMap[accumId]?.[name] ?? { grade: "", skillRatings: {}, feedback: "" }

  const setGrade = (accumId: string, name: string, patch: Partial<ParticipantGrade>) =>
    setGradesMap(prev => ({
      ...prev,
      [accumId]: { ...prev[accumId], [name]: { ...getGrade(accumId, name), ...patch } },
    }))

  const endAccum = async (id: string) => {
    try {
      const res = await apiClient.patch(`/accumulations/${id}/end`)
      onAccumUpdate?.(res.data.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreate = async (data: NewAccum) => {
    try {
      const formatted = new Date(data.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      const res = await apiClient.post('/accumulations', {
        title: data.title,
        type: data.type,
        source: "school",
        createdBy: "School",
        courses: data.courses,
        deadline: formatted,
        duration: data.duration,
        points: Number(data.points),
        description: data.description,
        skillTags: data.skillTags,
        resourceLink: data.resourceLink,
        objectives: [],
        inCharge: data.inCharge,
        challenges: data.challenges,
        modules: data.modules,
        agenda: data.agenda,
        tasks: data.tasks,
      })
      onAccumCreate?.(res.data.data)
      setShowModal(false)
    } catch (err) {
      console.error(err)
    }
  }

  if (selectedPerson && selectedAccum) {
    const initials = selectedPerson.name.split(" ").filter(w => /^[A-Z]/.test(w)).map(w => w[0]).join("").slice(0, 2)
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="icon" onClick={onBack}><ChevronLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{selectedPerson.name}</h1>
            <p className="text-muted-foreground">{selectedPerson.role}</p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-xl font-bold text-primary">{initials}</span>
              </div>
              <div>
                <CardTitle>{selectedPerson.name}</CardTitle>
                <CardDescription>{selectedPerson.role}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground shrink-0" /><span>{selectedPerson.email}</span></div>
            <div className="pt-2"><p className="text-sm text-muted-foreground">Responsible for: {selectedAccum.title}</p></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (selectedStudent && selectedAccum) {
    const course = COURSES.find(c => c.students.some(s => s.id === selectedStudent.id))
    if (!course) return null
    const initials = selectedStudent.name.split(" ").map(n => n[0]).join("")
    const topField = [...selectedStudent.performance].sort((a, b) => b.score - a.score)[0]
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="icon" onClick={onBack}><ChevronLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{selectedStudent.name}</h1>
            <p className="text-muted-foreground">{course.code} · {selectedStudent.year}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="GPA" value={String(selectedStudent.gpa)} description="current standing" icon={TrendingUp} trend={selectedStudent.gpa >= 3.5 ? "Dean's List" : selectedStudent.status} trendUp={selectedStudent.gpa >= 3.5} />
          <StatCard title="Status" value={selectedStudent.status} description="enrolment status" icon={GraduationCap} trend={selectedStudent.year} trendUp={selectedStudent.status === "Active"} />
          <StatCard title="Top Field" value={topField.field} description="highest performance" icon={Trophy} trend={`${topField.score}%`} trendUp />
          <StatCard title="Accumulations" value={String(selectedStudent.completedAccums.length)} description="completed" icon={Layers} trend="tasks done" trendUp={selectedStudent.completedAccums.length > 0} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold text-primary">{initials}</span>
                </div>
                <div>
                  <CardTitle>{selectedStudent.name}</CardTitle>
                  <CardDescription>{selectedStudent.id}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground shrink-0" /><span>{selectedStudent.email}</span></div>
              <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground shrink-0" /><span>{selectedStudent.phone}</span></div>
              <div className="flex items-center gap-2 text-sm"><BookOpen className="h-4 w-4 text-muted-foreground shrink-0" /><span>{course.name}</span></div>
              <div className="pt-2"><StatusBadge status={selectedStudent.status} /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Academic Performance</CardTitle>
              <CardDescription>Performance scores across key fields in {course.code}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedStudent.performance.map(p => <PerformanceBar key={p.field} field={p.field} score={p.score} />)}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Completed Accumulations</CardTitle>
            <CardDescription>Tasks, challenges and courses this student has finished</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedStudent.completedAccums.length === 0 ? (
              <p className="text-sm text-muted-foreground">No accumulations completed yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedStudent.completedAccums.map(a => (
                  <span key={a} className="text-xs px-3 py-1 rounded-full border bg-muted/40 font-medium">{a}</span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (selectedAccum) {
    const TypeIcon = typeIcon(selectedAccum.type)
    const sourceColor = selectedAccum.source === "school" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
    const accum = accums.find(a => (a._id ?? a.id) === (selectedAccum._id ?? selectedAccum.id)) ?? selectedAccum
    const accumId = accum._id ?? accum.id
    const isEnded = accum.status === "Ended"
    const canEnd = accum.source === "school" && (accum.status === "Active" || accum.status === "Closing Soon")

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" size="icon" onClick={onBack}><ChevronLeft className="h-5 w-5" /></Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{accum.title}</h1>
              <p className="text-muted-foreground">Created by {accum.createdBy}</p>
            </div>
          </div>
          {canEnd && (
            <Button variant="destructive" size="sm" onClick={() => endAccum(accumId)}>End Accumulation</Button>
          )}
          {isEnded && (
            <span className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-700 font-medium">Ended</span>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Points" value={String(accum.points)} description="performance points" icon={Trophy} trend="on completion" trendUp />
          <StatCard title="Duration" value={accum.duration} description="estimated time" icon={Clock} trend={accum.deadline} trendUp />
          <StatCard title="Participants" value={String(accum.participants)} description="students enrolled" icon={Users} trend="active" trendUp={accum.participants > 0} />
          <StatCard title="Field" value={accum.field} description="performance area" icon={TrendingUp} trend="boosted" trendUp />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <TypeIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>About this Accumulation</CardTitle>
                  <CardDescription>
                    <span className={`text-xs px-2 py-0.5 rounded-full mr-1 ${sourceColor}`}>{accum.source === "school" ? "School" : "Company"}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full mr-1 bg-muted text-muted-foreground">{accum.type}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(accum.status)}`}>{accum.status}</span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">{accum.description}</p>
              <div className="flex flex-wrap gap-1">
                {accum.courses.map(c => <span key={c} className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{c}</span>)}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Deadline:</span>
                <span className="font-medium">{accum.deadline}</span>
              </div>
              {accum.skillTags && accum.skillTags.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">Skills gained</p>
                  <div className="flex flex-wrap gap-1.5">
                    {accum.skillTags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
              {accum.resourceLink && (
                <div className="flex items-center gap-2 text-sm">
                  <Link className="h-4 w-4 text-muted-foreground shrink-0" />
                  <a href={accum.resourceLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">{accum.resourceLink}</a>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Learning Objectives</CardTitle>
              <CardDescription>What students will achieve upon completion</CardDescription>
            </CardHeader>
            <CardContent>
              {accum.objectives.length === 0 ? (
                <p className="text-sm text-muted-foreground">No objectives specified.</p>
              ) : (
                <ul className="space-y-3">
                  {accum.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">{i + 1}</span>
                      </div>
                      <span className="text-sm">{obj}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>People in Charge</CardTitle>
              <CardDescription>Facilitators and coordinators responsible for this accumulation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {accum.inCharge.length === 0 ? (
                <p className="text-sm text-muted-foreground">No facilitators assigned.</p>
              ) : (
                accum.inCharge.map(person => {
                  const initials = person.name.split(" ").filter(w => /^[A-Z]/.test(w)).map(w => w[0]).join("").slice(0, 2)
                  return (
                    <button
                      type="button"
                      key={person.email}
                      onClick={() => onSelectPerson(person)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 hover:border-primary transition-all cursor-pointer"
                    >
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-medium text-primary">{initials}</span>
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-medium">{person.name}</p>
                        <p className="text-xs text-muted-foreground">{person.role}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                        <Mail className="h-3.5 w-3.5" />
                        <span className="hidden sm:block">{person.email}</span>
                      </div>
                      <ChevronLeft className="h-4 w-4 text-muted-foreground rotate-180 shrink-0" />
                    </button>
                  )
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{isEnded ? "Grade Participants" : "Participants"}</CardTitle>
                  <CardDescription>
                    {accum.participantList.length === 0
                      ? "No participants yet"
                      : isEnded
                        ? `${accum.participantList.length} participant${accum.participantList.length !== 1 ? "s" : ""} to grade`
                        : `${accum.participantList.filter(p => p.status === "Completed").length} of ${accum.participantList.length} completed`}
                  </CardDescription>
                </div>
                {isEnded && <ClipboardList className="h-5 w-5 text-primary" />}
              </div>
            </CardHeader>
            <CardContent>
              {accum.participantList.length === 0 ? (
                <p className="text-sm text-muted-foreground">Registrations open when the accumulation starts.</p>
              ) : isEnded ? (
                <div className="space-y-3">
                  {accum.participantList.map(p => {
                    const initials = p.name.split(" ").map(n => n[0]).join("")
                    const g = getGrade(accumId, p.name)
                    const isOpen = gradingName === p.name
                    const graded = g.grade || Object.keys(g.skillRatings).length > 0 || g.feedback
                    return (
                      <div key={p.name} className="rounded-lg border bg-muted/20 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setGradingName(isOpen ? null : p.name)}
                          className="w-full flex items-center justify-between p-2.5 hover:bg-muted/40 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="text-xs font-medium text-primary">{initials}</span>
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-medium">{p.name}</p>
                              <p className="text-xs text-muted-foreground">{p.course}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {graded && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Graded</span>}
                            <ChevronLeft className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "-rotate-90" : "rotate-180"}`} />
                          </div>
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4 pt-1 space-y-3 border-t bg-background">
                            <div className="space-y-1">
                              <label className="text-xs font-medium">Grade</label>
                              <input
                                value={g.grade}
                                onChange={e => setGrade(accumId, p.name, { grade: e.target.value })}
                                placeholder="e.g. 92 or A"
                                className={inputCls}
                              />
                            </div>
                            {accum.skillTags && accum.skillTags.length > 0 && (
                              <div className="space-y-2">
                                <label className="text-xs font-medium">Skill Ratings</label>
                                <div className="space-y-1.5">
                                  {accum.skillTags.map(tag => (
                                    <div key={tag} className="flex items-center justify-between">
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{tag}</span>
                                      <StarRating
                                        value={g.skillRatings[tag] ?? 0}
                                        onChange={v => setGrade(accumId, p.name, { skillRatings: { ...g.skillRatings, [tag]: v } })}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div className="space-y-1">
                              <label className="text-xs font-medium">Feedback</label>
                              <textarea
                                rows={2}
                                value={g.feedback}
                                onChange={e => setGrade(accumId, p.name, { feedback: e.target.value })}
                                placeholder="Write feedback for this student..."
                                className={`${inputCls} resize-none`}
                              />
                            </div>
                            <div className="flex justify-end">
                              <Button size="sm" type="button" onClick={() => setGradingName(null)}>Save</Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  {accum.participantList.map(p => {
                    const initials = p.name.split(" ").map(n => n[0]).join("")
                    const student = COURSES.flatMap(c => c.students).find(s => s.name === p.name)
                    const course = COURSES.find(c => c.students.some(s => s.name === p.name))
                    const statusBadge = <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === "Completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{p.status}</span>
                    const avatar = (
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-medium text-primary">{initials}</span>
                      </div>
                    )
                    if (!student || !course) return (
                      <div key={p.name} className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20">
                        <div className="flex items-center gap-3">{avatar}<div><p className="text-sm font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.course}</p></div></div>
                        {statusBadge}
                      </div>
                    )
                    return (
                      <button
                        type="button"
                        key={p.name}
                        onClick={() => onSelectStudent(student, course)}
                        className="w-full flex items-center justify-between p-2.5 rounded-lg border bg-muted/20 hover:bg-muted/40 hover:border-primary transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3">{avatar}<div className="text-left"><p className="text-sm font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.course}</p></div></div>
                        <div className="flex items-center gap-2">{statusBadge}<ChevronLeft className="h-4 w-4 text-muted-foreground rotate-180 shrink-0" /></div>
                      </button>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const filtered = (accums ?? []).filter(a => a.source === tab)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accumulations</h1>
          <p className="text-muted-foreground">Tasks, challenges, courses and events that boost student academic performance.</p>
        </div>
        <Button className="gap-2" onClick={() => setShowModal(true)}><Plus className="h-4 w-4" />Create Accumulation</Button>
        {showModal && <CreateAccumulationModal onClose={() => setShowModal(false)} onSubmit={handleCreate} />}
      </div>

      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        <button type="button" onClick={() => setTab("school")} className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === "school" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
          <School className="h-4 w-4" />School
        </button>
        <button type="button" onClick={() => setTab("company")} className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === "company" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
          <Building2 className="h-4 w-4" />Companies
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total" value={String(filtered.length)} description={tab === "school" ? "school accumulations" : "company accumulations"} icon={Layers} trend="active" trendUp />
        <StatCard title="Total Participants" value={String(filtered.reduce((s, a) => s + a.participants, 0))} description="students enrolled" icon={Users} trend="across all" trendUp />
        <StatCard title="Total Points Available" value={String(filtered.reduce((s, a) => s + a.points, 0))} description="performance points" icon={Trophy} trend="earnable" trendUp />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(accum => {
          const Icon = typeIcon(accum.type)
          return (
            <button type="button" key={accum._id ?? accum.id} onClick={() => onSelectAccum(accum)} className="text-left">
              <Card className="hover:border-primary hover:shadow-md transition-all cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(accum.status)}`}>{accum.status}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${typeColor(accum.type)}`}>{accum.type}</span>
                    </div>
                  </div>
                  <CardTitle className="text-base mt-2">{accum.title}</CardTitle>
                  <CardDescription>{accum.field}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {accum.courses.map(c => <span key={c} className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{c}</span>)}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /><span>{accum.duration}</span></div>
                    <div className="flex items-center gap-1"><Trophy className="h-3.5 w-3.5" /><span>{accum.points} pts</span></div>
                    <div className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /><span>{accum.participants} enrolled</span></div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0" /><span>Due {accum.deadline}</span>
                  </div>
                </CardContent>
              </Card>
            </button>
          )
        })}
      </div>
    </div>
  )
}
