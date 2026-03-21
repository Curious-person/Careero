"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { Rocket } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/apiClient'

const ErrorAlert = ({ message }: { message: string }) => {
  if (!message) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm font-medium p-3 rounded-xl w-full text-left mt-2 mb-2"
    >
      <AlertCircle className="w-5 h-5 flex-shrink-0" />
      <span className="leading-tight">{message}</span>
    </motion.div>
  )
}
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'

type Step = 'EMAIL' | 'PASSWORD' | 'OTP' | 'REGISTER_PASSWORD' | 'STUDENT_ID'

export default function LoginPage() {
  const [step, setStep] = useState<Step>('EMAIL')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form State
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [otp, setOtp] = useState('')
  const [studentId, setStudentId] = useState('')

  // Wipe leftover localstorage from old architectural setup
  useEffect(() => {
    localStorage.removeItem('token')
  }, [])

  const router = useRouter()

  // Scalable Route Mapper
  const getRedirectPath = (role: string) => {
    switch (role) {
      case 'student': return '/dashboard/student';
      case 'school': return '/dashboard/school';
      case 'company': return '/dashboard/company';
      default: return '/dashboard/student';
    }
  }

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setError('')
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true)
    try {
      const { data } = await apiClient.post('/auth/check-email', { email })

      if (data.exists) {
        if (data.skipOtp) {
          setStep('PASSWORD')
        } else {
          await apiClient.post('/auth/request-otp', { email })
          setStep('OTP')
        }
      } else {
        // Send OTP and move to OTP step
        await apiClient.post('/auth/request-otp', { email })
        setStep('OTP')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Connection error')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckStudentId = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Strict mock regex: 4 digits, a dash, and 5 digits
    const studentIdRegex = /^\d{4}-\d{5}$/;
    if (!studentIdRegex.test(studentId)) {
      setError('Invalid format. Please use: 2023-12345')
      return;
    }

    setLoading(true)
    try {
      await apiClient.post('/auth/request-otp', { email })
      setStep('OTP')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to request OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await apiClient.post('/auth/login', { email, password })
      router.push(getRedirectPath(data.user.role))
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (code: string) => {
    setOtp(code)
    if (code.length !== 6) return

    setLoading(true)
    setError('')
    try {
      await apiClient.post('/auth/verify-otp', { email, otp: code })

      // If user exists, we skip registering password and log them in smoothly
      const checkRes = await apiClient.post('/auth/check-email', { email })
      if (checkRes.data.exists) {
        setStep('PASSWORD')
      } else {
        setStep('REGISTER_PASSWORD')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    setError('')
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('Password requires 8+ chars, upper, lower, number, and special character.');
      return;
    }

    setLoading(true)
    try {
      await apiClient.post('/auth/register', { email, password, role: 'student' })
      // Instantly inject the user into the Academic Sync & Evidence Upload Flow
      router.push('/dashboard/student/onboarding')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col font-sans">
      {/* Navbar overlay */}
      <nav className="p-6 absolute top-0 left-0 w-full flex justify-between items-center z-50">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <Rocket className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">Careero</span>
        </Link>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm relative">

          {/* Back Button Context */}
          <AnimatePresence>
            {step !== 'EMAIL' && (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onClick={() => setStep('EMAIL')}
                className="absolute -top-12 left-0 text-gray-400 hover:text-black transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </motion.button>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">

            {/* STEP: EMAIL */}
            {step === 'EMAIL' && (
              <motion.div
                key="email"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <Rocket className="w-8 h-8 text-black" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Welcome to Careero</h1>
                <p className="text-sm text-gray-500 mb-8">Log in or sign up to get started.</p>

                <form onSubmit={handleCheckEmail} className="flex flex-col gap-4">
                  <Input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 rounded-2xl bg-gray-50/50 border-gray-200 text-lg px-4"
                    required
                  />
                  <ErrorAlert message={error} />

                  <Button
                    type="submit"
                    className="h-14 rounded-2xl w-full bg-black text-white text-lg font-semibold hover:bg-gray-800 transition-all mt-2"
                    disabled={loading || !email}
                  >
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Continue'}
                  </Button>
                </form>

                <p className="text-xs text-gray-400 mt-8">
                  We&apos;ll create an account if you don&apos;t have one yet.
                </p>
              </motion.div>
            )}

            {/* STEP: STUDENT ID */}
            {step === 'STUDENT_ID' && (
              <motion.div
                key="student_id"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <span className="text-2xl">🎓</span>
                </div>
                <h1 className="text-2xl font-bold mb-2">Are you a student?</h1>
                <p className="text-sm text-gray-500 mb-8 font-medium">Please enter your school ID for verification.</p>

                <form onSubmit={handleCheckStudentId} className="flex flex-col gap-4">
                  <Input
                    type="text"
                    placeholder="E.g. 2023-12345"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="h-14 rounded-2xl bg-gray-50/50 border-gray-200 text-lg px-4 font-mono text-center tracking-wider"
                    required
                    autoFocus
                  />
                  <ErrorAlert message={error} />

                  <Button
                    type="submit"
                    className="h-14 rounded-2xl w-full bg-black text-white text-lg font-semibold hover:bg-gray-800 transition-all mt-2"
                    disabled={loading || !studentId}
                  >
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Verify Identity'}
                  </Button>
                </form>
              </motion.div>
            )}

            {/* STEP: PASSWORD (Login) */}
            {step === 'PASSWORD' && (
              <motion.div
                key="password"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <span className="text-2xl">🔒</span>
                </div>
                <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
                <p className="text-sm text-gray-500 mb-8 font-medium">{email}</p>

                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-14 rounded-2xl bg-gray-50/50 border-gray-200 text-lg px-4 pr-12"
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <ErrorAlert message={error} />

                  <Button
                    type="submit"
                    className="h-14 rounded-2xl w-full bg-black text-white text-lg font-semibold hover:bg-gray-800 transition-all mt-2"
                    disabled={loading || !password}
                  >
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Log In'}
                  </Button>
                </form>
              </motion.div>
            )}

            {/* STEP: OTP */}
            {step === 'OTP' && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="text-center w-full"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-6 flex items-center justify-center text-brand-blue">
                  <span className="text-2xl">✉️</span>
                </div>
                <h1 className="text-2xl font-bold mb-2">We&apos;ve emailed you a code</h1>
                <p className="text-sm text-gray-500 mb-8 font-medium">Please enter the code we sent to<br /><span className="text-black">{email}</span></p>

                <div className="flex justify-center mb-6">
                  <InputOTP maxLength={6} value={otp} onChange={handleVerifyOtp} disabled={loading} autoFocus>
                    <InputOTPGroup className="gap-2">
                      <InputOTPSlot index={0} className="w-12 h-14 text-lg rounded-xl border-gray-200 focus:border-brand-blue" />
                      <InputOTPSlot index={1} className="w-12 h-14 text-lg rounded-xl border-gray-200 focus:border-brand-blue" />
                      <InputOTPSlot index={2} className="w-12 h-14 text-lg rounded-xl border-gray-200 focus:border-brand-blue" />
                      <InputOTPSlot index={3} className="w-12 h-14 text-lg rounded-xl border-gray-200 focus:border-brand-blue" />
                      <InputOTPSlot index={4} className="w-12 h-14 text-lg rounded-xl border-gray-200 focus:border-brand-blue" />
                      <InputOTPSlot index={5} className="w-12 h-14 text-lg rounded-xl border-gray-200 focus:border-brand-blue" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <ErrorAlert message={error} />

                <p className="text-sm text-gray-500">
                  Didn&apos;t receive a code? <button className="text-black font-semibold hover:underline" onClick={() => handleCheckEmail({ preventDefault: () => { } } as any)}>Resend</button>
                </p>
              </motion.div>
            )}

            {/* STEP: REGISTER PASSWORD */}
            {step === 'REGISTER_PASSWORD' && (
              <motion.div
                key="register_password"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <span className="text-2xl">✨</span>
                </div>
                <h1 className="text-2xl font-bold mb-2">Set Password</h1>
                <p className="text-sm text-gray-500 mb-8">Create a secure password to finalize your account.</p>

                <form onSubmit={handleRegister} className="flex flex-col gap-4">
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="New Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-14 rounded-2xl bg-gray-50/50 border-gray-200 text-lg px-4 pr-12"
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <ErrorAlert message={error} />

                  <Button
                    type="submit"
                    className="h-14 rounded-2xl w-full bg-black text-white text-lg font-semibold hover:bg-gray-800 transition-all mt-2"
                    disabled={loading || password.length < 8}
                  >
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Create Account'}
                  </Button>
                </form>
                <p className="text-xs text-gray-400 mt-6">
                  Min. 8 characters. Make it strong!
                </p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* Footer Pill */}
      <div className="pb-8 flex justify-center w-full">
        <div className="flex items-center gap-4 px-6 py-2 rounded-full border border-gray-100 bg-white shadow-sm text-sm">
          <span className="font-semibold">Careero Education network</span>
          <span className="text-gray-300">|</span>
          <Link href="#" className="font-bold flex items-center gap-1 hover:text-gray-600 transition-colors">
            Learn More ↗
          </Link>
        </div>
      </div>
      <div className="pb-8 flex justify-center gap-4 text-xs text-gray-400">
        <Link href="#">Developers</Link>
        <span>·</span>
        <Link href="#">Privacy</Link>
        <span>·</span>
        <Link href="#">Terms</Link>
      </div>
    </div>
  )
}
