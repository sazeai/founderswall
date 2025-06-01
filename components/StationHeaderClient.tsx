'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AddLogModal } from '@/components/AddLogModal';
import { PlusCircle } from 'lucide-react';

interface StationHeaderClientProps {
  // You can pass any non-serializable props here if needed in the future
  // For now, it doesn't need any specific props from the server component
}

export function StationHeaderClient({}: StationHeaderClientProps) {
  const [isAddLogModalOpen, setIsAddLogModalOpen] = useState(false);

  const handleLogPosted = () => {
    console.log('A new log has been posted from the dashboard.');
    // Potentially trigger a refresh of logs if they are displayed on this page
    // This might involve a router.refresh() or a more complex state update
  };

  return (
    <>
      <Button onClick={() => setIsAddLogModalOpen(true)} className="flex items-center gap-2">
        <PlusCircle className="h-5 w-5" />
        Add New Log
      </Button>

      <AddLogModal 
        isOpen={isAddLogModalOpen} 
        onClose={() => setIsAddLogModalOpen(false)} 
        onLogPosted={handleLogPosted}
      />
    </>
  );
} 