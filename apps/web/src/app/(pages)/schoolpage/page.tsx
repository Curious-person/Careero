"use client"

import { useState } from "react"
import DashboardLayout from "@/components/layouts/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Users, BookOpen, GraduationCap, TrendingUp, ArrowUpRight, CheckCircle, Clock, LayoutDashboard, Settings, ChevronLeft, Building2, MapPin, Globe, Mail, Phone, Briefcase, Star, Shield, Network, Layers, Trophy, CalendarDays, School, Search } from "lucide-react"

type View = "dashboard" | "students" | "companies" | "accumulations"
type AccumSource = "school" | "company"

type Student = {
  name: string; id: string; year: string; status: string
  email: string; phone: string; gpa: number
  performance: { field: string; score: number }[]
  completedAccums: string[]
}

const COURSES = [
  {
    code: "BSIT",
    name: "BS Information Technology",
    enrolled: 210,
    capacity: 250,
    students: [
      { name: "Amara Osei",   id: "2021-0001", year: "3rd Year", status: "Active",    email: "amara.osei@school.edu",   phone: "+63 912 001 0001", gpa: 3.8, performance: [{ field: "Network Administration", score: 92 }, { field: "Cybersecurity", score: 85 }, { field: "Cloud Computing", score: 78 }], completedAccums: ["Networking Fundamentals Challenge", "Cybersecurity Awareness Task"] },
      { name: "Liam Nkosi",   id: "2021-0002", year: "3rd Year", status: "Active",    email: "liam.nkosi@school.edu",   phone: "+63 912 001 0002", gpa: 3.5, performance: [{ field: "Network Administration", score: 80 }, { field: "Cloud Computing", score: 88 }, { field: "Software Development", score: 74 }], completedAccums: ["NexaCore Cloud Internship Prep"] },
      { name: "Sofia Mensah", id: "2022-0015", year: "2nd Year", status: "Active",    email: "sofia.mensah@school.edu", phone: "+63 912 001 0015", gpa: 3.6, performance: [{ field: "Cybersecurity", score: 90 }, { field: "Network Administration", score: 76 }, { field: "Data Analytics", score: 82 }], completedAccums: ["Cybersecurity Awareness Task", "Business Analytics Bootcamp"] },
      { name: "James Owusu", id: "2022-0016", year: "2nd Year", status: "Probation", email: "james.owusu@school.edu",  phone: "+63 912 001 0016", gpa: 2.1, performance: [{ field: "Network Administration", score: 55 }, { field: "Software Development", score: 60 }, { field: "Cloud Computing", score: 50 }], completedAccums: [] },
      { name: "Priya Sharma", id: "2023-0031", year: "1st Year", status: "Active",    email: "priya.sharma@school.edu", phone: "+63 912 001 0031", gpa: 3.9, performance: [{ field: "Software Development", score: 95 }, { field: "Cloud Computing", score: 91 }, { field: "Cybersecurity", score: 88 }], completedAccums: ["NexaCore Cloud Internship Prep", "Cybersecurity Awareness Task"] },
    ] as Student[],
  },
  {
    code: "BSCS",
    name: "BS Computer Science",
    enrolled: 180,
    capacity: 200,
    students: [
      { name: "Carlos Reyes", id: "2021-0042", year: "3rd Year", status: "Active", email: "carlos.reyes@school.edu", phone: "+63 912 002 0042", gpa: 3.7, performance: [{ field: "Software Development", score: 94 }, { field: "Web Development", score: 89 }, { field: "Cybersecurity", score: 80 }], completedAccums: ["Cybersecurity Awareness Task", "Synapse Hackathon: Build & Ship"] },
      { name: "Aisha Diallo", id: "2021-0043", year: "3rd Year", status: "Active", email: "aisha.diallo@school.edu", phone: "+63 912 002 0043", gpa: 3.9, performance: [{ field: "Web Development", score: 97 }, { field: "Mobile Development", score: 92 }, { field: "UI/UX Design", score: 88 }], completedAccums: ["Synapse Hackathon: Build & Ship", "NexaCore Cloud Internship Prep"] },
      { name: "Noah Kimani",  id: "2022-0058", year: "2nd Year", status: "Active", email: "noah.kimani@school.edu",  phone: "+63 912 002 0058", gpa: 3.3, performance: [{ field: "Software Development", score: 78 }, { field: "Cloud Computing", score: 83 }, { field: "Web Development", score: 75 }], completedAccums: ["NexaCore Cloud Internship Prep"] },
      { name: "Mei Lin",      id: "2023-0071", year: "1st Year", status: "Active", email: "mei.lin@school.edu",      phone: "+63 912 002 0071", gpa: 3.6, performance: [{ field: "UI/UX Design", score: 91 }, { field: "Web Development", score: 86 }, { field: "Mobile Development", score: 80 }], completedAccums: ["Synapse Hackathon: Build & Ship"] },
    ] as Student[],
  },
  {
    code: "BSBA",
    name: "BS Business Administration",
    enrolled: 95,
    capacity: 100,
    students: [
      { name: "David Kim",        id: "2021-0089", year: "3rd Year", status: "Active",    email: "david.kim@school.edu",        phone: "+63 912 003 0089", gpa: 3.7, performance: [{ field: "Business Analysis", score: 93 }, { field: "Data Analytics", score: 88 }, { field: "Project Management", score: 85 }], completedAccums: ["Business Analytics Bootcamp", "BrightPath Business Case Challenge"] },
      { name: "Emily Rodriguez",  id: "2022-0094", year: "2nd Year", status: "Active",    email: "emily.rodriguez@school.edu",  phone: "+63 912 003 0094", gpa: 3.5, performance: [{ field: "Business Analysis", score: 87 }, { field: "Communication", score: 92 }, { field: "Project Management", score: 80 }], completedAccums: ["BrightPath Business Case Challenge"] },
      { name: "Samuel Adu",       id: "2022-0095", year: "2nd Year", status: "Probation", email: "samuel.adu@school.edu",       phone: "+63 912 003 0095", gpa: 2.3, performance: [{ field: "Business Analysis", score: 58 }, { field: "Data Analytics", score: 62 }, { field: "Communication", score: 55 }], completedAccums: [] },
      { name: "Fatima Al-Hassan", id: "2023-0110", year: "1st Year", status: "Active",    email: "fatima.alhassan@school.edu", phone: "+63 912 003 0110", gpa: 3.8, performance: [{ field: "Data Analytics", score: 90 }, { field: "Business Analysis", score: 86 }, { field: "Communication", score: 89 }], completedAccums: ["Business Analytics Bootcamp"] },
      { name: "Lucas Ferreira",   id: "2023-0111", year: "1st Year", status: "Active",    email: "lucas.ferreira@school.edu",  phone: "+63 912 003 0111", gpa: 3.4, performance: [{ field: "Project Management", score: 84 }, { field: "Business Analysis", score: 79 }, { field: "Communication", score: 82 }], completedAccums: ["Business Analytics Bootcamp"] },
    ] as Student[],
  },
]

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
        <StudentsView
          selectedCourse={selectedCourse}
          selectedStudent={selectedStudent}
          onSelectCourse={setSelectedCourse}
          onSelectStudent={setSelectedStudent}
          onBack={() => {
            if (selectedStudent) { setSelectedStudent(null) }
            else { setSelectedCourse(null) }
          }}
        />
      )}
      {view === "companies" && (
        <CompaniesView
          selectedCompany={selectedCompany}
          onSelectCompany={setSelectedCompany}
          onBack={() => setSelectedCompany(null)}
        />
      )}
      {view === "accumulations" && (
        <AccumulationsView
          selectedAccum={selectedAccum}
          selectedPerson={selectedPerson}
          selectedStudent={selectedStudent}
          onSelectAccum={setSelectedAccum}
          onSelectPerson={setSelectedPerson}
          onSelectStudent={(student, course) => {
            setSelectedCourse(course)
            setSelectedStudent(student)
            setView("students")
          }}
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

/* ─── Dashboard View ─────────────────────────────────────────────────────── */

function DashboardView() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">School Dashboard</h1>
          <p className="text-muted-foreground">Manage your institution, students and programmes.</p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" />Add Student</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Students" value="1,284" description="32 enrolled this month" icon={GraduationCap} trend="+8%" trendUp />
        <StatCard title="Active Programmes" value="18" description="3 starting next term" icon={BookOpen} trend="+2" trendUp />
        <StatCard title="Staff Members" value="96" description="4 new this quarter" icon={Users} trend="+4%" trendUp />
        <StatCard title="Completion Rate" value="87%" description="Above national avg" icon={TrendingUp} trend="+3%" trendUp />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Active Programmes</CardTitle>
            <CardDescription>Enrolment and progress by programme</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProgrammeItem name="Computer Science" enrolled={210} capacity={250} status="Open" />
            <ProgrammeItem name="Business Administration" enrolled={180} capacity={200} status="Open" />
            <ProgrammeItem name="Graphic Design" enrolled={95} capacity={100} status="Almost Full" />
            <ProgrammeItem name="Data Analytics" enrolled={120} capacity={120} status="Full" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Enrolments</CardTitle>
            <CardDescription>Students who joined recently</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <EnrolmentItem name="Amara Osei" programme="Computer Science" date="Today" status="Confirmed" />
            <EnrolmentItem name="Liam Nkosi" programme="Data Analytics" date="Yesterday" status="Confirmed" />
            <EnrolmentItem name="Sofia Mensah" programme="Business Administration" date="2 days ago" status="Pending" />
            <EnrolmentItem name="James Owusu" programme="Graphic Design" date="3 days ago" status="Confirmed" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>Scheduled activities and deadlines</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <EventItem title="Term 2 Orientation" date="Jan 15, 2025" type="Event" />
            <EventItem title="Enrolment Deadline" date="Jan 20, 2025" type="Deadline" />
            <EventItem title="Staff Training Day" date="Jan 22, 2025" type="Internal" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to manage your school</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickAction title="Add Programme" icon={Plus} href="/schoolpage/programmes/new" />
            <QuickAction title="Enrol Student" icon={GraduationCap} href="/schoolpage/students/enrol" />
            <QuickAction title="View Reports" icon={TrendingUp} href="/schoolpage/reports" />
            <QuickAction title="Manage Staff" icon={Users} href="/schoolpage/staff" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ─── Students View ──────────────────────────────────────────────────────── */

function StudentsView({
  selectedCourse,
  selectedStudent,
  onSelectCourse,
  onSelectStudent,
  onBack,
}: {
  selectedCourse: typeof COURSES[0] | null
  selectedStudent: Student | null
  onSelectCourse: (course: typeof COURSES[0]) => void
  onSelectStudent: (student: Student) => void
  onBack: () => void
}) {
  const [search, setSearch] = useState("")

  // ── Student profile ──────────────────────────────────────────────────────
  if (selectedStudent && selectedCourse) {
    const initials = selectedStudent.name.split(" ").map(n => n[0]).join("")
    const topField = [...selectedStudent.performance].sort((a, b) => b.score - a.score)[0]
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="icon" aria-label="Back to student list" onClick={onBack}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{selectedStudent.name}</h1>
            <p className="text-muted-foreground">{selectedCourse.code} · {selectedStudent.year}</p>
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
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{selectedStudent.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{selectedStudent.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{selectedCourse.name}</span>
              </div>
              <div className="pt-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  selectedStudent.status === "Active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                }`}>{selectedStudent.status}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Academic Performance</CardTitle>
              <CardDescription>Performance scores across key fields in {selectedCourse.code}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedStudent.performance.map((p) => (
                <div key={p.field} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{p.field}</span>
                    <span className={p.score >= 85 ? "text-green-600 font-medium" : p.score >= 70 ? "text-blue-600 font-medium" : "text-yellow-600 font-medium"}>{p.score}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        p.score >= 85 ? "bg-green-500" : p.score >= 70 ? "bg-primary" : "bg-yellow-500"
                      }`}
                      style={{ width: `${p.score}%` }}
                    />
                  </div>
                </div>
              ))}
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
                {selectedStudent.completedAccums.map((a) => (
                  <span key={a} className="text-xs px-3 py-1 rounded-full border bg-muted/40 font-medium">{a}</span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // ── Student list ─────────────────────────────────────────────────────────
  if (selectedCourse) {
    const filtered = selectedCourse.students.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase())
    )

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="icon" aria-label="Back to courses" onClick={onBack}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
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
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name or ID…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No students match &ldquo;{search}&rdquo;</p>
            ) : (
              <div className="space-y-2">
                {filtered.map((student) => {
                  const initials = student.name.split(" ").map(n => n[0]).join("")
                  return (
                    <button
                      type="button"
                      key={student.id}
                      onClick={() => onSelectStudent(student)}
                      className="w-full text-left flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 hover:border-primary transition-all"
                    >
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
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          student.status === "Active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        }`}>{student.status}</span>
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

  // ── Course list ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Students</h1>
        <p className="text-muted-foreground">Select a course to view its enrolled students.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {COURSES.map((course) => {
          const progress = Math.round((course.enrolled / course.capacity) * 100)
          return (
            <button
              type="button"
              key={course.code}
              onClick={() => { setSearch(""); onSelectCourse(course) }}
              className="text-left"
            >
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
                      <span>Enrolment</span>
                      <span>{course.enrolled}/{course.capacity}</span>
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
    </div>
  )
}

/* ─── Accumulations Data ────────────────────────────────────────────────── */

const ACCUMULATIONS = [
  {
    id: "acc-1",
    title: "Networking Fundamentals Challenge",
    type: "Challenge",
    source: "school" as AccumSource,
    createdBy: "IT Department",
    field: "Network Administration",
    courses: ["BSIT"],
    deadline: "Feb 10, 2025",
    duration: "2 weeks",
    points: 150,
    status: "Active",
    participants: 48,
    description: "A hands-on challenge covering OSI model, subnetting, routing protocols and basic network troubleshooting. Students will complete lab simulations and a final practical exam to earn points toward their Networking performance field.",
    objectives: [
      "Understand and apply the OSI and TCP/IP models",
      "Configure basic routing and switching",
      "Perform subnetting calculations",
      "Troubleshoot common network issues",
    ],
    inCharge: [
      { name: "Prof. Ramon Dela Cruz", role: "Lead Facilitator", email: "r.delacruz@school.edu" },
      { name: "Ms. Tricia Santos",     role: "Lab Coordinator",  email: "t.santos@school.edu" },
    ],
    participantList: [
      { name: "Amara Osei",   course: "BSIT", status: "Completed" },
      { name: "Liam Nkosi",   course: "BSIT", status: "In Progress" },
      { name: "Sofia Mensah", course: "BSIT", status: "In Progress" },
      { name: "Priya Sharma", course: "BSIT", status: "Completed" },
    ],
  },
  {
    id: "acc-2",
    title: "Business Analytics Bootcamp",
    type: "Course",
    source: "school" as AccumSource,
    createdBy: "Business Department",
    field: "Data Analytics",
    courses: ["BSBA", "BSIT"],
    deadline: "Mar 1, 2025",
    duration: "4 weeks",
    points: 200,
    status: "Active",
    participants: 62,
    description: "An intensive course on data-driven business decision making. Covers Excel, basic SQL, data visualisation with charts, and interpreting KPIs. Designed to boost students' analytics performance scores recognised by consulting partner companies.",
    objectives: [
      "Analyse business data using spreadsheets and SQL",
      "Build and interpret data visualisations",
      "Identify KPIs relevant to business operations",
      "Present data-backed recommendations",
    ],
    inCharge: [
      { name: "Dr. Marisol Reyes",  role: "Course Director",  email: "m.reyes@school.edu" },
      { name: "Mr. Joel Bautista",  role: "Data Instructor",  email: "j.bautista@school.edu" },
    ],
    participantList: [
      { name: "David Kim",        course: "BSBA", status: "Completed" },
      { name: "Emily Rodriguez",  course: "BSBA", status: "In Progress" },
      { name: "Fatima Al-Hassan", course: "BSBA", status: "Completed" },
      { name: "Lucas Ferreira",   course: "BSBA", status: "Completed" },
      { name: "Sofia Mensah",     course: "BSIT", status: "Completed" },
    ],
  },
  {
    id: "acc-3",
    title: "Cybersecurity Awareness Task",
    type: "Task",
    source: "school" as AccumSource,
    createdBy: "IT Department",
    field: "Cybersecurity",
    courses: ["BSIT", "BSCS"],
    deadline: "Jan 31, 2025",
    duration: "3 days",
    points: 75,
    status: "Closing Soon",
    participants: 91,
    description: "A short awareness task where students complete a series of security scenario quizzes, identify phishing attempts in simulated emails, and write a brief reflection on best practices for personal and organisational cybersecurity.",
    objectives: [
      "Identify common cybersecurity threats",
      "Recognise phishing and social engineering tactics",
      "Apply basic security hygiene practices",
    ],
    inCharge: [
      { name: "Prof. Ramon Dela Cruz", role: "Task Owner",    email: "r.delacruz@school.edu" },
    ],
    participantList: [
      { name: "Amara Osei",   course: "BSIT", status: "Completed" },
      { name: "Sofia Mensah", course: "BSIT", status: "Completed" },
      { name: "Priya Sharma", course: "BSIT", status: "Completed" },
      { name: "Carlos Reyes", course: "BSCS", status: "Completed" },
      { name: "Aisha Diallo", course: "BSCS", status: "In Progress" },
    ],
  },
  {
    id: "acc-4",
    title: "NexaCore Cloud Internship Prep",
    type: "Course",
    source: "company" as AccumSource,
    createdBy: "NexaCore Technologies",
    field: "Cloud Computing",
    courses: ["BSIT", "BSCS"],
    deadline: "Feb 28, 2025",
    duration: "3 weeks",
    points: 250,
    status: "Active",
    participants: 34,
    description: "Created by NexaCore Technologies to prepare students for real-world cloud environments. Covers AWS fundamentals, cloud storage, compute services, and basic DevOps concepts. Completion significantly improves a student's match score for NexaCore internship slots.",
    objectives: [
      "Navigate and use core AWS services",
      "Understand cloud storage and compute concepts",
      "Deploy a simple application to the cloud",
      "Understand basic CI/CD pipelines",
    ],
    inCharge: [
      { name: "Engr. Kevin Tan",    role: "NexaCore Liaison",  email: "k.tan@nexacore.ph" },
      { name: "Ms. Tricia Santos",  role: "School Coordinator", email: "t.santos@school.edu" },
    ],
    participantList: [
      { name: "Liam Nkosi",   course: "BSIT", status: "Completed" },
      { name: "Priya Sharma", course: "BSIT", status: "Completed" },
      { name: "Aisha Diallo", course: "BSCS", status: "Completed" },
      { name: "Noah Kimani",  course: "BSCS", status: "In Progress" },
    ],
  },
  {
    id: "acc-5",
    title: "BrightPath Business Case Challenge",
    type: "Challenge",
    source: "company" as AccumSource,
    createdBy: "BrightPath Consulting",
    field: "Business Analysis",
    courses: ["BSBA"],
    deadline: "Feb 15, 2025",
    duration: "1 week",
    points: 180,
    status: "Active",
    participants: 27,
    description: "BrightPath Consulting presents a real business case scenario where students must analyse the problem, identify root causes, and propose a structured solution. Top performers are fast-tracked for internship consideration at BrightPath.",
    objectives: [
      "Analyse a real-world business problem",
      "Apply structured problem-solving frameworks",
      "Develop and present a business recommendation",
      "Demonstrate communication and analytical skills",
    ],
    inCharge: [
      { name: "Ms. Clara Villanueva", role: "BrightPath HR Lead",   email: "c.villanueva@brightpathconsulting.com" },
      { name: "Dr. Marisol Reyes",   role: "Academic Supervisor",  email: "m.reyes@school.edu" },
    ],
    participantList: [
      { name: "David Kim",       course: "BSBA", status: "Completed" },
      { name: "Emily Rodriguez", course: "BSBA", status: "Completed" },
      { name: "Samuel Adu",      course: "BSBA", status: "In Progress" },
    ],
  },
  {
    id: "acc-6",
    title: "Synapse Hackathon: Build & Ship",
    type: "Event",
    source: "company" as AccumSource,
    createdBy: "Synapse Digital Studio",
    field: "Web Development",
    courses: ["BSCS", "BSIT"],
    deadline: "Mar 8, 2025",
    duration: "48 hours",
    points: 300,
    status: "Upcoming",
    participants: 0,
    description: "A 48-hour hackathon hosted by Synapse Digital Studio where teams of 2–3 students design and build a working web or mobile prototype. Judged on creativity, technical execution, and product thinking. Winners receive direct internship offers from Synapse.",
    objectives: [
      "Build a functional web or mobile prototype in 48 hours",
      "Apply agile and collaborative development practices",
      "Present and pitch the product to a panel of judges",
      "Demonstrate UI/UX and development skills",
    ],
    inCharge: [
      { name: "Mr. Diego Lim",     role: "Synapse Event Lead",   email: "d.lim@synapsedigital.io" },
      { name: "Ms. Tricia Santos", role: "School Coordinator",   email: "t.santos@school.edu" },
    ],
    participantList: [],
  },
]

/* ─── Accumulations View ─────────────────────────────────────────────────── */

function AccumulationsView({
  selectedAccum,
  selectedPerson,
  selectedStudent,
  onSelectAccum,
  onSelectPerson,
  onSelectStudent,
  onBack,
}: {
  selectedAccum: typeof ACCUMULATIONS[0] | null
  selectedPerson: { name: string; role: string; email: string } | null
  selectedStudent: Student | null
  onSelectAccum: (a: typeof ACCUMULATIONS[0]) => void
  onSelectPerson: (person: { name: string; role: string; email: string }) => void
  onSelectStudent: (student: Student, course: typeof COURSES[0]) => void
  onBack: () => void
}) {
  const [tab, setTab] = useState<AccumSource>("school")

  // ── Person profile ──────────────────────────────────────────────────────
  if (selectedPerson && selectedAccum) {
    const initials = selectedPerson.name.split(" ").filter(w => /^[A-Z]/.test(w)).map(w => w[0]).join("").slice(0, 2)
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="icon" aria-label="Back to accumulation" onClick={onBack}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
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
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{selectedPerson.email}</span>
            </div>
            <div className="pt-2">
              <p className="text-sm text-muted-foreground">Responsible for: {selectedAccum.title}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ── Student profile from accumulation ───────────────────────────────────
  if (selectedStudent && selectedAccum) {
    const course = COURSES.find(c => c.students.some(s => s.id === selectedStudent.id))
    if (!course) return null

    const initials = selectedStudent.name.split(" ").map(n => n[0]).join("")
    const topField = [...selectedStudent.performance].sort((a, b) => b.score - a.score)[0]
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="icon" aria-label="Back to accumulation" onClick={onBack}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
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
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{selectedStudent.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{selectedStudent.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{course.name}</span>
              </div>
              <div className="pt-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  selectedStudent.status === "Active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                }`}>{selectedStudent.status}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Academic Performance</CardTitle>
              <CardDescription>Performance scores across key fields in {course.code}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedStudent.performance.map((p) => (
                <div key={p.field} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{p.field}</span>
                    <span className={p.score >= 85 ? "text-green-600 font-medium" : p.score >= 70 ? "text-blue-600 font-medium" : "text-yellow-600 font-medium"}>{p.score}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        p.score >= 85 ? "bg-green-500" : p.score >= 70 ? "bg-primary" : "bg-yellow-500"
                      }`}
                      style={{ width: `${p.score}%` }}
                    />
                  </div>
                </div>
              ))}
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
                {selectedStudent.completedAccums.map((a) => (
                  <span key={a} className="text-xs px-3 py-1 rounded-full border bg-muted/40 font-medium">{a}</span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // ── Accumulation detail ─────────────────────────────────────────────────
  if (selectedAccum) {
    const typeIcon = selectedAccum.type === "Challenge" ? Trophy
      : selectedAccum.type === "Course" ? BookOpen
      : selectedAccum.type === "Event" ? CalendarDays
      : CheckCircle

    const TypeIcon = typeIcon
    const sourceColor = selectedAccum.source === "school" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
    const statusColor = selectedAccum.status === "Active" ? "bg-green-100 text-green-700"
      : selectedAccum.status === "Closing Soon" ? "bg-yellow-100 text-yellow-700"
      : "bg-muted text-muted-foreground"

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="icon" aria-label="Back to accumulations" onClick={onBack}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{selectedAccum.title}</h1>
            <p className="text-muted-foreground">Created by {selectedAccum.createdBy}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Points" value={String(selectedAccum.points)} description="performance points" icon={Trophy} trend="on completion" trendUp />
          <StatCard title="Duration" value={selectedAccum.duration} description="estimated time" icon={Clock} trend={selectedAccum.deadline} trendUp />
          <StatCard title="Participants" value={String(selectedAccum.participants)} description="students enrolled" icon={Users} trend="active" trendUp={selectedAccum.participants > 0} />
          <StatCard title="Field" value={selectedAccum.field} description="performance area" icon={TrendingUp} trend="boosted" trendUp />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0" >
                  <TypeIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>About this Accumulation</CardTitle>
                  <CardDescription>
                    <span className={`text-xs px-2 py-0.5 rounded-full mr-1 ${sourceColor}`}>
                      {selectedAccum.source === "school" ? "School" : "Company"}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full mr-1 bg-muted text-muted-foreground`}>{selectedAccum.type}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor}`}>{selectedAccum.status}</span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">{selectedAccum.description}</p>
              <div className="flex flex-wrap gap-1">
                {selectedAccum.courses.map(c => (
                  <span key={c} className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{c}</span>
                ))}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Deadline:</span>
                <span className="font-medium">{selectedAccum.deadline}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Learning Objectives</CardTitle>
              <CardDescription>What students will achieve upon completion</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {selectedAccum.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">{i + 1}</span>
                    </div>
                    <span className="text-sm">{obj}</span>
                  </li>
                ))}
              </ul>
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
              {selectedAccum.inCharge.map((person) => {
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
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Participants</CardTitle>
              <CardDescription>
                {selectedAccum.participantList.length === 0
                  ? "No participants yet"
                  : `${selectedAccum.participantList.filter(p => p.status === "Completed").length} of ${selectedAccum.participantList.length} completed`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedAccum.participantList.length === 0 ? (
                <p className="text-sm text-muted-foreground">Registrations open when the accumulation starts.</p>
              ) : (
                <div className="space-y-2">
                  {selectedAccum.participantList.map((p) => {
                    const initials = p.name.split(" ").map(n => n[0]).join("")
                    const student = COURSES.flatMap(c => c.students).find(s => s.name === p.name)
                    const course = COURSES.find(c => c.students.some(s => s.name === p.name))
                    
                    if (!student || !course) {
                      return (
                        <div key={p.name} className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="text-xs font-medium text-primary">{initials}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{p.name}</p>
                              <p className="text-xs text-muted-foreground">{p.course}</p>
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            p.status === "Completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                          }`}>{p.status}</span>
                        </div>
                      )
                    }

                    return (
                      <button
                        type="button"
                        key={p.name}
                        onClick={() => onSelectStudent(student, course)}
                        className="w-full flex items-center justify-between p-2.5 rounded-lg border bg-muted/20 hover:bg-muted/40 hover:border-primary transition-all cursor-pointer"
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
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            p.status === "Completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                          }`}>{p.status}</span>
                          <ChevronLeft className="h-4 w-4 text-muted-foreground rotate-180 shrink-0" />
                        </div>
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

  const filtered = ACCUMULATIONS.filter(a => a.source === tab)

  const typeIcon = (type: string) =>
    type === "Challenge" ? Trophy
    : type === "Course" ? BookOpen
    : type === "Event" ? CalendarDays
    : CheckCircle

  const statusColor = (s: string) =>
    s === "Active" ? "bg-green-100 text-green-700"
    : s === "Closing Soon" ? "bg-yellow-100 text-yellow-700"
    : "bg-muted text-muted-foreground"

  const typeColor = (t: string) =>
    t === "Challenge" ? "bg-orange-100 text-orange-700"
    : t === "Course" ? "bg-blue-100 text-blue-700"
    : t === "Event" ? "bg-purple-100 text-purple-700"
    : "bg-muted text-muted-foreground"

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accumulations</h1>
          <p className="text-muted-foreground">Tasks, challenges, courses and events that boost student academic performance.</p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" />Create Accumulation</Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setTab("school")}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            tab === "school" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <School className="h-4 w-4" />School
        </button>
        <button
          type="button"
          onClick={() => setTab("company")}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            tab === "company" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building2 className="h-4 w-4" />Companies
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total"
          value={String(filtered.length)}
          description={tab === "school" ? "school accumulations" : "company accumulations"}
          icon={Layers}
          trend="active"
          trendUp
        />
        <StatCard
          title="Total Participants"
          value={String(filtered.reduce((s, a) => s + a.participants, 0))}
          description="students enrolled"
          icon={Users}
          trend="across all"
          trendUp
        />
        <StatCard
          title="Total Points Available"
          value={String(filtered.reduce((s, a) => s + a.points, 0))}
          description="performance points"
          icon={Trophy}
          trend="earnable"
          trendUp
        />
      </div>

      {/* Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((accum) => {
          const Icon = typeIcon(accum.type)
          return (
            <button type="button" key={accum.id} onClick={() => onSelectAccum(accum)} className="text-left">
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
                    {accum.courses.map(c => (
                      <span key={c} className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{c}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{accum.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="h-3.5 w-3.5" />
                      <span>{accum.points} pts</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      <span>{accum.participants} enrolled</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                    <span>Due {accum.deadline}</span>
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

/* ─── Companies Data ─────────────────────────────────────────────────────── */

const COMPANIES = [
  {
    name: "NexaCore Technologies",
    industry: "Information Technology",
    location: "Makati City, Metro Manila",
    website: "www.nexacore.ph",
    email: "internships@nexacore.ph",
    phone: "+63 2 8123 4567",
    partnerSince: "2021",
    status: "Active Partner",
    slots: 12,
    slotsAvailable: 5,
    about: "NexaCore Technologies is a leading IT solutions provider specializing in enterprise software, cloud infrastructure, and cybersecurity services across Southeast Asia. They actively take in interns from partner schools to build a pipeline of skilled graduates.",
    lookingFor: ["BSIT", "BSCS"],
    preferredSkills: [
      { field: "Network Administration", weight: "High" },
      { field: "Cybersecurity", weight: "High" },
      { field: "Cloud Computing", weight: "Medium" },
      { field: "Software Development", weight: "Medium" },
    ],
    currentInterns: [
      { name: "Amara Osei", course: "BSIT", status: "Ongoing" },
      { name: "Carlos Reyes", course: "BSCS", status: "Ongoing" },
    ],
  },
  {
    name: "BrightPath Consulting",
    industry: "Business & Management Consulting",
    location: "BGC, Taguig City",
    website: "www.brightpathconsulting.com",
    email: "hr@brightpathconsulting.com",
    phone: "+63 2 8765 4321",
    partnerSince: "2022",
    status: "Active Partner",
    slots: 8,
    slotsAvailable: 3,
    about: "BrightPath Consulting helps mid-to-large enterprises optimize operations and strategy. Their internship programme focuses on business analysis, project management, and data-driven decision making, ideal for business and IT students.",
    lookingFor: ["BSBA", "BSIT"],
    preferredSkills: [
      { field: "Business Analysis", weight: "High" },
      { field: "Data Analytics", weight: "High" },
      { field: "Project Management", weight: "Medium" },
      { field: "Communication", weight: "Medium" },
    ],
    currentInterns: [
      { name: "David Kim", course: "BSBA", status: "Ongoing" },
    ],
  },
  {
    name: "Synapse Digital Studio",
    industry: "Software Development & Design",
    location: "Cebu City, Cebu",
    website: "www.synapsedigital.io",
    email: "careers@synapsedigital.io",
    phone: "+63 32 412 8900",
    partnerSince: "2023",
    status: "New Partner",
    slots: 6,
    slotsAvailable: 6,
    about: "Synapse Digital Studio is a fast-growing product studio building web and mobile applications for startups and SMEs. They offer hands-on internship experience in full-stack development, UI/UX design, and agile product delivery.",
    lookingFor: ["BSCS", "BSIT"],
    preferredSkills: [
      { field: "Web Development", weight: "High" },
      { field: "Mobile Development", weight: "High" },
      { field: "UI/UX Design", weight: "Medium" },
      { field: "Agile / Scrum", weight: "Low" },
    ],
    currentInterns: [],
  },
]

/* ─── Companies View ─────────────────────────────────────────────────────── */

function CompaniesView({
  selectedCompany,
  onSelectCompany,
  onBack,
}: {
  selectedCompany: typeof COMPANIES[0] | null
  onSelectCompany: (company: typeof COMPANIES[0]) => void
  onBack: () => void
}) {
  if (selectedCompany) {
    const slotProgress = Math.round(((selectedCompany.slots - selectedCompany.slotsAvailable) / selectedCompany.slots) * 100)
    const weightColor = (w: string) =>
      w === "High" ? "bg-blue-100 text-blue-700" :
      w === "Medium" ? "bg-purple-100 text-purple-700" :
      "bg-muted text-muted-foreground"

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="icon" aria-label="Back to companies" onClick={onBack}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{selectedCompany.name}</h1>
            <p className="text-muted-foreground">{selectedCompany.industry}</p>
          </div>
        </div>

        {/* Top info row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Slots" value={String(selectedCompany.slots)} description="internship positions" icon={Briefcase} trend={`${selectedCompany.slotsAvailable} open`} trendUp={selectedCompany.slotsAvailable > 0} />
          <StatCard title="Current Interns" value={String(selectedCompany.currentInterns.length)} description="from this school" icon={GraduationCap} trend="ongoing" trendUp />
          <StatCard title="Partner Since" value={selectedCompany.partnerSince} description="years of partnership" icon={Star} trend={`${new Date().getFullYear() - parseInt(selectedCompany.partnerSince)} yrs`} trendUp />
          <StatCard title="Courses Accepted" value={String(selectedCompany.lookingFor.length)} description="degree programmes" icon={BookOpen} trend={selectedCompany.lookingFor.join(", ")} trendUp />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* About + Contact */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedCompany.about}</p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{selectedCompany.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-primary">{selectedCompany.website}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{selectedCompany.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{selectedCompany.phone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Slot availability */}
            <Card>
              <CardHeader>
                <CardTitle>Internship Slots</CardTitle>
                <CardDescription>{selectedCompany.slots - selectedCompany.slotsAvailable} filled · {selectedCompany.slotsAvailable} available</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Capacity used</span>
                  <span>{slotProgress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all" style={{ width: `${slotProgress}%` }} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Skills + Current interns */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Preferred Skills</CardTitle>
                <CardDescription>Academic fields this company prioritises when selecting interns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedCompany.preferredSkills.map((skill) => (
                  <div key={skill.field} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {skill.field.toLowerCase().includes("network") ? <Network className="h-4 w-4 text-muted-foreground" /> :
                       skill.field.toLowerCase().includes("security") ? <Shield className="h-4 w-4 text-muted-foreground" /> :
                       <Star className="h-4 w-4 text-muted-foreground" />}
                      <span className="text-sm">{skill.field}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${weightColor(skill.weight)}`}>{skill.weight}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Interns</CardTitle>
                <CardDescription>Students from this school currently interning here</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedCompany.currentInterns.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No current interns from this school.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedCompany.currentInterns.map((intern) => {
                      const initials = intern.name.split(" ").map(n => n[0]).join("")
                      return (
                        <div key={intern.name} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="text-xs font-medium text-primary">{initials}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{intern.name}</p>
                              <p className="text-xs text-muted-foreground">{intern.course}</p>
                            </div>
                          </div>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">{intern.status}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Partner Companies</h1>
          <p className="text-muted-foreground">Companies partnered with your school for student internship placements.</p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" />Add Company</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {COMPANIES.map((company) => {
          const slotProgress = Math.round(((company.slots - company.slotsAvailable) / company.slots) * 100)
          return (
            <button type="button" key={company.name} onClick={() => onSelectCompany(company)} className="text-left">
              <Card className="hover:border-primary hover:shadow-md transition-all cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                      company.status === "Active Partner" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                    }`}>{company.status}</span>
                  </div>
                  <CardTitle className="text-base mt-2">{company.name}</CardTitle>
                  <CardDescription>{company.industry}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span>{company.location}</span>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {company.lookingFor.map(c => (
                      <span key={c} className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{c}</span>
                    ))}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Slots filled</span>
                      <span>{company.slots - company.slotsAvailable}/{company.slots}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all" style={{ width: `${slotProgress}%` }} />
                    </div>
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

function StudentProfileView({
  student,
  course,
  onBack,
}: {
  student: typeof COURSES[0]["students"][0]
  course: typeof COURSES[0]
  onBack: () => void
}) {
  const initials = student.name.split(" ").map(n => n[0]).join("")

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button type="button" variant="ghost" size="icon" aria-label="Back to student list" onClick={onBack}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{student.name}</h1>
          <p className="text-muted-foreground">{student.id} · {course.name}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
            <CardDescription>Basic details and enrollment status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-medium text-primary">{initials}</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold">{student.name}</h3>
                <p className="text-sm text-muted-foreground">{student.id}</p>
                <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${student.status === "Active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {student.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm font-medium">Programme</p>
                <p className="text-sm text-muted-foreground">{course.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Year Level</p>
                <p className="text-sm text-muted-foreground">{student.year}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Academic Performance</CardTitle>
            <CardDescription>Current academic standing and achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Performance Points</p>
                    <p className="text-xs text-muted-foreground">From accumulations</p>
                  </div>
                </div>
                <span className="text-lg font-bold">245</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Completed Accumulations</p>
                    <p className="text-xs text-muted-foreground">Tasks and challenges</p>
                  </div>
                </div>
                <span className="text-lg font-bold">8</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">GPA</p>
                    <p className="text-xs text-muted-foreground">Current semester</p>
                  </div>
                </div>
                <span className="text-lg font-bold">3.7</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest accumulations and achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
              <div className="h-8 w-8 rounded-md bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-700" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Completed "Networking Fundamentals Challenge"</p>
                <p className="text-xs text-muted-foreground">Earned 150 points · 2 days ago</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
              <div className="h-8 w-8 rounded-md bg-blue-100 flex items-center justify-center">
                <Trophy className="h-4 w-4 text-blue-700" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Top performer in "Business Analytics Bootcamp"</p>
                <p className="text-xs text-muted-foreground">Earned 200 points · 1 week ago</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
              <div className="h-8 w-8 rounded-md bg-yellow-100 flex items-center justify-center">
                <Clock className="h-4 w-4 text-yellow-700" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Enrolled in "Cybersecurity Awareness Task"</p>
                <p className="text-xs text-muted-foreground">Due Jan 31, 2025</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ title, value, description, icon: Icon, trend, trendUp }: {
  title: string; value: string; description: string; icon: React.ElementType; trend: string; trendUp: boolean
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className={trendUp ? "text-green-600 font-medium" : "text-red-500 font-medium"}>{trend}</span>
          <span>{description}</span>
        </div>
      </CardContent>
    </Card>
  )
}

function ProgrammeItem({ name, enrolled, capacity, status }: {
  name: string; enrolled: number; capacity: number; status: string
}) {
  const progress = Math.round((enrolled / capacity) * 100)
  const statusColor = status === "Full" ? "bg-red-100 text-red-700" : status === "Almost Full" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-sm font-medium">{name}</p>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor}`}>{status}</span>
          <span className="text-xs text-muted-foreground">{enrolled}/{capacity} students</span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium">{progress}%</p>
        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  )
}

function EnrolmentItem({ name, programme, date, status }: {
  name: string; programme: string; date: string; status: string
}) {
  const initials = name.split(" ").map(n => n[0]).join("")
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-medium text-primary">{initials}</span>
        </div>
        <div>
          <p className="text-sm font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">{programme}</p>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <span className={`text-xs px-2 py-0.5 rounded-full ${status === "Confirmed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{status}</span>
        <p className="text-xs text-muted-foreground mt-0.5">{date}</p>
      </div>
    </div>
  )
}

function EventItem({ title, date, type }: { title: string; date: string; type: string }) {
  const typeColor = type === "Deadline" ? "bg-red-100 text-red-700" : type === "Internal" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
  const Icon = type === "Deadline" ? Clock : type === "Internal" ? CheckCircle : ArrowUpRight
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
      <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{date}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${typeColor}`}>{type}</span>
      </div>
    </div>
  )
}

function QuickAction({ title, icon: Icon, href }: { title: string; icon: React.ElementType; href: string }) {
  return (
    <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" asChild>
      <a href={href}><Icon className="h-5 w-5" /><span className="text-xs">{title}</span></a>
    </Button>
  )
}
