"use client"

import { useState } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Layers, LayoutDashboard, Settings, Users, Briefcase, Trophy, Clock, CalendarDays, ExternalLink, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

const studentNavigation = [
  { name: 'Overview', href: '/dashboard/student', icon: LayoutDashboard },

  { name: 'Accumulations', href: '/dashboard/student/accumulations', icon: Layers },
  { name: 'Offers', href: '/dashboard/student/offers', icon: Briefcase },

    { name: 'My Profile', href: '/dashboard/student/profile', icon: Users },
]

const MOCK_ACCUMULATIONS = [
  {
    id: 'acc-1',
    title: 'Advanced React Architecture Workshop',
    provider: 'Tech Academy',
    type: 'Course',
    points: 150,
    status: 'Available',
    duration: '2 Weeks',
    tags: ['react', 'frontend', 'architecture'],
    description: 'Learn enterprise-grade React design patterns and state management.',
  },
  {
    id: 'acc-2',
    title: 'Cybersecurity Threat Hunting CTF',
    provider: 'Defcon Local',
    type: 'Challenge',
    points: 300,
    status: 'Closing Soon',
    duration: '48 Hours',
    tags: ['cybersecurity', 'networking', 'penetration-testing'],
    description: 'A 48-hour intensive capture the flag event focusing on network vulnerabilities.',
  },
  {
    id: 'acc-3',
    title: 'Campus UI/UX Redesign Hackathon',
    provider: 'Pathly Design Labs',
    type: 'Event',
    points: 200,
    status: 'Available',
    duration: '3 Days',
    tags: ['ui/ux design', 'figma', 'prototyping'],
    description: 'Redesign the university library portal. Winning teams get direct portfolio validation.',
  }
]

export default function StudentAccumulationsPage() {
  const [activeTab, setActiveTab] = useState<'available' | 'in-progress' | 'completed'>('available')

  return (
    <DashboardLayout navigation={studentNavigation}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Accumulations</h1>
            <p className="text-gray-500 mt-1">Discover challenges, courses, and events to boost your Skill Graph points.</p>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-xl w-fit shrink-0">
            {(['available', 'in-progress', 'completed'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                  activeTab === tab 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-[24px] border-none shadow-[0_2px_10px_rgba(0,0,0,0.03)] bg-gradient-to-br from-blue-50 to-indigo-50/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900/60">Available Tasks</p>
                  <h3 className="text-2xl font-black text-blue-950">24</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-[24px] border-none shadow-[0_2px_10px_rgba(0,0,0,0.03)] bg-gradient-to-br from-orange-50 to-amber-50/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-orange-900/60">In Progress</p>
                  <h3 className="text-2xl font-black text-orange-950">2</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-[24px] border-none shadow-[0_2px_10px_rgba(0,0,0,0.03)] bg-gradient-to-br from-green-50 to-emerald-50/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-green-600">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-900/60">Completed</p>
                  <h3 className="text-2xl font-black text-green-950">12</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grid List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {MOCK_ACCUMULATIONS.map(accum => (
            <Card key={accum.id} className="rounded-[24px] shadow-sm hover:shadow-md transition-shadow border-gray-100 flex flex-col h-full bg-white group cursor-pointer overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold w-fit">
                    {accum.type}
                  </div>
                  <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-black w-fit">
                    +{accum.points} PTS
                  </div>
                </div>
                <CardTitle className="text-lg leading-tight group-hover:text-blue-600 transition-colors">
                  {accum.title}
                </CardTitle>
                <CardDescription className="text-sm font-medium text-gray-500 flex items-center gap-1.5 mt-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  {accum.provider}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto flex flex-col gap-4">
                <p className="text-sm text-gray-600 line-clamp-2">
                  {accum.description}
                </p>
                
                <div className="flex flex-wrap gap-1.5">
                  {accum.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-50 border border-gray-100 rounded-lg text-xs font-semibold text-gray-600">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="pt-4 mt-2 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {accum.duration}
                  </div>
                  <Button variant="ghost" className="text-blue-600 font-bold hover:bg-blue-50 -mr-2 text-sm rounded-xl">
                    View Details <ExternalLink className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </DashboardLayout>
  )
}
