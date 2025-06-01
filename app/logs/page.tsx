'use client';

import { useState } from 'react';
import { PinWall } from '@/components/PinWall';
import { AddLogModal } from '@/components/AddLogModal';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { PublicHeader } from "@/components/public-header"
import PublicFooter from "@/components/public-footer"

export default function PinWallPage() {
  const [isAddLogModalOpen, setIsAddLogModalOpen] = useState(false);

  const handleLogPosted = () => {
    // This callback can be used to trigger a refresh in PinWall if needed,
    // though PinWall's realtime subscription should ideally handle updates.
    console.log('A new log has been posted, PinWall should update.');
  };

  return (
    <main className="min-h-screen flex flex-col bg-black text-white">
      <PublicHeader />
      <div className="container mx-auto py-24 px-4 flex-grow relative">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">The Founders' Log</h1>
          <p className="text-lg text-gray-300">Follow the real-time progress of indie makers building in public.</p>
        </div>
        
        <PinWall />

        {/* Floating Add Log Button - Stuck to device right edge */}
        <div
          className="fixed top-1/3 right-0 z-50 group"
          style={{ minWidth: 0 }}
        >
          <Button
            className={`
              flex items-center gap-2 shadow-lg bg-yellow-400 hover:bg-yellow-500 text-black
              rounded-full px-4 py-3 pr-6
              transition-all duration-300
              w-12 overflow-x-visible
              group-hover:w-44
              hover:w-44
              relative
              justify-start
              border border-gray-300
            `}
            style={{
              width: "48px",
              minWidth: "48px",
              maxWidth: "176px",
              paddingLeft: "8px",
              paddingRight: "8px",
              borderRadius: "8px",
              boxShadow: "0 4px 24px 0 rgba(0,0,0,0.15)",
              transition: "all 0.3s cubic-bezier(.4,0,.2,1)",
              // Stick out from the edge
              right: "-16px",
            }}
            onClick={() => setIsAddLogModalOpen(true)}
            aria-label="Add new log"
            onMouseEnter={e => {
              e.currentTarget.style.width = "176px";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.width = "48px";
            }}
          >
            <PlusCircle className="h-6 w-6 text-black" />
            <span
              className="ml-2 font-semibold whitespace-nowrap overflow-hidden transition-all duration-300"
              style={{
                opacity: 0.85,
                maxWidth: "120px",
                transition: "max-width 0.3s cubic-bezier(.4,0,.2,1), opacity 0.3s cubic-bezier(.4,0,.2,1)",
              }}
            >
              Add Your Log
            </span>
          </Button>
        </div>

        <AddLogModal 
          isOpen={isAddLogModalOpen} 
          onClose={() => setIsAddLogModalOpen(false)} 
          onLogPosted={handleLogPosted} 
        />
      </div>
      <PublicFooter />
    </main>
  );
} 