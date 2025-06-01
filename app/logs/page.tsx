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

        <Button 
          className="fixed top-20 right-8 z-50 flex items-center gap-2 shadow-lg bg-red-600 hover:bg-red-700 text-white"
          onClick={() => setIsAddLogModalOpen(true)}
          aria-label="Add new log"
        >
          <PlusCircle className="h-5 w-5" />
          Add Your Log
        </Button>

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