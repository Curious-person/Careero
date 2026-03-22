"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/features/landing/Navbar';
import { Hero } from '@/components/features/landing/Hero';
import { FeatureGrid } from '@/components/features/landing/FeatureGrid';
import { MockupSection } from '@/components/features/landing/MockupSection';
import { BlogSection } from '@/components/features/landing/BlogSection';
import { DetailsSection } from '@/components/features/landing/DetailsSection';
import { Footer } from '@/components/features/landing/Footer';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="selection:bg-brand-blue selection:text-white min-h-screen">
      <Navbar />

      <main>
        <Hero />

        <FeatureGrid />

        <MockupSection
          id="explore"
          title="Level up your skills, every single day."
          subtitle="Direct Path"
          description="Our interactive dashboard gives you a bird's eye view of your professional growth. See where you excel and exactly how many points you need for that dream internship."
          color="text-brand-blue"
        />

        <MockupSection
          title="Direct matches to open internships."
          subtitle="Match Engine"
          description="Skip the cold emails. Careero automatically matches your verified school milestones with companies actively looking for your exact skillset."
          color="text-brand-green"
          reverse
        />

        <BlogSection />

        <DetailsSection id="community" />

        {/* Final CTA */}
        <section className="py-32 bg-white text-center px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto bg-black text-white rounded-[48px] p-12 md:p-24 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-full bg-dot-pattern opacity-10" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold mb-8">Ready to start <br />your journey?</h2>
              <p className="text-xl text-gray-400 mb-12 max-w-xl mx-auto">
                Join thousands of students building their verified skillset with Careero.
              </p>
              <Link href="/dashboard">
                <button className="bg-white text-black px-10 py-5 rounded-full text-xl font-bold hover:bg-gray-100 transition-all active:scale-95">
                  Join for Free
                </button>
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
