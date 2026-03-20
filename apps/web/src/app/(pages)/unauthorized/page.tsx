"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { ShieldAlert, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col font-sans items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md text-center flex flex-col items-center"
      >
        <motion.div 
          initial={{ rotate: -10 }}
          animate={{ rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-red-100"
        >
          <ShieldAlert className="w-10 h-10 text-red-500" />
        </motion.div>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-3">
           Restricted Access
        </h1>
        <p className="text-lg text-slate-500 mb-10 max-w-sm">
          It looks like you don&apos;t have the required permissions to view this page, or your session has expired.
        </p>

        <div className="flex gap-4 w-full">
          <Link href="/login" className="flex-1">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-14 rounded-2xl bg-black text-white font-semibold flex items-center justify-center gap-2"
            >
              Sign In Securely
            </motion.button>
          </Link>
          
          <Link href="/" className="flex-1">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-14 rounded-2xl bg-gray-100 text-black font-semibold hover:bg-gray-200 transition-colors"
            >
               Go Home
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
