"use client"

import Link from "next/link"

export default function PublicFooter() {
  return (
    <footer className="py-6 bg-black text-white border-t-4 border-yellow-400 relative">
  
    
      
      {/* Smudge overlay on hover */}
      <div className="absolute inset-0 pointer-events-none smudge-overlay group-hover:smudge-overlay"></div>

      <div className="container relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Logo and tagline */}
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-yellow-400 [text-shadow:_2px_2px_4px_rgba(255,0,0,0.5)] transform -rotate-1">
                FOUNDERS WALL
              </span>
            </div>
            <p className="text-sm text-gray-300 mt-1 italic font-handwriting">
              For indie makers running from the law, building in the shadows
            </p>
          </div>
          
          {/* Navigation links styled as evidence tags */}
          <nav className="flex gap-6 group">
            <Link
              href="/privacy"
              className="evidence-link text-gray-300 hover:text-red-500 text-sm font-bold uppercase px-3 py-1 bg-gradient-to-r from-gray-900 to-gray-800 rounded-sm shadow-[2px_2px_4px_rgba(0,0,0,0.5)]"
              aria-label="Privacy Policy"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="evidence-link text-gray-300 hover:text-red-500 text-sm font-bold uppercase px-3 py-1 bg-gradient-to-r from-gray-900 to-gray-800 rounded-sm shadow-[2px_2px_4px_rgba(0,0,0,0.5)]"
              aria-label="Terms of Service"
            >
              Terms
            </Link>
            <Link
              href="/about"
              className="evidence-link text-gray-300 hover:text-red-500 text-sm font-bold uppercase px-3 py-1 bg-gradient-to-r from-gray-900 to-gray-800 rounded-sm shadow-[2px_2px_4px_rgba(0,0,0,0.5)]"
              aria-label="Contact Us"
            >
              About
            </Link>
          </nav>
        </div>
        
        {/* Copyright */}
        <div className="mt-4 text-center text-xs text-gray-400">
          <p className="font-handwriting">
            © {new Date().getFullYear()} Founders Wall. All rights swiped.
          </p>
          <p className="mt-1 text-sm font-bold text-red-500 [text-shadow:_1px_1px_2px_rgba(0,0,0,0.8)]">
            Crafted in the underground by Indie Maker 🚨
          </p>
        </div>
      </div>
    </footer>
  )
}
