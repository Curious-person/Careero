"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { type Accumulation, type Participant } from "@/lib/accumulationsApi"
import {
  Users,
  Search,
  UserPlus,
  Mail,
  GraduationCap,
  Calendar,
  X,
  Check,
  Trash2,
  FileText
} from "lucide-react"

interface ParticipantManagementModalProps {
  accumulation: Accumulation | null
  open: boolean
  onOpenChange: (open: boolean) => void
  participants: Participant[]
  onAddParticipant: (participant: Omit<Participant, 'status'>) => void
  onRemoveParticipant: (participantName: string) => void
  onUpdateParticipantStatus: (participantName: string, status: Participant['status']) => void
}

export default function ParticipantManagementModal({
  accumulation,
  open,
  onOpenChange,
  participants,
  onAddParticipant,
  onRemoveParticipant,
  onUpdateParticipantStatus
}: ParticipantManagementModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newParticipant, setNewParticipant] = useState({
    name: '',
    course: '',
  })

  const filteredParticipants = participants.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.course.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault()
    onAddParticipant(newParticipant)
    setNewParticipant({
      name: '',
      course: '',
    })
    setShowAddForm(false)
  }

  const getStatusColor = (status: Participant['status']) => {
    switch (status) {
      case 'In Progress':
        return 'bg-blue-100 text-blue-700'
      case 'Completed':
        return 'bg-green-100 text-green-700'
    }
  }

  if (!accumulation) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manage Participants - {accumulation.title}
          </DialogTitle>
          <DialogDescription>
            {participants.length} participant{participants.length !== 1 ? 's' : ''} enrolled
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-6 pt-4">
          {/* Search and Add */}
          <div className="flex items-center justify-between mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search participants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              size="sm"
              onClick={() => setShowAddForm(true)}
              disabled={showAddForm}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Participant
            </Button>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <form onSubmit={handleAddParticipant} className="mb-4 p-4 border rounded-md bg-muted/50 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={newParticipant.name}
                    onChange={(e) => setNewParticipant(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="course">Course</Label>
                  <Input
                    id="course"
                    placeholder="Computer Science"
                    value={newParticipant.course}
                    onChange={(e) => setNewParticipant(prev => ({ ...prev, course: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowAddForm(false)
                    setNewParticipant({ name: '', course: '' })
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Add Participant
                </Button>
              </div>
            </form>
          )}

          {/* Participants List */}
          {filteredParticipants.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No participants found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredParticipants.map((participant) => (
                <div
                  key={participant.name}
                  className="flex items-center justify-between p-4 border rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{participant.name}</p>
                      <p className="text-sm text-muted-foreground">{participant.course}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(participant.status)}`}>
                      {participant.status}
                    </span>
                    {participant.status === 'In Progress' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUpdateParticipantStatus(participant.name, 'Completed')}
                        title="Mark as completed"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveParticipant(participant.name)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
