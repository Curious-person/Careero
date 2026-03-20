"use client"

import DashboardLayout from "@/components/layouts/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Building2, CheckCircle, Clock, GraduationCap, Layers, LayoutDashboard, Settings, TrendingUp, Trophy } from "lucide-react"
import { useState } from "react"
import { StatCard } from "./_components/shared"
import type { Student } from "./_data/school-data"
import { ACCUMULATIONS, COMPANIES, COURSES, PENDING_STUDENTS } from "./_data/school-data"
import AccumulationsPage from "./accumulations/AccumulationsPage"
import CompanyPage from "./company/CompanyPage"
import StudentsPage from "./students/StudentsPage"

type View = "dashboard" | "students" | "companies" | "accumulations"

export default function SchoolPage() {
  const [view, setView] = useState<View>("dashboard")
  const [selectedCourse, setSelectedCourse] = useState<typeof COURSES[0] | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [selectedCompany, setSelectedCompany] = useState<typeof COMPANIES[0] | null>(null)
  const [selectedAccum, setSelectedAccum] = useState<typeof ACCUMULATIONS[0] | null>(null)
  const [selectedPerson, setSelectedPerson] = useState<{ name: string; role: string; email: string } | null>(null)

  const reset = () => { setSelectedCourse(null); setSelectedStudent(null); setSelectedCompany(null); setSelectedAccum(null); setSelectedPerson(null) }

  const navigation = [
    { name: "Dashboard",     icon: LayoutDashboard, onClick: () => { setView("dashboard");     reset() }, active: view === "dashboard" },
    { name: "Students",      icon: GraduationCap,   onClick: () => { setView("students");      reset() }, active: view === "students" },
    { name: "Companies",     icon: Building2,       onClick: () => { setView("companies");     reset() }, active: view === "companies" },
    { name: "Accumulations", icon: Layers,          onClick: () => { setView("accumulations"); reset() }, active: view === "accumulations" },
    { name: "Settings",      icon: Settings,        href: "/schoolpage/settings" },
  ]

  return (
    <DashboardLayout navigation={navigation}>
      {view === "dashboard" && <DashboardView />}
      {view === "students" && (
        <StudentsPage
          selectedCourse={selectedCourse}
          selectedStudent={selectedStudent}
          onSelectCourse={setSelectedCourse}
          onSelectStudent={setSelectedStudent}
          onSelectAccum={(accum: typeof ACCUMULATIONS[0]) => { setSelectedAccum(accum); setSelectedStudent(null); setSelectedCourse(null); setView("accumulations") }}
          onBack={() => selectedStudent ? setSelectedStudent(null) : setSelectedCourse(null)}
        />
      )}
      {view === "companies" && (
        <CompanyPage
          selectedCompany={selectedCompany}
          onSelectCompany={setSelectedCompany}
          onSelectStudent={(student: Student, course: typeof COURSES[0]) => { setSelectedCourse(course); setSelectedStudent(student); setSelectedCompany(null); setView("students") }}
          onBack={() => setSelectedCompany(null)}
        />
      )}
      {view === "accumulations" && (
        <AccumulationsPage
          selectedAccum={selectedAccum}
          selectedPerson={selectedPerson}
          selectedStudent={selectedStudent}
          onSelectAccum={setSelectedAccum}
          onSelectPerson={setSelectedPerson}
          onSelectStudent={(student: Student, course: typeof COURSES[0]) => { setSelectedCourse(course); setSelectedStudent(student); setView("students") }}
          onBack={() => {
            if (selectedPerson) { setSelectedPerson(null) }
            else if (selectedStudent) { setSelectedStudent(null) }
            else { setSelectedAccum(null) }
          }}
        />
      )}
    </DashboardLayout>
  )
}

