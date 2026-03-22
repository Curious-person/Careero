"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { 
  Accumulation,
  AccumType,
  type CreateAccumulationInput,
  type CreateAccumulationFormData,
  type Challenge,
  type Module,
  type AgendaItem,
  type Task,
} from "@/lib/accumulationsApi"
import { 
  Plus, 
  Calendar, 
  Target, 
  Users, 
  FileText, 
  Tag, 
  Link as LinkIcon,
  CheckCircle,
  Trash2,
  Briefcase,
  X
} from "lucide-react"

interface CompanyAccumulationFormProps {
  onSubmit: (data: CreateAccumulationFormData) => void
  initialData?: Accumulation
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const accumTypes: { value: AccumType; label: string }[] = [
  { value: 'Task', label: 'Task' },
  { value: 'Challenge', label: 'Challenge' },
  { value: 'Course', label: 'Course' },
  { value: 'Event', label: 'Event' },
]

const popularSkills = [
  '#webdev', '#softwaredev', '#mobiledev', '#uiux',
  '#dataanalytics', '#cloud', '#cybersec', '#networking',
  '#projectmgmt', '#business', '#communication', '#ai'
]

const popularCourses = [
  'Computer Science',
  'Information Technology',
  'Software Engineering',
  'Data Science',
  'Business Administration',
  'Marketing',
  'Finance',
  'Human Resources'
]

export default function CompanyAccumulationForm({
  onSubmit,
  initialData,
  open: externalOpen,
  onOpenChange: externalOnOpenChange
}: CompanyAccumulationFormProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [formData, setFormData] = useState<CreateAccumulationFormData>({
    title: initialData?.title || '',
    type: initialData?.type || 'Challenge',
    courses: initialData?.courses || [],
    deadline: initialData?.deadline ? initialData.deadline.split('T')[0] : '',
    duration: initialData?.duration || '',
    points: initialData?.points || 100,
    description: initialData?.description || '',
    skillTags: initialData?.skillTags || [],
    resourceLink: initialData?.resourceLink || '',
    objectives: initialData?.objectives || [],
    inCharge: initialData?.inCharge || [],
    challenges: initialData?.challenges || [],
    modules: initialData?.modules || [],
    agenda: initialData?.agenda || [],
    tasks: initialData?.tasks || [],
  })

  const [newSkill, setNewSkill] = useState('')
  const [newCourse, setNewCourse] = useState('')
  const [newObjective, setNewObjective] = useState('')
  const [newInCharge, setNewInCharge] = useState({ name: '', role: '', email: '' })

  const open = externalOpen ?? internalOpen
  const onOpenChange = externalOnOpenChange ?? setInternalOpen

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (formData.type === 'Challenge' && !formData.challenges?.length) {
      alert('At least one challenge is required')
      return
    }
    if (formData.type === 'Course' && !formData.modules?.length) {
      alert('At least one module is required')
      return
    }
    if (formData.type === 'Event' && !formData.agenda?.length) {
      alert('At least one agenda item is required')
      return
    }
    if (formData.type === 'Task' && !formData.tasks?.length) {
      alert('At least one task is required')
      return
    }

    onSubmit(formData)
    onOpenChange(false)
    
    // Reset form if not editing
    if (!initialData) {
      setFormData({
        title: '',
        type: 'Challenge',
        courses: [],
        deadline: '',
        duration: '',
        points: 100,
        description: '',
        skillTags: [],
        resourceLink: '',
        objectives: [],
        inCharge: [],
        challenges: [],
        modules: [],
        agenda: [],
        tasks: [],
      })
      setNewSkill('')
      setNewCourse('')
      setNewObjective('')
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !formData.skillTags.includes(newSkill.trim())) {
      setFormData(prev => ({ ...prev, skillTags: [...prev.skillTags, newSkill.trim()] }))
      setNewSkill('')
    }
  }

  const removeSkill = (tag: string) => {
    setFormData(prev => ({ ...prev, skillTags: prev.skillTags.filter(t => t !== tag) }))
  }

  const addCourse = () => {
    if (newCourse.trim() && !formData.courses.includes(newCourse.trim())) {
      setFormData(prev => ({ ...prev, courses: [...prev.courses, newCourse.trim()] }))
      setNewCourse('')
    }
  }

  const removeCourse = (course: string) => {
    setFormData(prev => ({ ...prev, courses: prev.courses.filter(c => c !== course) }))
  }

