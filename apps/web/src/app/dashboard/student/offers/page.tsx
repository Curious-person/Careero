"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Layers, LayoutDashboard, Users, Briefcase, MapPin, DollarSign, Building2, CheckCircle, ExternalLink, Activity, AlertTriangle, AlertCircle, X, Target, Zap, Clock, ListChecks, Check, GraduationCap, Bookmark, BookmarkCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/apiClient'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

const studentNavigation = [
  { name: 'Overview', href: '/dashboard/student', icon: LayoutDashboard },
  { name: 'Accumulations', href: '/dashboard/student/accumulations', icon: Layers },
  { name: 'Offers', href: '/dashboard/student/offers', icon: Briefcase },
  { name: 'My Profile', href: '/dashboard/student/profile', icon: Users },
]

export default function StudentOffersPage() {
  const [activeTab, setActiveTab] = useState<'matches' | 'applied' | 'saved'>('matches')
  const [offers, setOffers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [studentCourse, setStudentCourse] = useState('')
  const [savedOffers, setSavedOffers] = useState<string[]>([])
  const [appliedOffers, setAppliedOffers] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Drawer State
  const [selectedOffer, setSelectedOffer] = useState<any | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('careero_saved_offers')
    if (stored) {
      try { setSavedOffers(JSON.parse(stored)) } catch (e) {}
    }
    const applied = localStorage.getItem('careero_applied_offers')
    if (applied) {
      try { setAppliedOffers(JSON.parse(applied)) } catch (e) {}
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        const [res, profileRes] = await Promise.all([
          apiClient.get('/roles/student/matches'),
          apiClient.get('/profile/me')
        ])
        const offersList = res.data.data || [];
        const studentId = profileRes.data?.data?.user || profileRes.data?.data?.id;

        setOffers(offersList)
        setStudentCourse(profileRes.data?.data?.basicInfo?.course || profileRes.data?.studentCourse || '')
        
        if (studentId && offersList.length > 0) {
           const applied = offersList.filter((m: any) => m.role.appliedStudents?.includes(studentId)).map((m: any) => m.role._id);
           setAppliedOffers(applied);
        }
      } catch (err: any) {
        console.error('Failed to fetch matches:', err)
        setError(err.response?.data?.message || 'Failed to calculate your AI smart matches.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const toggleSave = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSavedOffers(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      localStorage.setItem('careero_saved_offers', JSON.stringify(next))
      return next;
    })
  }

  const toggleSaveDrawer = (id: string) => {
    setSavedOffers(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      localStorage.setItem('careero_saved_offers', JSON.stringify(next))
      return next;
    })
  }

  const handleApply = async (id: string, title: string) => {
    if (appliedOffers.includes(id)) {
      toast.info('You have already applied for this role.')
      return
    }
    try {
      setIsSubmitting(true)
      
      await apiClient.post(`/roles/${id}/apply`)
      
      setAppliedOffers(prev => {
        const next = [...prev, id]
        localStorage.setItem('careero_applied_offers', JSON.stringify(next))
        return next
      })
      toast.success(`Application submitted for ${title}!`)
      setSelectedOffer(null)
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to submit application.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const unappliedOffers = offers.filter(o => !appliedOffers.includes(o.role._id))
  const eligibleOffers = unappliedOffers.filter(o => o.careero?.isEligible).length
  
  return (
    <DashboardLayout navigation={studentNavigation}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 border border-gray-200">
              <GraduationCap className="w-3 h-3" /> {studentCourse || 'Your Course'}
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Offers</h1>
            <p className="text-gray-500 mt-1">AI-curated internships perfectly validated against your Skill Graph, Points, and Activity.</p>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-xl w-fit shrink-0">
            {(['matches', 'applied', 'saved'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                  activeTab === tab 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Available Matches', value: unappliedOffers.length, icon: Activity, from: 'from-indigo-50', to: 'to-purple-50/50', ring: 'bg-indigo-100 text-indigo-600', text: 'text-indigo-950', sub: 'text-indigo-900/60' },
            { label: 'Fully Eligible', value: eligibleOffers, icon: CheckCircle, from: 'from-green-50', to: 'to-emerald-50/50', ring: 'bg-green-100 text-green-600', text: 'text-green-950', sub: 'text-green-900/60' },
            { label: 'Needs Work', value: unappliedOffers.length - eligibleOffers, icon: AlertTriangle, from: 'from-orange-50', to: 'to-amber-50/50', ring: 'bg-orange-100 text-orange-600', text: 'text-orange-950', sub: 'text-orange-900/60' },
          ].map(({ label, value, icon: Icon, from, to, ring, text, sub }) => (
            <Card key={label} className={`rounded-[24px] border-none shadow-[0_2px_10px_rgba(0,0,0,0.03)] bg-gradient-to-br ${from} ${to}`}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${ring}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${sub}`}>{label}</p>
                    <h3 className={`text-2xl font-black ${text}`}>{value}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Loading & Error States */}
        {loading && (
          <div className="py-24 flex flex-col items-center justify-center text-center bg-white rounded-[32px] border border-gray-100 border-dashed">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Careero AI is Evaluating Your Profile</h3>
            <p className="text-gray-500 max-w-sm mx-auto">Running semantic skill matching and proof verification against active company openings...</p>
          </div>
        )}

        {error && !loading && (
          <div className="p-8 bg-red-50 border border-red-100 rounded-[24px] text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-red-900 mb-2">Matching Engine Error</h3>
            <p className="text-red-700">{error}</p>
            <Button variant="outline" className="mt-6 bg-white border-red-200 text-red-700 hover:bg-red-50" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        )}

        {/* Grid List */}
        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8 gap-6">
            {(() => {
               const displayOffers = 
                  activeTab === 'saved' ? offers.filter(o => savedOffers.includes(o.role._id)) : 
                  activeTab === 'applied' ? offers.filter(o => appliedOffers.includes(o.role._id)) : 
                  unappliedOffers;

               if (displayOffers.length === 0) {
                 return (
                   <div className="col-span-full py-24 text-center bg-white rounded-[32px] border border-gray-100 border-dashed">
                      <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">No {activeTab === 'saved' ? 'Saved' : activeTab === 'applied' ? 'Applied' : 'Matching'} Offers Found</h3>
                      <p className="text-gray-500 max-w-sm mx-auto">
                        {activeTab === 'saved' ? 'Start exploring matches and save internships you are interested in.' : 
                         activeTab === 'applied' ? 'You have not submitted any applications yet.' : 
                         'Check back later or complete more accumulations to unlock new opportunities!'}
                      </p>
                   </div>
                 )
               }

               return displayOffers.map(item => {
                  const { role, careero } = item;
                  const isSaved = savedOffers.includes(role._id);
                  
                  const scoreColor = careero.matchScore >= 80 ? 'text-emerald-600 bg-emerald-50 border-emerald-200' :
                                    careero.matchScore >= 60 ? 'text-indigo-600 bg-indigo-50 border-indigo-200' :
                                    'text-orange-600 bg-orange-50 border-orange-200';
                  
                  return (
                    <motion.div
                      key={role._id}
                      whileHover={{ y: -4 }}
                      onClick={() => setSelectedOffer(item)}
                      className={`rounded-[32px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] border flex flex-col h-full bg-white group cursor-pointer overflow-hidden transition-all duration-300 ${careero.isEligible ? 'border-emerald-100/50 hover:shadow-xl hover:border-emerald-200' : 'border-gray-100 hover:shadow-lg'}`}
                    >
                      
                      {/* Score Header */}
                      <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                         <div className="flex items-center gap-3">
                            <div className={`px-3 py-1.5 rounded-xl border text-sm font-black flex items-center gap-2 ${scoreColor}`}>
                              <Activity className="w-4 h-4" />
                              {careero.matchScore}% Match
                            </div>
                            {appliedOffers.includes(role._id) ? (
                              <div className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-xl text-xs font-bold border border-blue-200 flex items-center gap-1">
                                 <CheckCircle className="w-3.5 h-3.5" />
                                 Applied
                              </div>
                            ) : careero.isEligible ? (
                              <div className="px-3 py-1.5 bg-green-100 text-green-700 rounded-xl text-xs font-bold border border-green-200 flex items-center gap-1">
                                 <CheckCircle className="w-3.5 h-3.5" />
                                 Eligible
                              </div>
                            ) : (
                              <div className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold border border-gray-200 flex items-center gap-1">
                                 <AlertTriangle className="w-3.5 h-3.5" />
                                 Reqs Missing
                              </div>
                            )}
                         </div>
                         <div className="flex items-center gap-2">
                           <span className="text-xs font-bold text-gray-400 capitalize px-2 py-1 bg-white rounded-lg border border-gray-100">
                              {role.type}
                           </span>
                           <button onClick={(e) => toggleSave(e, role._id)} className={`p-1.5 rounded-lg border transition-all hover:scale-105 active:scale-95 ${isSaved ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-200'}`}>
                             {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                           </button>
                         </div>
                      </div>

                  <CardHeader className="pb-2 px-6 pt-6 flex-shrink-0">
                    <CardTitle className="text-xl leading-tight text-gray-900 font-extrabold group-hover:text-indigo-600 transition-colors">
                      {role.title}
                    </CardTitle>
                    <CardDescription className="text-sm font-medium text-gray-500 flex items-center gap-2 mt-2">
                      <span className="w-6 h-6 shrink-0 rounded-md bg-gray-100 flex items-center justify-center">
                        <Building2 className="w-3.5 h-3.5 text-gray-500" />
                      </span>
                      <span className="text-gray-700 font-bold truncate">{role.company?.companyName || 'Company'}</span>
                      <span className="text-gray-300 shrink-0">•</span>
                      <span className="flex items-center gap-1 text-gray-500 shrink-0"><MapPin className="w-3 h-3" /> {role.location}</span>
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="mt-auto flex flex-col px-6 pb-6 pt-2 h-full justify-between">
                    <div>
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-6">
                        {role.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mt-auto mb-6">
                        {role.skills.map((tag: string) => (
                          <span key={tag} className="px-2.5 py-1 bg-gray-100/50 border border-gray-200 rounded-xl text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-gray-50 mt-auto">
                      <Button variant="ghost" className="flex-1 font-bold rounded-xl h-11 bg-gray-50 hover:bg-gray-100 text-indigo-600">
                        View Requirements
                      </Button>
                      <div className="px-4 h-11 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center font-black text-gray-700 text-sm shrink-0 whitespace-nowrap">
                         ₱{role.salaryMin} - ₱{role.salaryMax} / {role.salaryPeriod}
                      </div>
                    </div>
                  </CardContent>
                </motion.div>
              )
            })
          })()}
          </div>
        )}

      </div>

      {/* Detail Drawer Side Panel */}
      <AnimatePresence>
        {selectedOffer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOffer(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-2xl bg-gray-50/95 backdrop-blur-md shadow-2xl z-[70] flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-6 bg-white border-b border-gray-100 shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-black uppercase tracking-wider border border-indigo-100 flex items-center gap-1.5">
                       <Activity className="w-3.5 h-3.5" />
                       {selectedOffer.careero.matchScore}% Match
                    </span>
                    {selectedOffer.careero.isEligible ? (
                       <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold border border-green-200">
                          Eligible ✅
                       </span>
                    ) : (
                       <span className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-bold border border-orange-200">
                          Requirements Missing ⚠
                       </span>
                    )}
                  </div>
                  <button onClick={() => setSelectedOffer(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div>
                  <h2 className="text-2xl font-black text-gray-900 leading-tight">{selectedOffer.role.title}</h2>
                  <div className="flex items-center gap-3 mt-3 text-sm font-medium text-gray-500">
                    <div className="flex items-center gap-1.5 text-gray-700 font-bold">
                       <Building2 className="w-4 h-4 text-emerald-500" />
                       {selectedOffer.role.company?.companyName || 'Company'}
                    </div>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-gray-500"><MapPin className="w-3.5 h-3.5" /> {selectedOffer.role.location}</span>
                    <span>•</span>
                    <span className="text-gray-500 font-bold">{selectedOffer.role.department}</span>
                    <span>•</span>
                    <span className="text-gray-500">{selectedOffer.role.openings} Openings</span>
                    {selectedOffer.role.salaryMin && (
                      <>
                        <span>•</span>
                        <span className="font-bold text-emerald-600 whitespace-nowrap">₱{selectedOffer.role.salaryMin} - ₱{selectedOffer.role.salaryMax} / {selectedOffer.role.salaryPeriod}</span>
                      </>
                    )}
                    {selectedOffer.role.postedDate && (
                      <>
                        <span>•</span>
                        <span className="text-gray-500">Posted {formatDistanceToNow(new Date(selectedOffer.role.postedDate))} ago</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                 {/* Description Section */}
                 <section>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                       <Briefcase className="w-4 h-4 text-gray-400" /> Overview
                    </h3>
                    <div className="bg-white p-5 rounded-[24px] border border-gray-200/50 shadow-sm leading-relaxed text-sm text-gray-600">
                       {selectedOffer.role.description}
                    </div>
                 </section>

                 {/* Requirements & Validation */}
                 <section>
                    <div className="flex items-center justify-between mb-4">
                       <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                          <ListChecks className="w-4 h-4 text-indigo-500" /> Actionable Requirements
                       </h3>
                       <span className="text-xs font-bold text-gray-400">Validated by Careero Flow</span>
                    </div>

                    <div className="space-y-4">
                       {/* 1. Minimum Points */}
                       <div className="bg-white p-5 rounded-[24px] border border-gray-200/50 shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-colors">
                          <div className="flex items-start justify-between mb-3 relative z-10">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                   <Zap className="w-5 h-5" />
                                </div>
                                <div>
                                   <h4 className="font-bold text-gray-900">Total Graph Points</h4>
                                   <p className="text-xs font-semibold text-gray-500 mt-0.5">Required minimum rating to apply</p>
                                </div>
                             </div>
                             <div className="text-right">
                                <span className="block font-black text-lg text-indigo-600">{selectedOffer.role.points} PTS</span>
                             </div>
                          </div>
                          <div className="relative z-10">
                             <div className="flex justify-between text-xs font-bold mb-1">
                                <span className="text-gray-500">Your Match</span>
                                <span className={selectedOffer.careero.breakdown.pointsMatch >= 100 ? 'text-green-600' : 'text-orange-500'}>
                                   {selectedOffer.careero.breakdown.pointsMatch}%
                                </span>
                             </div>
                             <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                   className={`h-full rounded-full transition-all ${selectedOffer.careero.breakdown.pointsMatch >= 100 ? 'bg-green-500' : 'bg-orange-500'}`} 
                                   style={{ width: `${Math.min(100, selectedOffer.careero.breakdown.pointsMatch)}%` }} 
                                />
                             </div>
                          </div>
                       </div>

                       {/* 2. Skills Match */}
                       <div className="bg-white p-5 rounded-[24px] border border-gray-200/50 shadow-sm">
                          <div className="flex items-start gap-3 mb-4">
                             <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <Target className="w-5 h-5" />
                             </div>
                             <div>
                                <h4 className="font-bold text-gray-900">Verified Hard Skills</h4>
                                <p className="text-xs font-semibold text-gray-500 mt-0.5 leading-relaxed">
                                   AI semantic matching verifies your skills against requirements.
                                   <span className="block mt-1 font-bold text-blue-600">Your NLP Match: {selectedOffer.careero.breakdown.skillMatch}%</span>
                                </p>
                             </div>
                          </div>
                           <ul className="space-y-2 pl-[52px]">
                             {selectedOffer.role.skills.map((skill: string) => {
                               const isMatched = (selectedOffer.careero.matchedSkills || []).includes(skill);
                               return (
                                 <li key={skill} className={`flex items-center gap-3 p-2.5 rounded-xl border text-sm font-bold transition-colors ${isMatched ? 'bg-green-50 border-green-100 text-green-800' : 'bg-orange-50 border-orange-100 text-orange-800'}`}>
                                   {isMatched 
                                     ? <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                     : <AlertCircle className="w-4 h-4 text-orange-400 shrink-0" />
                                   }
                                   {skill}
                                   <span className={`ml-auto text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${isMatched ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                     {isMatched ? 'Matched' : 'Missing'}
                                   </span>
                                 </li>
                               );
                             })}
                           </ul>
                        </div>

                       {/* 3. Mandatory Accumulations */}
                       <div className="bg-white p-5 rounded-[24px] border border-gray-200/50 shadow-sm">
                          <div className="flex items-start gap-3 mb-4">
                             <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                <Layers className="w-5 h-5" />
                             </div>
                             <div>
                                <h4 className="font-bold text-gray-900">Mandatory Accumulations</h4>
                                <p className="text-xs font-semibold text-gray-500 mt-0.5">
                                   Specific events you must complete to be eligible.
                                </p>
                             </div>
                          </div>
                           
                           {(!selectedOffer.role.requiredEvents || selectedOffer.role.requiredEvents.length === 0) ? (
                              <div className="pl-[52px] text-sm text-gray-400 font-medium">None required.</div>
                           ) : (
                              <ul className="space-y-2 pl-[52px]">
                                 {selectedOffer.role.requiredEvents.map((evt: any) => {
                                   const isDone = (selectedOffer.studentCompletedEventIds || []).includes(evt._id?.toString());
                                   return (
                                     <li key={evt._id} className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${isDone ? 'bg-green-50 border-green-100' : 'bg-orange-50 border-orange-100'}`}>
                                       <div className="flex items-center gap-3">
                                         {isDone 
                                           ? <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                           : <AlertCircle className="w-4 h-4 text-orange-400 shrink-0" />
                                         }
                                         <div className="flex flex-col gap-0.5">
                                           <span className={`text-xs font-bold uppercase tracking-wider ${isDone ? 'text-green-700' : 'text-orange-700'}`}>{evt.type}</span>
                                           <span className={`text-sm font-bold ${isDone ? 'text-green-900' : 'text-gray-900'}`}>{evt.title}</span>
                                         </div>
                                       </div>
                                       <div className="flex items-center gap-2 shrink-0">
                                         <span className="text-xs font-black text-gray-500 px-2 py-1 rounded-md bg-white border shadow-sm">+{evt.points} PTS</span>
                                         <span className={`text-[10px] font-black px-2 py-1 rounded-md ${isDone ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                           {isDone ? 'Done ✓' : 'Needed'}
                                         </span>
                                       </div>
                                     </li>
                                   );
                                 })}
                              </ul>
                           )}
                        </div>
                    </div>
                 </section>
                  {/* Missing Requirements Panel — shown only when ineligible */}
                  {!selectedOffer.careero.isEligible && selectedOffer.careero.missingRequirements?.length > 0 && (
                    <section>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-500" /> What&apos;s Holding You Back
                        </h3>
                        <span className="text-xs font-bold text-orange-600 px-2 py-1 bg-orange-50 rounded-lg border border-orange-100">{selectedOffer.careero.missingRequirements.length} Blocker{selectedOffer.careero.missingRequirements.length > 1 ? 's' : ''}</span>
                      </div>

                      {/* Category Score Breakdown */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {[
                          { label: 'Skill Match', score: selectedOffer.careero.breakdown.skillMatch, pass: selectedOffer.careero.breakdown.skillMatch >= 50, icon: Target },
                          { label: 'Points Match', score: selectedOffer.careero.breakdown.pointsMatch, pass: selectedOffer.careero.breakdown.pointsMatch >= 100, icon: Zap },
                          { label: 'Events Match', score: selectedOffer.careero.breakdown.eventsMatch, pass: selectedOffer.careero.breakdown.eventsMatch >= 100, icon: Layers },
                          { label: 'Readiness', score: selectedOffer.careero.breakdown.readinessMatch, pass: selectedOffer.careero.breakdown.readinessMatch >= 100, icon: Activity },
                        ].map(({ label, score, pass, icon: Icon }) => (
                          <div key={label} className={`p-4 rounded-2xl border ${pass ? 'bg-green-50 border-green-100' : 'bg-orange-50 border-orange-100'}`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Icon className={`w-3.5 h-3.5 ${pass ? 'text-green-600' : 'text-orange-500'}`} />
                                <span className={`text-[11px] font-black uppercase tracking-wider ${pass ? 'text-green-700' : 'text-orange-700'}`}>{label}</span>
                              </div>
                              {pass ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <AlertCircle className="w-3.5 h-3.5 text-orange-500" />}
                            </div>
                            <div className="w-full h-1.5 bg-white rounded-full overflow-hidden border border-white/80">
                              <div className={`h-full rounded-full ${pass ? 'bg-green-400' : 'bg-orange-400'}`} style={{ width: `${Math.min(100, score)}%` }} />
                            </div>
                            <span className={`text-xs font-black mt-1 block ${pass ? 'text-green-700' : 'text-orange-700'}`}>{score}%</span>
                          </div>
                        ))}
                      </div>

                      {/* Individual Blockers List */}
                      <ul className="space-y-2">
                        {selectedOffer.careero.missingRequirements.map((req: string, i: number) => (
                          <li key={i} className="flex items-start gap-3 p-4 bg-white border border-orange-100 rounded-2xl shadow-sm">
                            <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center shrink-0 mt-0.5">
                              <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
                            </div>
                            <p className="text-sm font-semibold text-gray-700">{req}</p>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
               </div>

              {/* Drawer Footer Actions */}
              <div className="p-6 bg-white border-t border-gray-100 shrink-0">
                 
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setSelectedOffer(null)} className="flex-1 font-bold h-12 rounded-xl text-gray-600 bg-white border-gray-200">
                    Cancel
                  </Button>
                  <Button onClick={() => toggleSaveDrawer(selectedOffer.role._id)} variant="outline" className={`w-14 shrink-0 h-12 rounded-xl flex items-center justify-center transition-all ${savedOffers.includes(selectedOffer.role._id) ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-200'}`}>
                    {savedOffers.includes(selectedOffer.role._id) ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                  </Button>
                  <Button 
                    disabled={!selectedOffer.careero.isEligible || appliedOffers.includes(selectedOffer.role._id) || isSubmitting} 
                    onClick={() => handleApply(selectedOffer.role._id, selectedOffer.role.title)}
                    className="flex-[2] font-extrabold h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_2px_15px_rgba(79,70,229,0.3)] disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none transition-all"
                  >
                    {!selectedOffer.careero.isEligible ? 'Resolve Requirements First' : 
                     appliedOffers.includes(selectedOffer.role._id) ? 'Application Submitted ✅' : 
                     isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}
