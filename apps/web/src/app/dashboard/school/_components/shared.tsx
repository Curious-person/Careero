import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, CheckCircle, Clock } from "lucide-react"

export function StatCard({ title, value, description, icon: Icon, trend, trendUp }: {
  title: string; value: string; description: string; icon: React.ElementType; trend: string; trendUp: boolean
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className={trendUp ? "text-green-600 font-medium" : "text-red-500 font-medium"}>{trend}</span>
          <span>{description}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function ProgrammeItem({ name, enrolled, capacity, status }: {
  name: string; enrolled: number; capacity: number; status: string
}) {
  const progress = Math.round((enrolled / capacity) * 100)
  const statusColor = status === "Full" ? "bg-red-100 text-red-700" : status === "Almost Full" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-sm font-medium">{name}</p>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor}`}>{status}</span>
          <span className="text-xs text-muted-foreground">{enrolled}/{capacity} students</span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium">{progress}%</p>
        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  )
}

export function EnrolmentItem({ name, programme, date, status }: {
  name: string; programme: string; date: string; status: string
}) {
  const initials = name.split(" ").map(n => n[0]).join("")
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-medium text-primary">{initials}</span>
        </div>
        <div>
          <p className="text-sm font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">{programme}</p>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <span className={`text-xs px-2 py-0.5 rounded-full ${status === "Confirmed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{status}</span>
        <p className="text-xs text-muted-foreground mt-0.5">{date}</p>
      </div>
    </div>
  )
}

export function EventItem({ title, date, type }: { title: string; date: string; type: string }) {
  const typeColor = type === "Deadline" ? "bg-red-100 text-red-700" : type === "Internal" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
  const Icon = type === "Deadline" ? Clock : type === "Internal" ? CheckCircle : ArrowUpRight
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
      <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{date}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${typeColor}`}>{type}</span>
      </div>
    </div>
  )
}

export function QuickAction({ title, icon: Icon, href }: { title: string; icon: React.ElementType; href: string }) {
  return (
    <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" asChild>
      <a href={href}><Icon className="h-5 w-5" /><span className="text-xs">{title}</span></a>
    </Button>
  )
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${
      status === "Active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
    }`}>{status}</span>
  )
}

export function PerformanceBar({ field, score }: { field: string; score: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{field}</span>
        <span className={score >= 85 ? "text-green-600 font-medium" : score >= 70 ? "text-blue-600 font-medium" : "text-yellow-600 font-medium"}>{score}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${score >= 85 ? "bg-green-500" : score >= 70 ? "bg-primary" : "bg-yellow-500"}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}
