"use client"

import React, { useState, useEffect, useCallback } from "react"
import DashboardLayout from "@/components/layouts/DashboardLayout"
import CompanyAccumulationCard from "@/components/features/accumulations/CompanyAccumulationCard"
import CompanyAccumulationForm from "@/components/features/accumulations/CompanyAccumulationForm"
import ParticipantManagementModal from "@/components/features/accumulations/ParticipantManagementModal"
import {
  type Accumulation,
  type CreateAccumulationFormData,
  type Participant,
  getMyCompanyAccumulations,
  createCompanyAccumulation,
  endCompanyAccumulation,
  deleteCompanyAccumulation,
} from "@/lib/accumulationsApi"
import { Calendar, Briefcase, Users, Target, AlertCircle, Loader2 } from "lucide-react"
import { X } from "lucide-react"

export default function CompanyAccumulationsPage() {
  const [accumulations, setAccumulations] = useState<Accumulation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedAccumulation, setSelectedAccumulation] = useState<Accumulation | null>(null)
  const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAccumulation, setEditingAccumulation] = useState<Accumulation | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // CRUD: READ - Fetch all company accumulations
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getMyCompanyAccumulations()
      setAccumulations(response.data)
    } catch (err: any) {
      console.error('Failed to fetch accumulations:', err)
      setError(err.response?.data?.message || 'Failed to load accumulations. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Calculate stats
  const totalAccumulations = accumulations.length
  const totalParticipants = accumulations.reduce((sum, acc) => sum + acc.participants, 0)
  const activeAccumulations = accumulations.filter(a => a.status === 'Active').length
  const totalPoints = accumulations.reduce((sum, acc) => sum + acc.points, 0)

  // CRUD: CREATE - Create new accumulation
  const handleCreateAccumulation = async (data: CreateAccumulationFormData) => {
    setIsSubmitting(true)
    try {
      const response = await createCompanyAccumulation(data)
      setAccumulations(prev => [response.data, ...prev])
      setError(null)
      setIsFormOpen(false)
    } catch (err: any) {
      console.error('Failed to create accumulation:', err)
      setError(err.response?.data?.message || 'Failed to create accumulation. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // CRUD: UPDATE - End accumulation
  const handleEndAccumulation = async (accumulation: Accumulation) => {
    if (!confirm(`Are you sure you want to end "${accumulation.title}"?`)) {
      return
    }

    try {
      const response = await endCompanyAccumulation(accumulation._id)
      setAccumulations(prev => prev.map(acc =>
        acc._id === accumulation._id ? response.data : acc
      ))
      setError(null)
    } catch (err: any) {
      console.error('Failed to end accumulation:', err)
      setError(err.response?.data?.message || 'Failed to end accumulation. Please try again.')
    }
  }

  // CRUD: DELETE - Delete accumulation
  const handleDeleteAccumulation = async (accumulation: Accumulation) => {
    if (!confirm(`Are you sure you want to delete "${accumulation.title}"?`)) {
      return
    }

    try {
      await deleteCompanyAccumulation(accumulation._id)
      setAccumulations(prev => prev.filter(acc => acc._id !== accumulation._id))
      setError(null)
    } catch (err: any) {
      console.error('Failed to delete accumulation:', err)
      setError(err.response?.data?.message || 'Failed to delete accumulation. Please try again.')
    }
  }

  const handleEditAccumulation = (accumulation: Accumulation) => {
    setEditingAccumulation(accumulation)
    setIsFormOpen(true)
  }

  const handleViewParticipants = (accumulation: Accumulation) => {
    setSelectedAccumulation(accumulation)
    setIsParticipantModalOpen(true)
  }

  // Participant management (local state)
  const handleAddParticipant = (participantData: Omit<Participant, 'status'>) => {
    if (!selectedAccumulation) return
    
    const newParticipant: Participant = {
      ...participantData,
      status: 'In Progress',
    }

    setAccumulations(prev => prev.map(acc =>
      acc._id === selectedAccumulation._id
        ? {
            ...acc,
            participantList: [...acc.participantList, newParticipant],
            participants: acc.participants + 1,
          }
        : acc
    ))
  }

  const handleRemoveParticipant = (participantName: string) => {
    if (!selectedAccumulation) return

    setAccumulations(prev => prev.map(acc =>
      acc._id === selectedAccumulation._id
        ? {
            ...acc,
            participantList: acc.participantList.filter(p => p.name !== participantName),
            participants: Math.max(0, acc.participants - 1),
          }
        : acc
    ))
  }

  const handleUpdateParticipantStatus = (participantName: string, status: Participant['status']) => {
    if (!selectedAccumulation) return

    setAccumulations(prev => prev.map(acc =>
      acc._id === selectedAccumulation._id
        ? {
            ...acc,
            participantList: acc.participantList.map(p =>
              p.name === participantName ? { ...p, status } : p
            ),
          }
        : acc
    ))
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Accumulations</h1>
            <p className="text-muted-foreground">
              Manage your company accumulations and track participant progress
            </p>
          </div>
          <CompanyAccumulationForm
            onSubmit={handleCreateAccumulation}
            open={isFormOpen}
            onOpenChange={(open) => {
              setIsFormOpen(open)
              if (!open) setEditingAccumulation(undefined)
            }}
            initialData={editingAccumulation}
          />
        </div>

        {/* Stats Overview */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between space-y-0">
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                </div>
                <div className="mt-4 h-8 w-16 bg-muted rounded animate-pulse" />
                <div className="mt-2 h-3 w-32 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Accumulations"
              value={totalAccumulations.toString()}
              description="All time"
              icon={Briefcase}
              trend={`${activeAccumulations} active`}
              trendUp={true}
            />
            <StatCard
              title="Total Participants"
              value={totalParticipants.toString()}
              description="Across all accumulations"
              icon={Users}
              trend="Enrolled"
              trendUp={true}
            />
            <StatCard
              title="Total Points"
              value={totalPoints.toString()}
              description="Available points"
              icon={Target}
              trend="Combined"
              trendUp={true}
            />
            <StatCard
              title="Active"
              value={activeAccumulations.toString()}
              description="Currently running"
              icon={Calendar}
              trend="This period"
              trendUp={true}
            />
          </div>
        )}

        {/* Accumulations Grid */}
        {loading ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="h-6 w-48 bg-muted rounded animate-pulse mb-2" />
                <div className="h-4 w-full bg-muted rounded animate-pulse mb-1" />
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse mb-4" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-12 bg-muted rounded animate-pulse" />
                  <div className="h-12 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : accumulations.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Accumulations Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first accumulation to start tracking participant progress
            </p>
            <CompanyAccumulationForm
              onSubmit={handleCreateAccumulation}
              open={isFormOpen}
              onOpenChange={setIsFormOpen}
            />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {accumulations.map((accumulation) => (
              <CompanyAccumulationCard
                key={accumulation._id}
                accumulation={accumulation}
                onViewParticipants={handleViewParticipants}
                onEdit={handleEditAccumulation}
                onDelete={handleDeleteAccumulation}
                onEnd={handleEndAccumulation}
              />
            ))}
          </div>
        )}

        {/* Participant Management Modal */}
        <ParticipantManagementModal
          accumulation={selectedAccumulation}
          open={isParticipantModalOpen}
          onOpenChange={setIsParticipantModalOpen}
          participants={selectedAccumulation?.participantList || []}
          onAddParticipant={handleAddParticipant}
          onRemoveParticipant={handleRemoveParticipant}
          onUpdateParticipantStatus={handleUpdateParticipantStatus}
        />
      </div>
    </DashboardLayout>
  )
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendUp,
}: {
  title: string
  value: string
  description: string
  icon: React.ElementType
  trend: string
  trendUp: boolean
}) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between space-y-0">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-2">
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          <span className="text-green-600 font-medium">{trend}</span>
          <span>{description}</span>
        </div>
      </div>
    </div>
  )
}
