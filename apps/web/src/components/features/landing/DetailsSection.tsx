import React from 'react';
import { Shield, Globe, Zap, Star } from 'lucide-react';

export const DetailsSection = ({ id }: { id?: string }) => {
  const details = [
    { icon: Shield, title: "Privacy First", desc: "Your data is encrypted and completely secure within our school networks." },
    { icon: Globe, title: "Global Reach", desc: "Connect with recruiters and open roles from all over the world." },
    { icon: Zap, title: "Real-time Updates", desc: "Get instant notifications for role matches and milestone completions." },
    { icon: Star, title: "Top Rated", desc: "Trusted by over 500+ top-tier tech companies globally." },
  ];

  return (
    <section id={id} className="py-24 bg-[#F9F9F9]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <h2 className="text-4xl font-bold mb-4">Details that matter.</h2>
          <p className="text-gray-500 max-w-xl">We&apos;ve obsessed over every pixel and algorithm to ensure you have the best career building experience possible.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {details.map((detail, i) => (
            <div key={i} className="flex flex-col gap-4">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
                <detail.icon className="w-5 h-5 text-black" />
              </div>
              <h3 className="font-bold text-lg">{detail.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{detail.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