function DashboardView() {
  const allStudents = COURSES.flatMap(c => c.students)
  const totalStudents = COURSES.reduce((s, c) => s + c.enrolled, 0)
  const activeStudents = allStudents.filter(s => s.status === "Active").length
  const probationStudents = allStudents.filter(s => s.status === "Probation").length
  const avgGpa = (allStudents.reduce((s, st) => s + st.gpa, 0) / allStudents.length).toFixed(2)
  const totalSlots = COMPANIES.reduce((s, c) => s + c.slots, 0)
  const filledSlots = COMPANIES.reduce((s, c) => s + (c.slots - c.slotsAvailable), 0)
  const activeAccums = ACCUMULATIONS.filter(a => a.status === "Active" || a.status === "Closing Soon").length
  const totalAccumPoints = ACCUMULATIONS.reduce((s, a) => s + a.points, 0)

  // GPA buckets
  const gpaBuckets = [
    { label: "3.5–4.0", count: allStudents.filter(s => s.gpa >= 3.5).length, color: "bg-green-500" },
    { label: "3.0–3.4", count: allStudents.filter(s => s.gpa >= 3.0 && s.gpa < 3.5).length, color: "bg-blue-500" },
    { label: "2.5–2.9", count: allStudents.filter(s => s.gpa >= 2.5 && s.gpa < 3.0).length, color: "bg-yellow-500" },
    { label: "< 2.5",   count: allStudents.filter(s => s.gpa < 2.5).length, color: "bg-red-500" },
  ]
  const maxBucket = Math.max(...gpaBuckets.map(b => b.count), 1)

  // Accumulation type breakdown
  const accumTypes = ["Challenge", "Course", "Task", "Event"]
  const accumTypeColors: Record<string, string> = { Challenge: "bg-orange-500", Course: "bg-blue-500", Task: "bg-purple-500", Event: "bg-green-500" }
  const accumTypeCounts = accumTypes.map(t => ({ type: t, count: ACCUMULATIONS.filter(a => a.type === t).length }))
  const maxAccumType = Math.max(...accumTypeCounts.map(a => a.count), 1)

  // Top students by GPA
  const topStudents = [...allStudents].sort((a, b) => b.gpa - a.gpa).slice(0, 5)

  // Performance field averages across all students
  const fieldMap: Record<string, number[]> = {}
  allStudents.forEach(s => s.performance.forEach(p => {
    if (!fieldMap[p.field]) fieldMap[p.field] = []
    fieldMap[p.field].push(p.score)
  }))
  const fieldAvgs = Object.entries(fieldMap)
    .map(([field, scores]) => ({ field, avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) }))
    .sort((a, b) => b.avg - a.avg)
  const maxFieldAvg = Math.max(...fieldAvgs.map(f => f.avg), 1)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">School Dashboard</h1>
          <p className="text-muted-foreground">Overview of students, programmes, companies and accumulations.</p>
        </div>
        
      </div>

      {/* KPI row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Students" value={String(totalStudents)} description={`${activeStudents} active · ${probationStudents} on probation`} icon={GraduationCap} trend={`${PENDING_STUDENTS.length} pending`} trendUp={PENDING_STUDENTS.length === 0} />
        <StatCard title="Average GPA" value={avgGpa} description="across all programmes" icon={TrendingUp} trend={avgGpa >= "3.5" ? "Dean's List avg" : "Good standing"} trendUp={parseFloat(avgGpa) >= 3.0} />
        <StatCard title="Internship Slots" value={`${filledSlots}/${totalSlots}`} description="filled across partners" icon={Briefcase} trend={`${totalSlots - filledSlots} available`} trendUp={totalSlots - filledSlots > 0} />
        <StatCard title="Active Accumulations" value={String(activeAccums)} description={`${totalAccumPoints} pts available`} icon={Layers} trend={`${ACCUMULATIONS.filter(a => a.status === "Closing Soon").length} closing soon`} trendUp />
      </div>

      {/* Enrolment + GPA distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Course Enrolment</CardTitle>
            <CardDescription>Students enrolled vs capacity per programme</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {COURSES.map(course => {
              const pct = Math.round((course.enrolled / course.capacity) * 100)
              const color = pct >= 95 ? "bg-red-500" : pct >= 80 ? "bg-yellow-500" : "bg-primary"
              return (
                <div key={course.code} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{course.code} <span className="text-muted-foreground font-normal text-xs">— {course.name}</span></span>
                    <span className="text-muted-foreground text-xs">{course.enrolled}/{course.capacity} ({pct}%)</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span className="text-green-600">{course.students.filter(s => s.status === "Active").length} active</span>
                    {course.students.filter(s => s.status === "Probation").length > 0 && (
                      <span className="text-yellow-600">{course.students.filter(s => s.status === "Probation").length} probation</span>
                    )}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>GPA Distribution</CardTitle>
            <CardDescription>Student count by GPA range</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4 h-36">
              {gpaBuckets.map(b => (
                <div key={b.label} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-semibold text-foreground">{b.count}</span>
                  <div className="w-full rounded-t-md transition-all" style={{ height: `${Math.round((b.count / maxBucket) * 100)}%`, minHeight: b.count > 0 ? "8px" : "0" }}>
                    <div className={`w-full h-full rounded-t-md ${b.color}`} />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-2">
              {gpaBuckets.map(b => (
                <div key={b.label} className="flex-1 flex items-center gap-1">
                  <div className={`h-2.5 w-2.5 rounded-sm shrink-0 ${b.color}`} />
                  <span className="text-xs text-muted-foreground">{b.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Internship slots + Accumulation types */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Internship Slots by Company</CardTitle>
            <CardDescription>Filled vs available slots per partner</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {COMPANIES.map(company => {
              const filled = company.slots - company.slotsAvailable
              const pct = Math.round((filled / company.slots) * 100)
              return (
                <div key={company.name} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="font-medium">{company.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{filled}/{company.slots} filled</span>
                  </div>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex gap-3 text-xs">
                    <span className="text-green-600">{company.slotsAvailable} open</span>
                    <span className="text-muted-foreground">{company.currentInterns.length} current interns</span>
                    <span className={`${company.status === "Active Partner" ? "text-blue-600" : "text-purple-600"}`}>{company.status}</span>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accumulations Overview</CardTitle>
            <CardDescription>Count by type and status breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-end gap-4 h-28">
              {accumTypeCounts.map(a => (
                <div key={a.type} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-semibold">{a.count}</span>
                  <div className="w-full" style={{ height: `${Math.round((a.count / maxAccumType) * 100)}%`, minHeight: a.count > 0 ? "8px" : "0" }}>
                    <div className={`w-full h-full rounded-t-md ${accumTypeColors[a.type]}`} />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 flex-wrap">
              {accumTypeCounts.map(a => (
                <div key={a.type} className="flex items-center gap-1">
                  <div className={`h-2.5 w-2.5 rounded-sm ${accumTypeColors[a.type]}`} />
                  <span className="text-xs text-muted-foreground">{a.type}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {(["Active", "Closing Soon", "Upcoming"] as const).map(s => {
                const cnt = ACCUMULATIONS.filter(a => a.status === s).length
                const color = s === "Active" ? "bg-green-100 text-green-700" : s === "Closing Soon" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"
                return (
                  <div key={s} className={`rounded-lg p-2 text-center ${color}`}>
                    <p className="text-lg font-bold">{cnt}</p>
                    <p className="text-xs">{s}</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top students + Field performance */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Students by GPA</CardTitle>
            <CardDescription>Highest performing students across all courses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topStudents.map((s, i) => {
              const course = COURSES.find(c => c.students.some(st => st.id === s.id))
              const initials = s.name.split(" ").map(n => n[0]).join("")
              return (
                <div key={s.id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-4 shrink-0">#{i + 1}</span>
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-medium text-primary">{initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{course?.code} · {s.year}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {s.gpa >= 3.5 && <Trophy className="h-3.5 w-3.5 text-yellow-500" />}
                    <span className={`text-sm font-bold ${s.gpa >= 3.5 ? "text-green-600" : "text-foreground"}`}>{s.gpa}</span>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Performance by Field</CardTitle>
            <CardDescription>Mean score across all students per academic field</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {fieldAvgs.map(f => (
              <div key={f.field} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium">{f.field}</span>
                  <span className={f.avg >= 85 ? "text-green-600 font-medium" : f.avg >= 70 ? "text-blue-600 font-medium" : "text-yellow-600 font-medium"}>{f.avg}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${f.avg >= 85 ? "bg-green-500" : f.avg >= 70 ? "bg-primary" : "bg-yellow-500"}`}
                    style={{ width: `${(f.avg / maxFieldAvg) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Pending + Accumulation participants summary */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              Pending Verification
              {PENDING_STUDENTS.length > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">{PENDING_STUDENTS.length}</span>}
            </CardTitle>
            <CardDescription>Students awaiting account review</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {PENDING_STUDENTS.map(s => {
              const initials = s.name.split(" ").map(n => n[0]).join("")
              return (
                <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-lg border bg-yellow-50/40">
                  <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-medium text-yellow-700">{initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.course} · {s.year} · {s.registeredAt}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 shrink-0">Pending</span>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Accumulation Participation
            </CardTitle>
            <CardDescription>Participant count and completion rate per accumulation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {ACCUMULATIONS.filter(a => a.participantList.length > 0).map(a => {
              const completed = a.participantList.filter(p => p.status === "Completed").length
              const pct = Math.round((completed / a.participantList.length) * 100)
              return (
                <div key={a.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium truncate max-w-[60%]">{a.title}</span>
                    <span className="text-muted-foreground shrink-0">{completed}/{a.participantList.length} done ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
