"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, GraduationCap, Briefcase, Target, Compass, TrendingUp, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const FloatingIcon = ({ icon: Icon, color, delay = 0, x = 0, y = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ 
      opacity: 1, 
      scale: 1,
      y: [y, y - 20, y],
      rotate: [0, 5, -5, 0]
    }}
    transition={{ 
      opacity: { duration: 0.5, delay },
      scale: { duration: 0.5, delay },
      y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay },
      rotate: { duration: 6, repeat: Infinity, ease: "easeInOut", delay }
    }}
    className={cn(
      "absolute w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg z-10 hidden lg:flex",
      color
    )}
    style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
  >
    <Icon className="text-white w-6 h-6" />
  </motion.div>
);

export const Hero = () => {
  return (
    <section className="relative pt-40 pb-20 overflow-hidden min-h-[90vh] flex flex-col items-center justify-center bg-dot-pattern">
      <div className="container mx-auto px-6 text-center relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-xs font-bold uppercase tracking-widest text-gray-500 mb-6 border border-gray-200 shadow-sm">
            <Sparkles className="w-3 h-3 text-brand-orange" />
            Your Career, Reimagined
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 max-w-5xl mx-auto leading-[1.05]">
            The career platform for <br />
            <span className="text-gray-400">the next generation.</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Pathly helps you discover your potential, track your progress, and connect directly with companies who actually care about your skills.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-black text-white hover:bg-gray-800 rounded-full text-lg h-14 px-8 group">
                Join Pathly
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#features" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full text-lg h-14 px-8 border-gray-200">
                Explore Features
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      <FloatingIcon icon={GraduationCap} color="bg-brand-blue" x={-450} y={-150} delay={0.2} />
      <FloatingIcon icon={Briefcase} color="bg-brand-green" x={380} y={-100} delay={0.4} />
      <FloatingIcon icon={Target} color="bg-brand-orange" x={-380} y={150} delay={0.6} />
      <FloatingIcon icon={Compass} color="bg-brand-purple" x={420} y={180} delay={0.8} />
      <FloatingIcon icon={TrendingUp} color="bg-red-500" x={0} y={280} delay={1} />
    </section>
  );
};
