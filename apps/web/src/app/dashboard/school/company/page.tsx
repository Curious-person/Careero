"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, MapPin, Globe, Mail, Phone, Briefcase, Star, Shield, Network, GraduationCap, BookOpen, ChevronLeft, Plus, ChevronDown, ChevronRight } from "lucide-react"
import { COMPANIES, COURSES } from "../_data/school-data"
import type { Student } from "../_data/school-data"
import { StatCard } from "../_components/shared"

export default function CompanyPage({
  selectedCompany,
  onSelectCompany,
  onSelectStudent,
  onBack,
}: {
  selectedCompany: typeof COMPANIES[0] | null
  onSelectCompany: (company: typeof COMPANIES[0]) => void
  onSelectStudent: (student: Student, course: typeof COURSES[0]) => void
  onBack: () => void
}) {
  const [expandedRole, setExpandedRole] = useState<string | null>(null)

  if (selectedCompany) {
    const slotProgress = Math.round(((selectedCompany.slots - selectedCompany.slotsAvailable) / selectedCompany.slots) * 100)
    const weightColor = (w: string) =>
      w === "High" ? "bg-blue-100 text-blue-700" :
      w === "Medium" ? "bg-purple-100 text-purple-700" :
      "bg-muted text-muted-foreground"

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="icon" onClick={onBack}><ChevronLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{selectedCompany.name}</h1>
            <p className="text-muted-foreground">{selectedCompany.industry}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Slots" value={String(selectedCompany.slots)} description="internship positions" icon={Briefcase} trend={`${selectedCompany.slotsAvailable} open`} trendUp={selectedCompany.slotsAvailable > 0} />
          <StatCard title="Current Interns" value={String(selectedCompany.currentInterns.length)} description="from this school" icon={GraduationCap} trend="ongoing" trendUp />
          <StatCard title="Partner Since" value={selectedCompany.partnerSince} description="years of partnership" icon={Star} trend={`${new Date().getFullYear() - parseInt(selectedCompany.partnerSince)} yrs`} trendUp />
          <StatCard title="Courses Accepted" value={String(selectedCompany.lookingFor.length)} description="degree programmes" icon={BookOpen} trend={selectedCompany.lookingFor.join(", ")} trendUp />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>About</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedCompany.about}</p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground shrink-0" /><span>{selectedCompany.location}</span></div>
                  <div className="flex items-center gap-2 text-sm"><Globe className="h-4 w-4 text-muted-foreground shrink-0" /><span className="text-primary">{selectedCompany.website}</span></div>
                  <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground shrink-0" /><span>{selectedCompany.email}</span></div>
                  <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground shrink-0" /><span>{selectedCompany.phone}</span></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Internship Slots</CardTitle>
                <CardDescription>{selectedCompany.slots - selectedCompany.slotsAvailable} filled · {selectedCompany.slotsAvailable} available</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-xs text-muted-foreground"><span>Capacity used</span><span>{slotProgress}%</span></div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all" style={{ width: `${slotProgress}%` }} />
                </div>
                <div className="pt-1 space-y-2">
                  {selectedCompany.internshipRoles.map(role => (
                    <div key={role.title} className="rounded-lg border overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setExpandedRole(expandedRole === role.title ? null : role.title)}
                        className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {expandedRole === role.title ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                          <span className="text-sm font-medium">{role.title}</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${role.open ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                          {role.open ? "Open" : "Closed"}
                        </span>
                      </button>
                      {expandedRole === role.title && (
                        <div className="px-4 pb-3 pt-1 bg-muted/20 space-y-2 border-t">
                          <div className="flex items-center gap-1.5 text-xs">
                            <Star className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span className="font-medium text-primary">{role.requiredPoints} pts required</span>
                          </div>
                          <ul className="space-y-1">
                            {role.requirements.map(req => (
                              <li key={req} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Preferred Skills</CardTitle>
                <CardDescription>Academic fields this company prioritises when selecting interns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedCompany.preferredSkills.map(skill => (
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
                    {selectedCompany.currentInterns.map(intern => {
                      const initials = intern.name.split(" ").map(n => n[0]).join("")
                      return (
                        <button
                          type="button"
                          key={intern.name}
                          onClick={() => {
                            const course = COURSES.find(c => c.code === intern.course)
                            const student = course?.students.find(s => s.name === intern.name)
                            if (student && course) onSelectStudent(student, course)
                          }}
                          className="w-full flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 hover:border-primary transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="text-xs font-medium text-primary">{initials}</span>
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-medium">{intern.name}</p>
                              <p className="text-xs text-muted-foreground">{intern.course}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">{intern.status}</span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
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
        {COMPANIES.map(company => {
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
                    <MapPin className="h-3.5 w-3.5 shrink-0" /><span>{company.location}</span>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {company.lookingFor.map(c => (
                      <span key={c} className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{c}</span>
                    ))}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Slots filled</span><span>{company.slots - company.slotsAvailable}/{company.slots}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all" style={{ width: `${slotProgress}%` }} />
                    </div>
                  </div>
                  {company.internshipRoles.some(r => r.open) && (
                    <div className="space-y-1.5 pt-1">
                      <p className="text-xs text-muted-foreground">Open roles</p>
                      <div className="flex flex-wrap gap-1">
                        {company.internshipRoles.filter(r => r.open).map(r => (
                          <span key={r.title} className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">{r.title}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </button>
          )
        })}
      </div>
    </div>
  )
}
