"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const BlogSection = () => {
  const posts = [
    { title: "How to land your first internship in 2026", category: "Career Advice", date: "Mar 15" },
    { title: "The rise of AI-driven career coaching", category: "Technology", date: "Mar 12" },
    { title: "Building a personal brand that stands out", category: "Marketing", date: "Mar 10" },
  ];

  return (
    <section id="blog" className="py-24 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-12">
          <h2 className="text-4xl font-bold">The latest from <br />Careero.</h2>
          <button className="text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
            View all posts <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -8 }}
              className="group cursor-pointer"
            >
              <div className="aspect-[4/3] bg-gray-100 rounded-[32px] mb-6 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://picsum.photos/seed/career${i}/800/600`}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">{post.category} • {post.date}</span>
              <h3 className="text-xl font-bold group-hover:text-brand-blue transition-colors">{post.title}</h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
