"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Activity, Student } from "@/types/activity"
import {
  Users,
  Search,
  UserPlus,
  Mail,
  BadgeCheck,
  GraduationCap,
  Calendar,
  X,
  Check,
  MoreVertical
} from "lucide-react"

interface StudentManagementModalProps {
  activity: Activity | null
  open: boolean
  onOpenChange: (open: boolean) => void
  students: Student[]
  onAddStudent: (student: Omit<Student, 'id' | 'enrolledAt' | 'status'>) => void
  onRemoveStudent: (studentId: string) => void
  onUpdateStudentStatus: (studentId: string, status: Student['status']) => void
}

export default function StudentManagementModal({
  activity,
  open,
  onOpenChange,
  students,
  onAddStudent,
  onRemoveStudent,
  onUpdateStudentStatus
}: StudentManagementModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    studentId: '',
    program: '',
    year: 1,
  })

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault()
    onAddStudent(newStudent)
    setNewStudent({
      name: '',
      email: '',
      studentId: '',
      program: '',
      year: 1,
    })
    setShowAddForm(false)
  }

  const getStatusColor = (status: Student['status']) => {
    switch (status) {
      case 'registered':
        return 'bg-blue-100 text-blue-700'
      case 'confirmed':
        return 'bg-green-100 text-green-700'
      case 'attended':
        return 'bg-gray-100 text-gray-700'
    }
  }

  if (!activity) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manage Students - {activity.title}
          </DialogTitle>
          <DialogDescription>
            {students.length} / {activity.maxStudents} students enrolled
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
          {/* Search and Add */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              onClick={() => setShowAddForm(true)}
              disabled={students.length >= activity.maxStudents}
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Add Student
            </Button>
          </div>

          {/* Add Student Form */}
          {showAddForm && (
            <form onSubmit={handleAddStudent} className="grid gap-3 p-4 border rounded-md bg-muted/50">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input
                    id="studentId"
                    value={newStudent.studentId}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, studentId: e.target.value }))}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="program">Program</Label>
                  <Input
                    id="program"
                    value={newStudent.program}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, program: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="year">Year Level</Label>
                <Input
                  id="year"
                  type="number"
                  min="1"
                  max="5"
                  value={newStudent.year}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, year: parseInt(e.target.value) || 1 }))}
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Add Student
                </Button>
              </div>
            </form>
          )}

          {/* Students List */}
          <ScrollArea className="flex-1 max-h-[400px]">
            <div className="space-y-2">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No students found</p>
                </div>
              ) : (
                filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-primary">
                          {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <p className="font-medium">{student.name}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {student.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <BadgeCheck className="h-3 w-3" />
                            {student.studentId}
                          </span>
                          <span className="flex items-center gap-1">
                            <GraduationCap className="h-3 w-3" />
                            {student.program} - Year {student.year}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <select
                        value={student.status}
                        onChange={(e) => onUpdateStudentStatus(student.id, e.target.value as Student['status'])}
                        className={`text-xs px-2 py-1 rounded-full border-0 ${getStatusColor(student.status)} cursor-pointer`}
                      >
                        <option value="registered">Registered</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="attended">Attended</option>
                      </select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => onRemoveStudent(student.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
