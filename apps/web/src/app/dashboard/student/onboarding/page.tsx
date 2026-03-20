"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/apiClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Loader2, UploadCloud, CheckCircle2, FileText, Sparkles, GraduationCap, Eye } from 'lucide-react'

type Step = 'BASIC_INFO' | 'ACADEMIC_SYNC' | 'EVIDENCE_UPLOAD' | 'COMPLETED'

interface MockAcademicData {
  records: { subject: string, grade: number, units: number }[];
  tags: string[];
  estimatedPoints: number;
}

export default function OnboardingFlow() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('BASIC_INFO')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form State
  const [studentId, setStudentId] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [middleName, setMiddleName] = useState('')
  const [course, setCourse] = useState('BSIT')
  const [section, setSection] = useState('')
  const [yearLevel, setYearLevel] = useState('1st Year')
  const [term, setTerm] = useState('1st Term')

  // Academic Sync Data
  const [academicData, setAcademicData] = useState<MockAcademicData | null>(null)

  // Document Uploads
  const [certificates, setCertificates] = useState<{ fileName: string, fileData: string, ocrText: string, classification?: any }[]>([])
  const [isUploading, setIsUploading] = useState(false)

  // Step 1: Submit Basic Info -> Fetch Mocks
  const handleBasicInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      // Intentionally simulating a heavy legacy school DB query
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const { data } = await apiClient.get(`/profile/mock-academic?course=${course}`)
      setAcademicData(data.data)
      setStep('ACADEMIC_SYNC')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to sync with school records.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Accept Mocks -> Move to Evidence
  const acceptAcademicRecords = () => {
    setStep('EVIDENCE_UPLOAD')
  }

  // Step 3: Handle Multi-File Upload & OCR
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    
    // Process all files in parallel
    const uploadPromises = Array.from(files).map(file => {
      return new Promise<{ fileName: string, fileData: string, ocrText: string, classification?: any }>((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = async () => {
          try {
            const imageBase64 = reader.result as string
            const { data } = await apiClient.post('/profile/ocr-upload', { imageBase64 })
            // Pre-bundling fileData mapping securely to be pushed up into the Profile schema logic!
            resolve({ fileName: file.name, fileData: imageBase64, ocrText: data.ocrText, classification: data.classification })
          } catch (err) {
            console.error('OCR Upload Error', err)
            // Resolve empty text to not block the rest of the queue
            resolve({ fileName: file.name, fileData: reader.result as string, ocrText: "Processing failed or skipped" })
          }
        }
        reader.onerror = reject
      })
    })

    try {
      const results = await Promise.all(uploadPromises)
      setCertificates(prev => [...prev, ...results])
    } catch (err) {
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }

  // Step 4: Finalize Profile
  const finalizeOnboarding = async () => {
    setLoading(true)
    try {
      await apiClient.post('/profile/onboard', {
        basicInfo: { studentId, firstName, lastName, middleName, course, section, yearLevel, term },
        academicRecords: academicData?.records,
        certifications: certificates
      })
      setStep('COMPLETED')
      
      // Auto-redirect to profile after 3 seconds so they can see their verified state
      setTimeout(() => {
        router.push('/dashboard/student/profile')
      }, 3000)
    } catch (err) {
      setError('Failed to securely lock profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step Indicator UI
  const stepsList: Step[] = ['BASIC_INFO', 'ACADEMIC_SYNC', 'EVIDENCE_UPLOAD', 'COMPLETED'];
  const currentStepIndex = stepsList.indexOf(step);

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center p-4 selection:bg-black selection:text-white pb-32">
      <div className="w-full max-w-2xl relative">
        
        {/* Step Indicator */}
        <div className="mb-8 w-full">
          <div className="flex justify-between relative">
            {/* Background Line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-100 -translate-y-1/2 rounded-full z-0" />
            
            {/* Active Line Fill */}
            <motion.div 
              className="absolute top-1/2 left-0 h-1 bg-black -translate-y-1/2 rounded-full z-0"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStepIndex / (stepsList.length - 1)) * 100}%` }}
              transition={{ duration: 0.4 }}
            />

            {['Basic Info', 'Sync Records', 'Evidence', 'Finish'].map((label, idx) => {
              const isActive = idx <= currentStepIndex;
              return (
                <div key={label} className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${isActive ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {idx + 1}
                  </div>
                  <span className={`text-xs font-semibold ${isActive ? 'text-black' : 'text-gray-400'}`}>{label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Animated Card Container */}
        <div className="bg-white rounded-[32px] shadow-xl shadow-gray-200/50 p-8 md:p-12 overflow-hidden border border-[#EEEEEE] relative">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: BASIC INFO */}
            {step === 'BASIC_INFO' && (
              <motion.div
                key="basic"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">Academic Identity</h1>
                    <p className="text-gray-500">Provide your core registration details to sync your records.</p>
                  </div>
                </div>

                <form onSubmit={handleBasicInfoSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Student ID</label>
                      <Input 
                        required
                        placeholder="e.g. 2021-12345"
                        value={studentId}
                        onChange={e => setStudentId(e.target.value)}
                        className="h-12 rounded-xl bg-gray-50/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Section</label>
                      <Input 
                        required
                        placeholder="e.g. IT-3A"
                        value={section}
                        onChange={e => setSection(e.target.value)}
                        className="h-12 rounded-xl bg-gray-50/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Surname</label>
                      <Input 
                        required
                        placeholder="Dela Cruz"
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        className="h-12 rounded-xl bg-gray-50/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">First Name</label>
                      <Input 
                        required
                        placeholder="Juan"
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        className="h-12 rounded-xl bg-gray-50/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Middle Name</label>
                      <Input 
                        placeholder="(Optional)"
                        value={middleName}
                        onChange={e => setMiddleName(e.target.value)}
                        className="h-12 rounded-xl bg-gray-50/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Course</label>
                      <select 
                        value={course}
                        onChange={e => setCourse(e.target.value)}
                        className="flex h-12 w-full rounded-xl border border-input bg-gray-50/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="BSIT">BS Information Technology</option>
                        <option value="BSCS">BS Computer Science</option>
                        <option value="BSBA">BS Business Administration</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Year Level</label>
                      <select 
                        value={yearLevel}
                        onChange={e => setYearLevel(e.target.value)}
                        className="flex h-12 w-full rounded-xl border border-input bg-gray-50/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option>1st Year</option>
                        <option>2nd Year</option>
                        <option>3rd Year</option>
                        <option>4th Year</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Term</label>
                      <select 
                        value={term}
                        onChange={e => setTerm(e.target.value)}
                        className="flex h-12 w-full rounded-xl border border-input bg-gray-50/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option>1st Term</option>
                        <option>2nd Term</option>
                        <option>Summer</option>
                      </select>
                    </div>
                  </div>

                  {error && <p className="text-red-500 font-medium text-sm pt-2">{error}</p>}

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-12 mt-4 text-base rounded-xl font-semibold"
                  >
                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sync School Records'}
                  </Button>
                </form>
              </motion.div>
            )}

            {/* STEP 2: ACADEMIC SYNC (MOCK ENGINE RESULTS) */}
            {step === 'ACADEMIC_SYNC' && academicData && (
              <motion.div
                key="sync"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">Records Found</h1>
                    <p className="text-gray-500">We&apos;ve pulled your academic profile and pre-assigned your skill tags.</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {/* Subject List */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                    <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wider">Synced Subjects</h3>
                    {academicData.records.map((r, i) => (
                      <div key={i} className="flex justify-between items-center px-2 py-1 bg-white rounded-lg border shadow-sm">
                        <span className="font-medium text-sm">{r.subject}</span>
                        <span className={`text-sm font-bold ${r.grade >= 85 ? 'text-green-600' : 'text-blue-600'}`}>{r.grade}%</span>
                      </div>
                    ))}
                  </div>

                  {/* Auto Tags */}
                  <div>
                    <h3 className="font-semibold text-sm mb-2 text-gray-700 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-yellow-500" /> Auto-Assigned Skill Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {academicData.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-black text-white text-xs font-semibold rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={acceptAcademicRecords}
                  className="w-full h-12 text-base rounded-xl font-semibold"
                >
                  Confirm & Proceed to Evidence
                </Button>
              </motion.div>
            )}

            {/* STEP 3: EVIDENCE & OCR UPLOAD */}
            {step === 'EVIDENCE_UPLOAD' && (
              <motion.div
                key="evidence"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">Upload Evidence</h1>
                    <p className="text-gray-500">Provide certificates. Our AI will automatically parse them for verification.</p>
                  </div>
                </div>

                {/* Upload Zone */}
                <div className="border-2 border-dashed border-gray-200 rounded-[24px] p-8 text-center hover:bg-gray-50 transition-colors relative cursor-pointer">
                  <input 
                    type="file" 
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    disabled={isUploading}
                  />
                  {isUploading ? (
                    <div className="py-4">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-brand-blue mb-2" />
                      <p className="font-medium text-sm text-gray-500">Hugging Face AI parsing multiple documents...</p>
                    </div>
                  ) : (
                    <div className="py-4">
                      <UploadCloud className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="font-medium text-black">Click or drag certificates here</p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB. Multiple allowed.</p>
                    </div>
                  )}
                </div>

                {/* Uploaded List */}
                {certificates.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h3 className="font-semibold text-sm text-gray-700">Uploaded Evidence ({certificates.length})</h3>
                    {certificates.map((cert, i) => (
                      <div key={i} className="flex flex-col gap-1 p-3 bg-gray-50 rounded-xl border border-gray-100 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-brand-blue">{cert.fileName}</span>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-brand-blue">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-transparent border-0 rounded-[24px]">
                              <img src={cert.fileData} alt={cert.fileName} className="w-full h-auto object-contain bg-black/90 backdrop-blur-xl" />
                            </DialogContent>
                          </Dialog>
                        </div>
                        <span className="text-xs text-gray-400 italic bg-white p-2 rounded border border-gray-100 mt-1 line-clamp-2">
                          &quot; {cert.ocrText} &quot;
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-8 flex gap-3">
                  <Button 
                    variant="outline"
                    onClick={finalizeOnboarding}
                    disabled={loading}
                    className="w-full h-12 text-base rounded-xl font-semibold"
                  >
                    Skip Evidence
                  </Button>
                  <Button 
                    onClick={finalizeOnboarding}
                    disabled={loading || certificates.length === 0}
                    className="w-full h-12 text-base rounded-xl font-semibold"
                  >
                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Finalize Profile'}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: COMPLETED & UNDER EVALUATION */}
            {step === 'COMPLETED' && (
              <motion.div
                key="completed"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight mb-3">Under Evaluation</h1>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                  Your academic records and uploaded evidence have been successfully mapped. Your school administration is currently reviewing your profile to publicly unlock it!
                </p>
                <div className="flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
