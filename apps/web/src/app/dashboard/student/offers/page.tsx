"use client"

import { useState } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Layers, LayoutDashboard, Settings, Users, Briefcase, MapPin, DollarSign, Building2, CheckCircle, ExternalLink, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'

const studentNavigation = [
  { name: 'Overview', href: '/dashboard/student', icon: LayoutDashboard },

  { name: 'Accumulations', href: '/dashboard/student/accumulations', icon: Layers },
  { name: 'Offers', href: '/dashboard/student/offers', icon: Briefcase },
    { name: 'My Profile', href: '/dashboard/student/profile', icon: Users },
]

const MOCK_OFFERS = [
  {
    id: 'offer-1',
    role: 'Cybersecurity Intern',
    company: 'TechCorp Solutions',
    matchScore: 94,
    location: 'San Francisco, CA (Hybrid)',
    type: 'Internship',
    salary: '$40 - $55/hr',
    status: 'New Match',
    tags: ['cybersec', 'networking', 'infrastructure'],
    description: 'Join our elite red team for a 12-week intensive summer internship defending cloud infrastructure.',
  },
  {
    id: 'offer-2',
    role: 'Junior Full-Stack Engineer',
    company: 'Pathly Design Labs',
    matchScore: 88,
    location: 'Remote',
    type: 'Full-time',
    salary: '$85k - $110k',
    status: 'Application Sent',
    tags: ['react', 'frontend', 'node.js', 'architecture'],
    description: 'Build responsive interfaces and robust backend microservices. Direct pipeline from your recent Hackathon performance.',
  },
  {
    id: 'offer-3',
    role: 'Data Analyst Fellow',
    company: 'Global Finance Analytics',
    matchScore: 82,
    location: 'New York, NY',
    type: 'Fellowship',
    salary: '$30/hr',
    status: 'Action Required',
    tags: ['data-analysis', 'sql', 'python'],
    description: 'Extract actionable insights from massive financial datasets using modern BI tools.',
  }
]

export default function StudentOffersPage() {
  const [activeTab, setActiveTab] = useState<'matches' | 'applied' | 'saved'>('matches')

  return (
    <DashboardLayout navigation={studentNavigation}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Career Offers</h1>
            <p className="text-gray-500 mt-1">AI-curated internships and roles perfectly matched to your Skill Graph.</p>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-xl w-fit shrink-0">
            {(['matches', 'applied', 'saved'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                  activeTab === tab 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-[24px] border-none shadow-[0_2px_10px_rgba(0,0,0,0.03)] bg-gradient-to-br from-indigo-50 to-purple-50/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-indigo-900/60">New AI Matches</p>
                  <h3 className="text-2xl font-black text-indigo-950">24</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-[24px] border-none shadow-[0_2px_10px_rgba(0,0,0,0.03)] bg-gradient-to-br from-blue-50 to-cyan-50/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900/60">Applications Sent</p>
                  <h3 className="text-2xl font-black text-blue-950">5</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-[24px] border-none shadow-[0_2px_10px_rgba(0,0,0,0.03)] bg-gradient-to-br from-emerald-50 to-green-50/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-900/60">Interviews</p>
                  <h3 className="text-2xl font-black text-emerald-950">2</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grid List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {MOCK_OFFERS.map(offer => (
            <Card key={offer.id} className="rounded-[24px] shadow-sm hover:shadow-md transition-shadow border-gray-100 flex flex-col h-full bg-white group cursor-pointer overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold w-fit">
                    {offer.type}
                  </div>
                  <div className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-black w-fit flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    {offer.matchScore}% Match
                  </div>
                </div>
                <CardTitle className="text-lg leading-tight group-hover:text-indigo-600 transition-colors">
                  {offer.role}
                </CardTitle>
                <CardDescription className="text-sm font-medium text-gray-500 flex items-center gap-1.5 mt-2">
                  <Building2 className="w-4 h-4 text-emerald-500" />
                  {offer.company}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto flex flex-col gap-4">
                <p className="text-sm text-gray-600 line-clamp-2">
                  {offer.description}
                </p>
                
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{offer.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{offer.salary}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {offer.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="pt-4 mt-2 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                    <span className={`w-2 h-2 rounded-full ${
                      offer.status === 'New Match' ? 'bg-indigo-500' :
                      offer.status === 'Application Sent' ? 'bg-blue-500' : 'bg-red-500'
                    }`} />
                    {offer.status}
                  </div>
                  <Button variant="ghost" className="text-indigo-600 font-bold hover:bg-indigo-50 -mr-2 text-sm rounded-xl">
                    Apply <ExternalLink className="w-4 h-4 ml-1" />
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
