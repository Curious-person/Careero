"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, GraduationCap, TrendingUp, ChevronLeft, Mail, Phone, Layers, Trophy, Search, ArrowUpDown, UserCheck, Clock, Pencil, Trash2, Plus, ShieldCheck, X, CheckCircle, BookMarked } from "lucide-react"
import { COURSES, PENDING_STUDENTS } from "../_data/school-data"
import { StatCard, PerformanceBar, StatusBadge } from "../_components/shared"
import type { Student, PendingStudent } from "../_data/school-data"
import type { Accum } from "../accumulations/AccumulationsPage"

const COURSE_CODES = COURSES.map(c => c.code)

function PendingForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: PendingStudent
  onSave: (data: Omit<PendingStudent, "id" | "registeredAt">) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    course: initial?.course ?? COURSE_CODES[0],
    year: initial?.year ?? "1st Year",
  })
  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"]
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const inputCls = "w-full px-3 py-2 text-sm rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background rounded-xl border shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{initial ? "Edit Pending Student" : "Add Pending Student"}</h2>
          <button type="button" title="Close" onClick={onCancel}><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>
        <div className="space-y-3">
          {(["name", "email", "phone"] as const).map(k => (
            <div key={k}>
              <label className="text-xs font-medium capitalize text-muted-foreground">{k}</label>
              <input className={inputCls} value={form[k]} onChange={e => set(k, e.target.value)} placeholder={k} />
            </div>
          ))}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Course</label>
            <select title="Select course" className={inputCls} value={form.course} onChange={e => set("course", e.target.value)}>
              {COURSE_CODES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Year</label>
            <select title="Select year" className={inputCls} value={form.year} onChange={e => set("year", e.target.value)}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="button" onClick={() => onSave(form)} disabled={!form.name || !form.email}>
            {initial ? "Save Changes" : "Add Student"}
          </Button>
        </div>
      </div>
    </div>
  )
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
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("name")

  const [pending, setPending] = useState<PendingStudent[]>(PENDING_STUDENTS)
  const [selectedPending, setSelectedPending] = useState<PendingStudent | null>(null)
  const [formTarget, setFormTarget] = useState<PendingStudent | "new" | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PendingStudent | null>(null)
  const [pendingSearch, setPendingSearch] = useState("")
  const [pendingSort, setPendingSort] = useState("name")

  // ── Pending CRUD helpers ──────────────────────────────────────────────────
  function handleSave(data: Omit<PendingStudent, "id" | "registeredAt">) {
    if (formTarget === "new") {
      const newEntry: PendingStudent = {
        ...data,
        id: `pnd-${Date.now()}`,
        registeredAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      }
      setPending(p => [...p, newEntry])
    } else if (formTarget) {
      setPending(p => p.map(s => s.id === formTarget.id ? { ...s, ...data } : s))
      if (selectedPending?.id === formTarget.id) setSelectedPending(prev => prev ? { ...prev, ...data } : prev)
    }
    setFormTarget(null)
  }

  function handleDelete(target: PendingStudent) {
    setPending(p => p.filter(s => s.id !== target.id))
    if (selectedPending?.id === target.id) setSelectedPending(null)
    setDeleteTarget(null)
  }

  function handleVerify(target: PendingStudent) {
    setPending(p => p.filter(s => s.id !== target.id))
    setSelectedPending(null)
  }

  // ── Verified student detail view ──────────────────────────────────────────
  if (selectedStudent && selectedCourse) {
    const initials = selectedStudent.name.split(" ").map(n => n[0]).join("")
    const topField = [...selectedStudent.performance].sort((a, b) => b.score - a.score)[0]
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="icon" title="Go back" onClick={onBack}><ChevronLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{selectedStudent.name}</h1>
            <p className="text-muted-foreground">{selectedCourse.code} · {selectedStudent.year}</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="GPA" value={String(selectedStudent.gpa)} description="current standing" icon={TrendingUp} trend={selectedStudent.gpa >= 3.5 ? "Dean's List" : selectedStudent.status} trendUp={selectedStudent.gpa >= 3.5} />
          <StatCard title="Status" value={selectedStudent.status} description="enrolment status" icon={GraduationCap} trend={selectedStudent.year} trendUp={selectedStudent.status === "Active"} />
          <StatCard title="Top Field" value={topField.field} description="highest performance" icon={Trophy} trend={`${topField.score}%`} trendUp />
          <StatCard title="Accumulations" value={String(selectedStudent.completedAccums.length)} description="completed" icon={Layers} trend={`${selectedStudent.currentAccums.length} in progress`} trendUp={selectedStudent.completedAccums.length > 0} />
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
              <div className="flex items-center gap-2 text-sm"><BookOpen className="h-4 w-4 text-muted-foreground shrink-0" /><span>{selectedCourse.name}</span></div>
              <div className="pt-2"><StatusBadge status={selectedStudent.status} /></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Academic Performance</CardTitle>
              <CardDescription>Performance scores across key fields in {selectedCourse.code}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedStudent.performance.map(p => <PerformanceBar key={p.field} field={p.field} score={p.score} />)}
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BookMarked className="h-4 w-4 text-blue-500" />In Progress</CardTitle>
            <CardDescription>Accumulations this student is currently taking</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedStudent.currentAccums.length === 0 ? (
              <p className="text-sm text-muted-foreground">No accumulations in progress.</p>
            ) : (
              <div className="space-y-2">
                {selectedStudent.currentAccums.map(title => {
                  const accum = accums.find(a => a.title === title)
                  return (
                    <button
                      key={title}
                      type="button"
                      onClick={() => accum && onSelectAccum(accum)}
                      disabled={!accum}
                      className="w-full text-left flex items-center justify-between p-3 rounded-lg border bg-blue-50/40 hover:bg-blue-50/70 hover:border-blue-300 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <BookMarked className="h-4 w-4 text-blue-500 shrink-0" />
                        <span className="text-sm font-medium">{title}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {accum && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{accum.type}</span>}
                        <ChevronLeft className="h-4 w-4 text-muted-foreground rotate-180" />
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Completed Accumulations</CardTitle>
            <CardDescription>Tasks, challenges and courses this student has finished</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedStudent.completedAccums.length === 0 ? (
              <p className="text-sm text-muted-foreground">No accumulations completed yet.</p>
            ) : (
              <div className="space-y-2">
                {selectedStudent.completedAccums.map(title => {
                  const accum = accums.find(a => a.title === title)
                  return (
                    <button
                      key={title}
                      type="button"
                      onClick={() => accum && onSelectAccum(accum)}
                      disabled={!accum}
                      className="w-full text-left flex items-center justify-between p-3 rounded-lg border bg-green-50/40 hover:bg-green-50/70 hover:border-green-300 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                        <span className="text-sm font-medium">{title}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {accum && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">{accum.type}</span>}
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

  // ── Pending student detail view ───────────────────────────────────────────
  if (selectedPending) {
    const initials = selectedPending.name.split(" ").map(n => n[0]).join("")
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
                <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground shrink-0" /><span>{selectedPending.phone}</span></div>
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
                  onClick={() => setDeleteTarget({ ...selectedPending, _verify: true } as PendingStudent & { _verify: boolean })}
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
              {(deleteTarget as PendingStudent & { _verify?: boolean })._verify ? (
                <>
                  <h2 className="text-lg font-semibold">Verify Student</h2>
                  <p className="text-sm text-muted-foreground">Are you sure you want to verify <span className="font-medium text-foreground">{deleteTarget.name}</span>? Their account will be activated as a verified student.</p>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                    <Button type="button" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleVerify(deleteTarget)}>
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
                    <Button type="button" variant="destructive" onClick={() => handleDelete(deleteTarget)}>Delete</Button>
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
    const filtered = selectedCourse.students
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
            <p className="text-muted-foreground">{selectedCourse.name} — {selectedCourse.enrolled} students enrolled</p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle>Student List</CardTitle>
                <CardDescription>All enrolled students in {selectedCourse.code}</CardDescription>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex items-center gap-1.5 border rounded-md px-2 py-2 bg-background text-sm">
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  <select value={sort} onChange={e => setSort(e.target.value)} title="Sort students" className="bg-transparent focus:outline-none text-sm cursor-pointer">
                    <option value="name">Name</option>
                    <option value="gpa">GPA</option>
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
                  const initials = student.name.split(" ").map(n => n[0]).join("")
                  return (
                    <button type="button" key={student.id} onClick={() => onSelectStudent(student)} className="w-full text-left flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 hover:border-primary transition-all">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-medium text-primary">{initials}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.id} · {student.year}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground hidden sm:block">GPA {student.gpa}</span>
                        <StatusBadge status={student.status} />
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
          {COURSES.map(course => {
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
                    <CardDescription>{course.students.length} students listed</CardDescription>
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
                    const initials = student.name.split(" ").map(n => n[0]).join("")
                    return (
                      <div key={student.id} className="flex items-center justify-between p-3 rounded-lg border bg-yellow-50/40 hover:bg-yellow-50/70 transition-all">
                        <button type="button" className="flex items-center gap-3 flex-1 text-left" onClick={() => setSelectedPending(student)}>
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
