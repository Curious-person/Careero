import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface MockupSectionProps {
  title: string;
  subtitle: string;
  description: string;
  color: string;
  reverse?: boolean;
}

export const MockupSection = ({ title, subtitle, description, color, reverse = false }: MockupSectionProps) => {
  return (
    <section className="py-24 bg-white overflow-hidden relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className={cn(
          "flex flex-col md:flex-row items-center gap-16",
          reverse && "md:flex-row-reverse"
        )}>
          <div className="flex-1">
            <span className={cn("text-sm font-bold uppercase tracking-widest mb-4 block", color)}>
              {subtitle}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{title}</h2>
            <p className="text-xl text-gray-500 leading-relaxed mb-8">
              {description}
            </p>
            <Link href="#features" className="flex items-center gap-2 font-bold hover:gap-3 transition-all">
              Learn more <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="flex-1 relative w-full flex justify-center">
            <div className={cn(
              "absolute inset-0 md:-inset-10 rounded-[60px] blur-3xl opacity-20",
              color.replace('text-', 'bg-')
            )} />
            <div className="iphone-frame w-full max-w-[320px]">
              <div className="absolute top-0 left-0 right-0 h-6 bg-black flex items-center justify-center">
                <div className="w-16 h-4 bg-gray-900 rounded-full" />
              </div>
              <div className="p-6 pt-12 h-full bg-gray-50 flex flex-col gap-4">
                <div className="w-full bg-white rounded-3xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gray-100 rounded-full" />
                    <div>
                      <div className="h-3 w-24 bg-gray-100 rounded mb-1" />
                      <div className="h-2 w-16 bg-gray-50 rounded" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="p-3 border border-gray-50 rounded-xl">
                        <div className="h-2 w-full bg-gray-100 rounded mb-2" />
                        <div className="h-2 w-2/3 bg-gray-50 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
