"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Building2, ChevronLeft, Mail, MapPin, Phone, Globe, Users, TrendingUp, CheckCircle, Clock } from "lucide-react"
import { StatCard } from "../_components/shared"
import type { Student } from "../_data/school-data"
import { COMPANIES, COURSES } from "../_data/school-data"

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
  if (selectedCompany) {
    const filledSlots = selectedCompany.slots - selectedCompany.slotsAvailable
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
          <StatCard title="Total Slots" value={String(selectedCompany.slots)} description="internship positions" icon={Briefcase} trend={`${selectedCompany.slotsAvailable} available`} trendUp={selectedCompany.slotsAvailable > 0} />
          <StatCard title="Filled Slots" value={String(filledSlots)} description="currently occupied" icon={Users} trend={`${Math.round((filledSlots / selectedCompany.slots) * 100)}% filled`} trendUp={filledSlots > 0} />
          <StatCard title="Partner Since" value={selectedCompany.partnerSince} description="year of partnership" icon={CheckCircle} trend={selectedCompany.status} trendUp={selectedCompany.status === "Active Partner"} />
          <StatCard title="Open Roles" value={String(selectedCompany.internshipRoles.filter(r => r.open).length)} description="accepting applications" icon={TrendingUp} trend="internship roles" trendUp />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Company Info</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">{selectedCompany.about}</p>
              <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground shrink-0" /><span>{selectedCompany.location}</span></div>
              <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground shrink-0" /><span>{selectedCompany.email}</span></div>
              <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground shrink-0" /><span>{selectedCompany.phone}</span></div>
              <div className="flex items-center gap-2 text-sm"><Globe className="h-4 w-4 text-muted-foreground shrink-0" /><a href={`https://${selectedCompany.website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{selectedCompany.website}</a></div>
              <div className="flex flex-wrap gap-1 pt-1">
                {selectedCompany.lookingFor.map(c => <span key={c} className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{c}</span>)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Preferred Skills</CardTitle><CardDescription>Fields this company values in interns</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              {selectedCompany.preferredSkills.map(s => (
                <div key={s.field} className="flex items-center justify-between text-sm">
                  <span>{s.field}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${s.weight === "High" ? "bg-green-100 text-green-700" : s.weight === "Medium" ? "bg-yellow-100 text-yellow-700" : "bg-muted text-muted-foreground"}`}>{s.weight}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Internship Roles</CardTitle><CardDescription>Available positions at {selectedCompany.name}</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            {selectedCompany.internshipRoles.map(role => (
              <div key={role.title} className="p-3 rounded-lg border bg-muted/20 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{role.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${role.open ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>{role.open ? "Open" : "Closed"}</span>
                </div>
                <p className="text-xs text-muted-foreground">Required points: {role.requiredPoints}</p>
                <ul className="space-y-0.5">
                  {role.requirements.map((req, i) => <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5"><span className="mt-0.5 shrink-0">•</span>{req}</li>)}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>

        {selectedCompany.currentInterns.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Current Interns</CardTitle><CardDescription>Students currently interning at {selectedCompany.name}</CardDescription></CardHeader>
            <CardContent className="space-y-2">
              {selectedCompany.currentInterns.map(intern => {
                const course = COURSES.find(c => c.code === intern.course)
                const student = course?.students.find(s => s.name === intern.name)
                const initials = intern.name.split(" ").map(n => n[0]).join("")
                const inner = (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-medium text-primary">{initials}</span>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium">{intern.name}</p>
                        <p className="text-xs text-muted-foreground">{intern.course}</p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">{intern.status}</span>
                  </>
                )
                if (student && course) return (
                  <button type="button" key={intern.name} onClick={() => onSelectStudent(student, course)} className="w-full flex items-center justify-between p-2.5 rounded-lg border bg-muted/20 hover:bg-muted/40 hover:border-primary transition-all">
                    {inner}
                  </button>
                )
                return <div key={intern.name} className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20">{inner}</div>
              })}
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
        <p className="text-muted-foreground">Partner companies offering internship opportunities.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {COMPANIES.map(company => {
          const filled = company.slots - company.slotsAvailable
          return (
            <button type="button" key={company.name} onClick={() => onSelectCompany(company)} className="text-left">
              <Card className="hover:border-primary hover:shadow-md transition-all cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${company.status === "Active Partner" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>{company.status}</span>
                  </div>
                  <CardTitle className="text-base mt-2">{company.name}</CardTitle>
                  <CardDescription>{company.industry}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5 shrink-0" />{company.location}</div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /><span>{filled}/{company.slots} slots filled</span></div>
                    <div className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /><span>Since {company.partnerSince}</span></div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {company.lookingFor.map(c => <span key={c} className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{c}</span>)}
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
