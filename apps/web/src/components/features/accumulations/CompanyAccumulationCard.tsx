"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { type Accumulation } from "@/lib/accumulationsApi"
import { 
  Calendar, 
  Target, 
  Users, 
  Briefcase, 
  TrendingUp,
  MoreHorizontal,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react"

interface CompanyAccumulationCardProps {
  accumulation: Accumulation
  onViewParticipants: (accumulation: Accumulation) => void
  onEdit?: (accumulation: Accumulation) => void
  onDelete?: (accumulation: Accumulation) => void
  onEnd?: (accumulation: Accumulation) => void
}

const getAccumTypeColor = (type: Accumulation['type']) => {
  switch (type) {
    case 'Task':
      return 'bg-blue-100 text-blue-700'
    case 'Challenge':
      return 'bg-purple-100 text-purple-700'
    case 'Course':
      return 'bg-green-100 text-green-700'
    case 'Event':
      return 'bg-orange-100 text-orange-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const getStatusColor = (status: Accumulation['status']) => {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-700'
    case 'Closing Soon':
      return 'bg-yellow-100 text-yellow-700'
    case 'Ended':
      return 'bg-gray-100 text-gray-700'
  }
}

const getStatusIcon = (status: Accumulation['status']) => {
  switch (status) {
    case 'Active':
      return CheckCircle
    case 'Closing Soon':
      return Clock
    case 'Ended':
      return XCircle
  }
}

const getTypeIcon = (type: Accumulation['type']) => {
  switch (type) {
    case 'Task':
      return Briefcase
    case 'Challenge':
      return Target
    case 'Course':
      return TrendingUp
    case 'Event':
      return Users
  }
}

export default function CompanyAccumulationCard({
  accumulation,
  onViewParticipants,
  onEdit,
  onDelete,
  onEnd
}: CompanyAccumulationCardProps) {
  const TypeIcon = getTypeIcon(accumulation.type)
  const typeColor = getAccumTypeColor(accumulation.type)
  const statusColor = getStatusColor(accumulation.status)
  const StatusIcon = getStatusIcon(accumulation.status)

  const daysUntilDeadline = Math.ceil(
    (new Date(accumulation.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-lg font-bold">{accumulation.title}</CardTitle>
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor}`}>
                {accumulation.status}
              </span>
            </div>
            <CardDescription className="line-clamp-2">
              {accumulation.description}
            </CardDescription>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${typeColor} flex-shrink-0`}>
            <TypeIcon className="h-3.5 w-3.5" />
            <span className="text-xs font-medium capitalize">{accumulation.type}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <div>
              <span className="block font-medium text-foreground">Deadline</span>
              <span>{new Date(accumulation.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="h-4 w-4" />
            <div>
              <span className="block font-medium text-foreground">Points</span>
              <span>{accumulation.points} pts</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground col-span-2">
            <Briefcase className="h-4 w-4" />
            <div>
              <span className="block font-medium text-foreground">Field</span>
              <span>{accumulation.field || 'General'}</span>
            </div>
          </div>
        </div>

        {/* Courses */}
        {accumulation.courses.length > 0 && (
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Target Courses</span>
            <div className="flex flex-wrap gap-1">
              {accumulation.courses.slice(0, 4).map((course, idx) => (
                <span key={idx} className="text-xs bg-muted px-2 py-0.5 rounded">
                  {course}
                </span>
              ))}
              {accumulation.courses.length > 4 && (
                <span className="text-xs text-muted-foreground">
                  +{accumulation.courses.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Participants Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{accumulation.participants} participants</span>
            </div>
            {daysUntilDeadline > 0 && (
              <span className={`text-xs ${daysUntilDeadline <= 7 ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                {daysUntilDeadline} days left
              </span>
            )}
          </div>
        </div>

        {/* Skill Tags */}
        {accumulation.skillTags.length > 0 && (
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Skills</span>
            <div className="flex flex-wrap gap-1">
              {accumulation.skillTags.slice(0, 5).map((tag, idx) => (
                <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                  {tag}
                </span>
              ))}
              {accumulation.skillTags.length > 5 && (
                <span className="text-xs text-muted-foreground">
                  +{accumulation.skillTags.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            className="flex-1 gap-2"
            size="sm"
            onClick={() => onViewParticipants(accumulation)}
          >
            <Users className="h-4 w-4" />
            Participants ({accumulation.participantList.length})
          </Button>
          {accumulation.status === 'Active' && onEnd && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEnd(accumulation)}
              className="text-yellow-600 hover:text-yellow-700"
            >
              End
            </Button>
          )}
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(accumulation)}
            >
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(accumulation)}
              className="text-destructive hover:text-destructive"
            >
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
