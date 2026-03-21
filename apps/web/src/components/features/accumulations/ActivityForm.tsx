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
import { Activity, ActivityFormData, ActivityType } from "@/types/activity"
import { Plus, Calendar, Clock, MapPin, Users, FileText, Tag } from "lucide-react"

interface ActivityFormProps {
  onSubmit: (data: ActivityFormData) => void
  initialData?: Activity
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const activityTypes: { value: ActivityType; label: string }[] = [
  { value: 'hackathon', label: 'Hackathon' },
  { value: 'meetup', label: 'Meetup' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'conference', label: 'Conference' },
  { value: 'other', label: 'Other' },
]

export default function ActivityForm({
  onSubmit,
  initialData,
  open: externalOpen,
  onOpenChange: externalOnOpenChange
}: ActivityFormProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [formData, setFormData] = useState<ActivityFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    type: initialData?.type || 'meetup',
    date: initialData?.date || '',
    time: initialData?.time || '',
    location: initialData?.location || '',
    maxStudents: initialData?.maxStudents || 50,
  })

  const open = externalOpen ?? internalOpen
  const onOpenChange = externalOnOpenChange ?? setInternalOpen

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onOpenChange(false)
    // Reset form if not editing
    if (!initialData) {
      setFormData({
        title: '',
        description: '',
        type: 'meetup',
        date: '',
        time: '',
        location: '',
        maxStudents: 50,
      })
    }
  }

  const handleMaxStudentsChange = (value: string) => {
    const numValue = parseInt(value, 10)
    if (!isNaN(numValue) && numValue > 0) {
      setFormData(prev => ({ ...prev, maxStudents: numValue }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!externalOpen && (
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Activity
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {initialData ? 'Edit Activity' : 'Create New Activity'}
            </DialogTitle>
            <DialogDescription>
              {initialData
                ? 'Update the details of your activity.'
                : 'Fill in the details to create a new activity accumulation.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Title
              </Label>
              <Input
                id="title"
                placeholder="e.g., AI Hackathon 2026"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Description
              </Label>
              <textarea
                id="description"
                placeholder="Describe what this activity is about..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Activity Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value: ActivityType) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select activity type" />
                </SelectTrigger>
                <SelectContent>
                  {activityTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="time" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Time
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </Label>
              <Input
                id="location"
                placeholder="e.g., Room 301, Main Building"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="maxStudents" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Maximum Students
              </Label>
              <Input
                id="maxStudents"
                type="number"
                min="1"
                value={formData.maxStudents}
                onChange={(e) => handleMaxStudentsChange(e.target.value)}
                required
              />
            </div>
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
              {initialData ? 'Save Changes' : 'Create Activity'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
