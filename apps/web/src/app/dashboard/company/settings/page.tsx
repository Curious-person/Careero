"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import DashboardLayout from "@/components/layouts/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, Target, Mail, Phone, Globe, MapPin, Save, Plus, X, Camera, Upload } from "lucide-react"

export default function CompanyProfilePage() {
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Company profile state
    const [companyData, setCompanyData] = useState({
        name: "TechCorp Solutions",
        industry: "Technology",
        size: "50-200 employees",
        founded: "2015",
        description: "We are a leading technology company focused on innovative solutions for businesses worldwide.",
        website: "https://www.techcorp.com",
        email: "contact@techcorp.com",
        phone: "+1 (555) 123-4567",
        address: "123 Business Ave, Tech City, TC 12345",
        logo: "",
    })

    const [previewUrl, setPreviewUrl] = useState<string>("")
    const [isUploading, setIsUploading] = useState(false)

    const handleLogoClick = () => {
        fileInputRef.current?.click()
    }

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (!file.type.startsWith("image/")) {
                alert("Please select an image file")
                return
            }
            if (file.size > 5 * 1024 * 1024) {
                alert("Image size should be less than 5MB")
                return
            }

            setIsUploading(true)

            // Create preview URL
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string)
                setCompanyData(prev => ({ ...prev, logo: reader.result as string }))
                setIsUploading(false)
            }
            reader.readAsDataURL(file)

            // TODO: Implement API call to upload logo
            console.log("Uploading logo:", file)
        }
    }

    // Target students state
    const [targetStudents, setTargetStudents] = useState([
        { id: 1, field: "Computer Science", level: "Bachelor's", skills: ["JavaScript", "React", "Node.js"] },
        { id: 2, field: "Software Engineering", level: "Master's", skills: ["Python", "Machine Learning", "Data Science"] },
        { id: 3, field: "Information Technology", level: "Bachelor's", skills: ["Network Security", "Cloud Computing"] },
    ])

    const [newStudentField, setNewStudentField] = useState({
        field: "",
        level: "",
        skills: "",
    })

    const handleCompanyChange = (field: string, value: string) => {
        setCompanyData(prev => ({ ...prev, [field]: value }))
    }

    const handleAddTargetStudent = () => {
        if (newStudentField.field && newStudentField.level) {
            setTargetStudents(prev => [
                ...prev,
                {
                    id: Date.now(),
                    field: newStudentField.field,
                    level: newStudentField.level,
                    skills: newStudentField.skills.split(",").map(s => s.trim()).filter(Boolean),
                },
            ])
            setNewStudentField({ field: "", level: "", skills: "" })
        }
    }

    const handleRemoveTargetStudent = (id: number) => {
        setTargetStudents(prev => prev.filter(student => student.id !== id))
    }

    const handleSave = () => {
        // TODO: Implement API call to save company data
        console.log("Saving company data:", companyData)
        console.log("Saving target students:", targetStudents)
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Company Profile</h1>
                        <p className="text-muted-foreground">
                            Manage your company information and target student preferences.
                        </p>
                    </div>
                    <Button onClick={handleSave} className="gap-2">
                        <Save className="h-4 w-4" />
                        Save Changes
                    </Button>
                </div>

                {/* Tabs Navigation */}
                <Tabs defaultValue="profile" className="space-y-6">
                    <TabsList className="grid w-full md:w-auto grid-cols-2">
                        <TabsTrigger value="profile" className="gap-2">
                            <Building2 className="h-4 w-4" />
                            Company Profile
                        </TabsTrigger>
                        <TabsTrigger value="students" className="gap-2">
                            <Target className="h-4 w-4" />
                            Target Students
                        </TabsTrigger>
                    </TabsList>

                    {/* Company Profile Tab */}
                    <TabsContent value="profile" className="space-y-6">
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Basic Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5 text-muted-foreground" />
                                        Basic Information
                                    </CardTitle>
                                    <CardDescription>
                                        Core details about your company
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Profile Picture Upload */}
                                    <div className="flex items-center gap-4">
                                        <div
                                            onClick={handleLogoClick}
                                            className="relative h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors group"
                                        >
                                            {previewUrl ? (
                                                <Image
                                                    src={previewUrl}
                                                    alt="Company logo"
                                                    width={96}
                                                    height={96}
                                                    className="h-full w-full rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="text-center">
                                                    <Building2 className="h-8 w-8 text-primary mx-auto" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Camera className="h-6 w-6 text-white" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Company Logo</Label>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleLogoClick}
                                                    className="gap-2"
                                                    disabled={isUploading}
                                                >
                                                    <Upload className="h-4 w-4" />
                                                    {isUploading ? "Uploading..." : "Upload Logo"}
                                                </Button>
                                                {previewUrl && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setPreviewUrl("")
                                                            setCompanyData(prev => ({ ...prev, logo: "" }))
                                                            if (fileInputRef.current) {
                                                                fileInputRef.current.value = ""
                                                            }
                                                        }}
                                                        className="text-destructive hover:text-destructive"
                                                    >
                                                        Remove
                                                    </Button>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                PNG, JPG up to 5MB
                                            </p>
                                        </div>
                                        <Input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoChange}
                                            className="hidden"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="company-name">Company Name</Label>
                                        <Input
                                            id="company-name"
                                            value={companyData.name}
                                            onChange={(e) => handleCompanyChange("name", e.target.value)}
                                            placeholder="Enter company name"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="industry">Industry</Label>
                                            <Input
                                                id="industry"
                                                value={companyData.industry}
                                                onChange={(e) => handleCompanyChange("industry", e.target.value)}
                                                placeholder="e.g., Technology"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="size">Company Size</Label>
                                            <Input
                                                id="size"
                                                value={companyData.size}
                                                onChange={(e) => handleCompanyChange("size", e.target.value)}
                                                placeholder="e.g., 50-200 employees"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="founded">Founded Year</Label>
                                        <Input
                                            id="founded"
                                            value={companyData.founded}
                                            onChange={(e) => handleCompanyChange("founded", e.target.value)}
                                            placeholder="e.g., 2015"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Contact Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Mail className="h-5 w-5 text-muted-foreground" />
                                        Contact Information
                                    </CardTitle>
                                    <CardDescription>
                                        How students can reach you
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            Email Address
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={companyData.email}
                                            onChange={(e) => handleCompanyChange("email", e.target.value)}
                                            placeholder="contact@company.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            Phone Number
                                        </Label>
                                        <Input
                                            id="phone"
                                            value={companyData.phone}
                                            onChange={(e) => handleCompanyChange("phone", e.target.value)}
                                            placeholder="+1 (555) 123-4567"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="website" className="flex items-center gap-2">
                                            <Globe className="h-4 w-4 text-muted-foreground" />
                                            Website
                                        </Label>
                                        <Input
                                            id="website"
                                            value={companyData.website}
                                            onChange={(e) => handleCompanyChange("website", e.target.value)}
                                            placeholder="https://www.company.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="address" className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            Address
                                        </Label>
                                        <Input
                                            id="address"
                                            value={companyData.address}
                                            onChange={(e) => handleCompanyChange("address", e.target.value)}
                                            placeholder="123 Business Ave, City, State 12345"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Company Description */}
                        <Card>
                            <CardHeader>
                                <CardTitle>About Company</CardTitle>
                                <CardDescription>
                                    A brief description of your company for students
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Company Description</Label>
                                    <textarea
                                        id="description"
                                        value={companyData.description}
                                        onChange={(e) => handleCompanyChange("description", e.target.value)}
                                        placeholder="Tell students about your company, mission, and culture..."
                                        className="w-full min-h-[120px] px-3 py-2 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Target Students Tab */}
                    <TabsContent value="students" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-muted-foreground" />
                                    Target Student Fields
                                </CardTitle>
                                <CardDescription>
                                    Specify which student fields and skills you&apos;re looking for
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Existing Target Students */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-medium">Current Preferences</h3>
                                        <Badge variant="secondary">{targetStudents.length} fields</Badge>
                                    </div>
                                    <div className="grid gap-4">
                                        {targetStudents.map((student) => (
                                            <div
                                                key={student.id}
                                                className="flex items-start justify-between gap-4 p-4 border rounded-md bg-muted/50"
                                            >
                                                <div className="space-y-2 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-sm font-medium">{student.field}</h4>
                                                        <Badge variant="outline">{student.level}</Badge>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {student.skills.map((skill, index) => (
                                                            <Badge key={index} variant="secondary" className="text-xs">
                                                                {skill}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRemoveTargetStudent(student.id)}
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Add New Target Student */}
                                <div className="border-t pt-6">
                                    <h3 className="text-sm font-medium mb-4">Add New Preference</h3>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="field">Field of Study</Label>
                                            <Input
                                                id="field"
                                                value={newStudentField.field}
                                                onChange={(e) => setNewStudentField(prev => ({ ...prev, field: e.target.value }))}
                                                placeholder="e.g., Computer Science"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="level">Education Level</Label>
                                            <Input
                                                id="level"
                                                value={newStudentField.level}
                                                onChange={(e) => setNewStudentField(prev => ({ ...prev, level: e.target.value }))}
                                                placeholder="e.g., Bachelor's, Master's"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="skills">Required Skills</Label>
                                            <Input
                                                id="skills"
                                                value={newStudentField.skills}
                                                onChange={(e) => setNewStudentField(prev => ({ ...prev, skills: e.target.value }))}
                                                placeholder="e.g., JavaScript, React (comma-separated)"
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handleAddTargetStudent}
                                        className="mt-4 gap-2"
                                        disabled={!newStudentField.field || !newStudentField.level}
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Preference
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tips Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Tips for Targeting Students</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary">•</span>
                                        Be specific about the field of study to attract relevant candidates
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary">•</span>
                                        List key skills that are important for your internships or positions
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary">•</span>
                                        Consider multiple education levels to expand your talent pool
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary">•</span>
                                        Update preferences regularly based on your hiring needs
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    )
}