  const addObjective = () => {
    if (newObjective.trim()) {
      setFormData(prev => ({ ...prev, objectives: [...prev.objectives, newObjective.trim()] }))
      setNewObjective('')
    }
  }

  const removeObjective = (index: number) => {
    setFormData(prev => ({ ...prev, objectives: prev.objectives.filter((_, i) => i !== index) }))
  }

  // Type-specific item handlers
  const addChallenge = () => {
    setFormData(prev => ({
      ...prev,
      challenges: [...(prev.challenges || []), { title: '', description: '' }]
    }))
  }

  const updateChallenge = (index: number, field: keyof Challenge, value: string) => {
    setFormData(prev => ({
      ...prev,
      challenges: prev.challenges?.map((c, i) => i === index ? { ...c, [field]: value } : c)
    }))
  }

  const removeChallenge = (index: number) => {
    setFormData(prev => ({
      ...prev,
      challenges: prev.challenges?.filter((_, i) => i !== index)
    }))
  }

  const addModule = () => {
    setFormData(prev => ({
      ...prev,
      modules: [...(prev.modules || []), { title: '', description: '' }]
    }))
  }

  const updateModule = (index: number, field: keyof Module, value: string) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules?.map((m, i) => i === index ? { ...m, [field]: value } : m)
    }))
  }

  const removeModule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules?.filter((_, i) => i !== index)
    }))
  }

  const addAgenda = () => {
    setFormData(prev => ({
      ...prev,
      agenda: [...(prev.agenda || []), { time: '', activity: '' }]
    }))
  }

  const updateAgenda = (index: number, field: keyof AgendaItem, value: string) => {
    setFormData(prev => ({
      ...prev,
      agenda: prev.agenda?.map((a, i) => i === index ? { ...a, [field]: value } : a)
    }))
  }

  const removeAgenda = (index: number) => {
    setFormData(prev => ({
      ...prev,
      agenda: prev.agenda?.filter((_, i) => i !== index)
    }))
  }

  const addTask = () => {
    setFormData(prev => ({
      ...prev,
      tasks: [...(prev.tasks || []), { title: '', description: '' }]
    }))
  }

  const updateTask = (index: number, field: keyof Task, value: string) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks?.map((t, i) => i === index ? { ...t, [field]: value } : t)
    }))
  }

  const removeTask = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks?.filter((_, i) => i !== index)
    }))
  }

  const addInCharge = () => {
    if (newInCharge.name && newInCharge.email) {
      setFormData(prev => ({ ...prev, inCharge: [...prev.inCharge, { ...newInCharge }] }))
      setNewInCharge({ name: '', role: '', email: '' })
    }
  }

  const removeInCharge = (index: number) => {
    setFormData(prev => ({ ...prev, inCharge: prev.inCharge.filter((_, i) => i !== index) }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!externalOpen && (
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Accumulation
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {initialData ? 'Edit Accumulation' : 'Create New Accumulation'}
            </DialogTitle>
            <DialogDescription>
              {initialData
                ? 'Update the details of your accumulation.'
                : 'Fill in the details to create a new company accumulation.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Basic Info */}
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Summer Internship Challenge 2026"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this accumulation is about..."
                className="min-h-[100px]"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: AccumType) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {accumTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="points">Points</Label>
                <Input
                  id="points"
                  type="number"
                  min="1"
                  value={formData.points}
                  onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  placeholder="e.g., 3 months, 2 weeks"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  required
                />
              </div>
            </div>

            {/* Courses */}
            <div className="space-y-2">
              <Label>Target Courses</Label>
              <div className="flex gap-2">
                <Select value={newCourse} onValueChange={setNewCourse}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {popularCourses.map((course) => (
                      <SelectItem key={course} value={course}>
                        {course}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" onClick={addCourse} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {formData.courses.map((course, idx) => (
                  <span key={idx} className="text-xs bg-muted px-2 py-0.5 rounded flex items-center gap-1">
                    {course}
                    <button type="button" onClick={() => removeCourse(course)} className="hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Skill Tags */}
            <div className="space-y-2">
              <Label>Skill Tags</Label>
              <div className="flex gap-2">
                <Select value={newSkill} onValueChange={setNewSkill}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {popularSkills.map((skill) => (
                      <SelectItem key={skill} value={skill}>
                        {skill}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" onClick={addSkill} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {formData.skillTags.map((tag, idx) => (
                  <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded flex items-center gap-1">
                    {tag}
                    <button type="button" onClick={() => removeSkill(tag)} className="hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Resource Link */}
            <div className="grid gap-2">
              <Label htmlFor="resourceLink" className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Resource Link (optional)
              </Label>
              <Input
                id="resourceLink"
                type="url"
                placeholder="https://..."
                value={formData.resourceLink}
                onChange={(e) => setFormData(prev => ({ ...prev, resourceLink: e.target.value }))}
              />
            </div>

            {/* Objectives */}
            <div className="space-y-2">
              <Label>Objectives</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add an objective"
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addObjective())}
                />
                <Button type="button" onClick={addObjective} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {formData.objectives.map((obj, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="flex-1">{obj}</span>
                    <button type="button" onClick={() => removeObjective(idx)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* In Charge */}
            <div className="space-y-2">
              <Label>People In Charge</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="Name"
                  value={newInCharge.name}
                  onChange={(e) => setNewInCharge(prev => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  placeholder="Role"
                  value={newInCharge.role}
                  onChange={(e) => setNewInCharge(prev => ({ ...prev, role: e.target.value }))}
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={newInCharge.email}
                  onChange={(e) => setNewInCharge(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <Button type="button" onClick={addInCharge} size="sm" variant="outline">
                <Plus className="h-4 w-4" />
                Add Person
              </Button>
              <div className="space-y-1">
                {formData.inCharge.map((person, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                    <div>
                      <span className="font-medium">{person.name}</span>
                      <span className="text-muted-foreground ml-2">- {person.role}</span>
                      <span className="text-muted-foreground ml-2">({person.email})</span>
                    </div>
                    <button type="button" onClick={() => removeInCharge(idx)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Type-specific sections */}
            {formData.type === 'Challenge' && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Challenges
                </Label>
                {formData.challenges?.map((challenge, idx) => (
                  <div key={idx} className="p-3 border rounded-md space-y-2">
                    <Input
                      placeholder="Challenge title"
                      value={challenge.title}
                      onChange={(e) => updateChallenge(idx, 'title', e.target.value)}
                    />
                    <Textarea
                      placeholder="Challenge description"
                      value={challenge.description}
                      onChange={(e) => updateChallenge(idx, 'description', e.target.value)}
                      className="min-h-[60px]"
                    />
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeChallenge(idx)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addChallenge}>
                  <Plus className="h-4 w-4" />
                  Add Challenge
                </Button>
              </div>
            )}

            {formData.type === 'Course' && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Modules
                </Label>
                {formData.modules?.map((module, idx) => (
                  <div key={idx} className="p-3 border rounded-md space-y-2">
                    <Input
                      placeholder="Module title"
                      value={module.title}
                      onChange={(e) => updateModule(idx, 'title', e.target.value)}
                    />
                    <Textarea
                      placeholder="Module description"
                      value={module.description}
                      onChange={(e) => updateModule(idx, 'description', e.target.value)}
                      className="min-h-[60px]"
                    />
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeModule(idx)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addModule}>
                  <Plus className="h-4 w-4" />
                  Add Module
                </Button>
              </div>
            )}

            {formData.type === 'Event' && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Agenda
                </Label>
                {formData.agenda?.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <Input
                      type="time"
                      value={item.time}
                      onChange={(e) => updateAgenda(idx, 'time', e.target.value)}
                      className="w-32"
                    />
                    <Input
                      placeholder="Activity"
                      value={item.activity}
                      onChange={(e) => updateAgenda(idx, 'activity', e.target.value)}
                      className="flex-1"
                    />
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeAgenda(idx)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addAgenda}>
                  <Plus className="h-4 w-4" />
                  Add Agenda Item
                </Button>
              </div>
            )}

            {formData.type === 'Task' && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Tasks
                </Label>
                {formData.tasks?.map((task, idx) => (
                  <div key={idx} className="p-3 border rounded-md space-y-2">
                    <Input
                      placeholder="Task title"
                      value={task.title}
                      onChange={(e) => updateTask(idx, 'title', e.target.value)}
                    />
                    <Textarea
                      placeholder="Task description"
                      value={task.description}
                      onChange={(e) => updateTask(idx, 'description', e.target.value)}
                      className="min-h-[60px]"
                    />
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeTask(idx)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addTask}>
                  <Plus className="h-4 w-4" />
                  Add Task
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? 'Save Changes' : 'Create Accumulation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
