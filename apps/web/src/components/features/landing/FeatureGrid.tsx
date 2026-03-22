import React from 'react';
import { Users } from 'lucide-react';

export const FeatureGrid = () => {
  return (
    <section id="features" className="py-24 bg-white relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">The platform designed <br />for high-impact careers.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="glass-card p-8 md:col-span-2 flex flex-col justify-between overflow-hidden relative group">
            <div>
              <h3 className="text-2xl font-bold mb-2">Smart Career Roadmap</h3>
              <p className="text-gray-500 max-w-md">Our algorithm analyzes your skills and interests to build a personalized path to your dream job.</p>
            </div>
            <div className="mt-12 relative h-40">
              <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent z-10" />
              <div className="flex gap-4 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-32 h-48 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-100 rounded-full mb-3" />
                    <div className="h-2 w-full bg-gray-100 rounded mb-2" />
                    <div className="h-2 w-2/3 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="glass-card p-8 flex flex-col justify-between bg-brand-blue/5 border-brand-blue/10">
            <div className="w-12 h-12 bg-brand-blue rounded-2xl flex items-center justify-center mb-6">
              <Users className="text-white w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Global Network</h3>
              <p className="text-gray-500">Connect with hiring partners and recruiters from world-class organizations looking for verified talent.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-8 flex items-center gap-8">
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2">Milestone Tracking</h3>
              <p className="text-gray-500">Visualize your growth with interactive charts and progress bars.</p>
            </div>
            <div className="w-32 h-32 relative">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="50" fill="transparent" stroke="#E5E7EB" strokeWidth="12" />
                <circle cx="64" cy="64" r="50" fill="transparent" stroke="#007AFF" strokeWidth="12" strokeDasharray="314" strokeDashoffset="100" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-bold text-xl">68%</div>
            </div>
          </div>
          <div className="glass-card p-8 flex flex-col justify-center bg-black text-white">
            <h3 className="text-2xl font-bold mb-2 text-black">Verified Proof</h3>
            <p className="text-gray-400 mb-6">Your achievements are backed by school-verified milestones and accumulation points.</p>
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-gray-800 flex items-center justify-center text-[10px] font-bold">
                  SKL
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-black bg-brand-green flex items-center justify-center text-[10px] font-bold">
                +12
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
