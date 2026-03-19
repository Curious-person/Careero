import React from 'react';
import { Rocket } from 'lucide-react';
import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="py-20 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between gap-12 mb-20">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Rocket className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight">Pathly</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Empowering the next generation to build meaningful careers through verified skills and community.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
            <div>
              <h4 className="font-bold mb-6">Product</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li><Link href="#features" className="hover:text-black transition-colors">Features</Link></li>
                <li><Link href="#explore" className="hover:text-black transition-colors">Explore</Link></li>
                <li><Link href="#waitlist" className="hover:text-black transition-colors">Waitlist</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li><Link href="#about" className="hover:text-black transition-colors">About</Link></li>
                <li><Link href="#blog" className="hover:text-black transition-colors">Blog</Link></li>
                <li><Link href="#careers" className="hover:text-black transition-colors">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Legal</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li><Link href="#privacy" className="hover:text-black transition-colors">Privacy</Link></li>
                <li><Link href="#terms" className="hover:text-black transition-colors">Terms</Link></li>
                <li><Link href="#cookie" className="hover:text-black transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-8 border-t border-gray-50 text-xs text-gray-400 font-medium">
          <p>© {new Date().getFullYear()} Pathly Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-black transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-black transition-colors">Instagram</Link>
            <Link href="#" className="hover:text-black transition-colors">LinkedIn</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
