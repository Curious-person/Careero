"use client"

import { useEffect, useState } from "react"
import AccumulationsPage from "./AccumulationsPage"
import type { Student } from "../_data/school-data"
import { COURSES } from "../_data/school-data"
import type { Accum } from "./AccumulationsPage"

export default function AccumulationsPageRoute() {
  const [accums, setAccums] = useState<Accum[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedAccum, setSelectedAccum] = useState<Accum | null>(null)
  const [selectedPerson, setSelectedPerson] = useState<{ name: string; role: string; email: string } | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  useEffect(() => {
    fetch("http://localhost:5001/api/v1/accumulations")
      .then(r => r.json())
      .then(json => setAccums(json.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSelectAccum = (a: Accum) => {
    setSelectedAccum(a)
    setSelectedPerson(null)
    setSelectedStudent(null)
  }

  const handleSelectPerson = (person: { name: string; role: string; email: string }) => {
    setSelectedPerson(person)
  }

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student)
  }

  const handleBack = () => {
    if (selectedPerson || selectedStudent) {
      setSelectedPerson(null)
      setSelectedStudent(null)
    } else {
      setSelectedAccum(null)
    }
  }

  const handleAccumUpdate = (updated: Accum) => {
    setAccums(prev => prev.map(a => a._id === updated._id ? updated : a))
    setSelectedAccum(updated)
  }

  const handleAccumCreate = (created: Accum) => {
    setAccums(prev => [...prev, created])
  }

  if (loading) return <div className="p-8 text-muted-foreground text-sm">Loading accumulations...</div>

  return (
    <AccumulationsPage
      accums={accums}
      selectedAccum={selectedAccum}
      selectedPerson={selectedPerson}
      selectedStudent={selectedStudent}
      onSelectAccum={handleSelectAccum}
      onSelectPerson={handleSelectPerson}
      onSelectStudent={handleSelectStudent}
      onBack={handleBack}
      onAccumUpdate={handleAccumUpdate}
      onAccumCreate={handleAccumCreate}
    />
  )
}
