"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, ActivityType } from "@/types/activity"
import { Calendar, Clock, MapPin, Users, Building2, UsersRound, Lightbulb, GraduationCap, Building, MoreHorizontal } from "lucide-react"

interface AccumulationCardProps {
  activity: Activity
  onViewStudents: (activity: Activity) => void
  onEdit?: (activity: Activity) => void
  onDelete?: (activity: Activity) => void
}

const getActivityTypeColor = (type: ActivityType) => {
  switch (type) {
    case 'hackathon':
      return 'bg-blue-100 text-blue-700'
    case 'meetup':
      return 'bg-green-100 text-green-700'
    case 'workshop':
      return 'bg-purple-100 text-purple-700'
    case 'seminar':
      return 'bg-orange-100 text-orange-700'
    case 'conference':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const getActivityTypeIcon = (type: ActivityType) => {
  switch (type) {
    case 'hackathon':
      return Lightbulb
    case 'meetup':
      return UsersRound
    case 'workshop':
      return Building2
    case 'seminar':
      return GraduationCap
    case 'conference':
      return Building
    default:
      return MoreHorizontal
  }
}

const getStatusColor = (status: Activity['status']) => {
  switch (status) {
    case 'upcoming':
      return 'bg-blue-100 text-blue-700'
    case 'ongoing':
      return 'bg-green-100 text-green-700'
    case 'completed':
      return 'bg-gray-100 text-gray-700'
  }
}

export default function AccumulationCard({
  activity,
  onViewStudents,
  onEdit,
  onDelete
}: AccumulationCardProps) {
  const TypeIcon = getActivityTypeIcon(activity.type)
  const typeColor = getActivityTypeColor(activity.type)
  const statusColor = getStatusColor(activity.status)
  
  const progressPercentage = (activity.currentStudents / activity.maxStudents) * 100

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-lg font-bold">{activity.title}</CardTitle>
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor}`}>
                {activity.status}
              </span>
            </div>
            <CardDescription className="line-clamp-2">
              {activity.description}
            </CardDescription>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${typeColor} flex-shrink-0`}>
            <TypeIcon className="h-3.5 w-3.5" />
            <span className="text-xs font-medium capitalize">{activity.type}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{activity.time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground col-span-2">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{activity.location}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{activity.currentStudents} / {activity.maxStudents} students</span>
            </div>
            <span className="text-xs text-muted-foreground">{Math.round(progressPercentage)}% full</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            className="flex-1 gap-2" 
            size="sm"
            onClick={() => onViewStudents(activity)}
          >
            <Users className="h-4 w-4" />
            Manage Students
          </Button>
          {onEdit && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onEdit(activity)}
            >
              Edit
            </Button>
          )}
          {onDelete && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onDelete(activity)}
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
