"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2, ChevronLeft, Mail, MapPin, Phone, Globe, Loader2, Plus, X } from "lucide-react"
import { getAllCompanyProfiles, createCompanyProfile, getCompanyProfileDetails, type CompanyProfile, type CreateCompanyData, type CompanyRole, type CompanyAccumulation } from "@/lib/companyProfilesApi"

const SIZE_OPTIONS = [
  "1-10 employees",
  "10-50 employees",
  "50-200 employees",
  "200-500 employees",
  "500-1000 employees",
  "1000+ employees",
]

const LEVEL_OPTIONS = ["High School", "Vocational", "Bachelor's", "Master's", "PhD", "Any"]

function AddCompanyModal({ onClose, onCreated }: { onClose: () => void; onCreated: (c: CompanyProfile) => void }) {
  const [form, setForm] = useState<CreateCompanyData>({
    name: "", industry: "", size: SIZE_OPTIONS[2], founded: "",
    description: "", email: "", phone: "", website: "", address: "",
    targetStudents: [],
    userEmail: "", userPassword: "",
  })
  const [tsField, setTsField] = useState("")
  const [tsLevel, setTsLevel] = useState(LEVEL_OPTIONS[2])
  const [tsSkills, setTsSkills] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (key: keyof CreateCompanyData, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const addTargetStudent = () => {
    if (!tsField.trim()) return
    setForm(prev => ({
      ...prev,
      targetStudents: [
        ...(prev.targetStudents ?? []),
        { field: tsField.trim(), level: tsLevel, skills: tsSkills.split(",").map(s => s.trim()).filter(Boolean) },
      ],
    }))
    setTsField(""); setTsSkills("")
  }

  const removeTargetStudent = (i: number) =>
    setForm(prev => ({ ...prev, targetStudents: prev.targetStudents?.filter((_, idx) => idx !== i) }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const created = await createCompanyProfile(form)
      onCreated(created)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create company.")
    } finally {
      setSubmitting(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-[20px] w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Add Company</h2>
          <button type="button" onClick={onClose} title="Close" aria-label="Close" className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

          {/* Basic Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Company Name *</Label>
              <Input id="name" value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g., TechCorp Solutions" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="industry">Industry *</Label>
              <Input id="industry" value={form.industry} onChange={e => set("industry", e.target.value)} placeholder="e.g., Technology" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="size">Company Size *</Label>
              <select id="size" title="Company Size" value={form.size} onChange={e => set("size", e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" required>
                {SIZE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="founded">Founded Year *</Label>
              <Input id="founded" value={form.founded} onChange={e => set("founded", e.target.value)} placeholder="e.g., 2015" pattern="\d{4}" required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description * <span className="text-xs text-muted-foreground">(min 20 chars)</span></Label>
            <textarea
              id="description"
              value={form.description}
              onChange={e => set("description", e.target.value)}
              rows={3}
              minLength={20}
              maxLength={2000}
              placeholder="Brief description of the company..."
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          {/* Contact Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="contact@company.com" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+63 2 8123 4567" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="website">Website</Label>
              <Input id="website" value={form.website} onChange={e => set("website", e.target.value)} placeholder="https://www.company.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={form.address} onChange={e => set("address", e.target.value)} placeholder="123 Business Ave, City" />
            </div>
          </div>

          {/* Target Students */}
          <div className="space-y-3">
            <Label>Target Students</Label>
            {(form.targetStudents ?? []).length > 0 && (
              <div className="space-y-2">
                {form.targetStudents!.map((ts, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 p-2.5 rounded-lg border bg-muted/40 text-sm">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{ts.field}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{ts.level}</span>
                      {ts.skills.map(s => <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{s}</span>)}
                    </div>
                    <button type="button" onClick={() => removeTargetStudent(i)} title="Remove preference" aria-label="Remove preference" className="shrink-0 text-muted-foreground hover:text-destructive">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Field of Study</Label>
                <Input value={tsField} onChange={e => setTsField(e.target.value)} placeholder="e.g., Computer Science" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Education Level</Label>
                <select value={tsLevel} onChange={e => setTsLevel(e.target.value)} title="Education Level" aria-label="Education Level" className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                  {LEVEL_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Skills (comma-separated)</Label>
                <Input value={tsSkills} onChange={e => setTsSkills(e.target.value)} placeholder="React, Node.js" />
              </div>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addTargetStudent} disabled={!tsField.trim()} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add Preference
            </Button>
          </div>

          {/* Company User Account */}
          <div className="space-y-3 pt-1">
            <div>
              <p className="text-sm font-medium">Company User Account</p>
              <p className="text-xs text-muted-foreground">Login credentials for the company representative</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="userEmail">Login Email *</Label>
                <Input id="userEmail" type="email" value={form.userEmail} onChange={e => set("userEmail", e.target.value)} placeholder="company@example.com" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="userPassword">Password *</Label>
                <Input id="userPassword" type="password" value={form.userPassword} onChange={e => set("userPassword", e.target.value)} placeholder="Min. 8 characters" minLength={8} required />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={submitting} className="gap-2">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Company
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

export default function CompanyPage({
  selectedCompany,
  onSelectCompany,
  onBack,
}: {
  selectedCompany: CompanyProfile | null
  onSelectCompany: (company: CompanyProfile) => void
  onBack: () => void
}) {
  const [companies, setCompanies] = useState<CompanyProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [roles, setRoles] = useState<CompanyRole[]>([])
  const [accumulations, setAccumulations] = useState<CompanyAccumulation[]>([])
  const [detailsLoading, setDetailsLoading] = useState(false)

  useEffect(() => {
    getAllCompanyProfiles()
      .then(setCompanies)
      .catch(() => setError("Failed to load companies."))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedCompany) return
    setDetailsLoading(true)
    getCompanyProfileDetails(selectedCompany._id)
      .then(d => { setRoles(d.roles); setAccumulations(d.accumulations) })
      .catch(() => { setRoles([]); setAccumulations([]) })
      .finally(() => setDetailsLoading(false))
  }, [selectedCompany])

  const handleCreated = (company: CompanyProfile) => {
    setCompanies(prev => [company, ...prev])
    setIsModalOpen(false)
  }

  if (selectedCompany) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="icon" onClick={onBack}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{selectedCompany.name}</h1>
            <p className="text-muted-foreground">{selectedCompany.industry}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Company Info</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">{selectedCompany.description}</p>
              {selectedCompany.address && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{selectedCompany.address}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{selectedCompany.email}</span>
              </div>
              {selectedCompany.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{selectedCompany.phone}</span>
                </div>
              )}
              {selectedCompany.website && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                  <a href={selectedCompany.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {selectedCompany.website}
                  </a>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 pt-2 text-sm">
                <div><p className="text-xs text-muted-foreground">Industry</p><p className="font-medium">{selectedCompany.industry}</p></div>
                <div><p className="text-xs text-muted-foreground">Size</p><p className="font-medium">{selectedCompany.size}</p></div>
                <div><p className="text-xs text-muted-foreground">Founded</p><p className="font-medium">{selectedCompany.founded}</p></div>
              </div>
            </CardContent>
          </Card>

          {selectedCompany.targetStudents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Target Students</CardTitle>
                <CardDescription>Fields and skills this company is looking for</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedCompany.targetStudents.map((ts, i) => (
                  <div key={ts._id ?? i} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{ts.field}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{ts.level}</span>
                    </div>
                    {ts.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {ts.skills.map(skill => (
                          <span key={skill} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{skill}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {detailsLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Open Intern Roles</CardTitle>
                <CardDescription>{roles.length} open position{roles.length !== 1 ? "s" : ""}</CardDescription>
              </CardHeader>
              <CardContent>
                {roles.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No open roles at the moment.</p>
                ) : (
                  <div className="space-y-3">
                    {roles.map(role => (
                      <div key={role._id} className="p-3 rounded-lg border space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium">{role.title}</p>
                            <p className="text-xs text-muted-foreground">{role.department} · {role.location}</p>
                          </div>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 shrink-0">{role.type}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>₱{role.salaryMin.toLocaleString()}–₱{role.salaryMax.toLocaleString()}/{role.salaryPeriod}</span>
                          <span>{role.openings} opening{role.openings !== 1 ? "s" : ""}</span>
                          <span>{role.applicants} applicant{role.applicants !== 1 ? "s" : ""}</span>
                        </div>
                        {role.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {role.skills.map(s => (
                              <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Accumulations</CardTitle>
                <CardDescription>{accumulations.length} accumulation{accumulations.length !== 1 ? "s" : ""} available</CardDescription>
              </CardHeader>
              <CardContent>
                {accumulations.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No accumulations posted yet.</p>
                ) : (
                  <div className="space-y-3">
                    {accumulations.map(acc => (
                      <div key={acc._id} className="p-3 rounded-lg border space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium">{acc.title}</p>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              acc.type === "Event" ? "bg-purple-100 text-purple-700" :
                              acc.type === "Course" ? "bg-blue-100 text-blue-700" :
                              "bg-orange-100 text-orange-700"
                            }`}>{acc.type}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{acc.points} pts</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">Deadline: {new Date(acc.deadline).toLocaleDateString()}</p>
                        {acc.skillTags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {acc.skillTags.map(t => (
                              <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{t}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground">Partner companies offering internship opportunities.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Company
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && <div className="text-center py-16 text-sm text-red-600">{error}</div>}

      {!loading && !error && companies.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground opacity-40" />
          <p className="text-muted-foreground">No companies found.</p>
          <Button variant="outline" onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Add the first company
          </Button>
        </div>
      )}

      {!loading && !error && companies.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {companies.map(company => (
            <button type="button" key={company._id} onClick={() => onSelectCompany(company)} className="text-left">
              <Card className="hover:border-primary hover:shadow-md transition-all cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      {company.logo
                        ? <img src={company.logo} alt={company.name} className="h-full w-full rounded-md object-cover" />
                        : <Building2 className="h-5 w-5 text-primary" />
                      }
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">{company.size}</span>
                  </div>
                  <CardTitle className="text-base mt-2">{company.name}</CardTitle>
                  <CardDescription>{company.industry}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {company.address && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {company.address}
                    </div>
                  )}
                  {company.targetStudents.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {company.targetStudents.slice(0, 3).map((ts, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{ts.field}</span>
                      ))}
                      {company.targetStudents.length > 3 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">+{company.targetStudents.length - 3}</span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      )}

      {isModalOpen && (
        <AddCompanyModal onClose={() => setIsModalOpen(false)} onCreated={handleCreated} />
      )}
    </div>
  )
}
