'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AddLogModal } from '@/components/AddLogModal';
import { PlusCircle, Loader2 } from 'lucide-react';

export function StationHeaderClient() {
  const [isAddLogModalOpen, setIsAddLogModalOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const router = useRouter();

  const handleLogPosted = () => {
    console.log('A new log has been posted from the dashboard.');
    // Potentially trigger a refresh of logs if they are displayed on this page
    // This might involve a router.refresh() or a more complex state update
  };

  const handleClick = async () => {
    setIsChecking(true);
    try {
      const response = await fetch('/api/user/mugshot-check');
      const data = await response.json();

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (data.hasMugshot) {
        setIsAddLogModalOpen(true);
      } else {
        router.push('/station/get-arrested');
      }
    } catch (error) {
      console.error("Error checking user's mugshot status", error);
      // Optionally handle this error, e.g. show a toast notification
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <>
      <Button onClick={handleClick} disabled={isChecking} className="flex items-center gap-2">
        {isChecking ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <PlusCircle className="h-5 w-5" />
        )}
        {isChecking ? 'Checking...' : 'Pin Your Chaos'}
      </Button>

      <AddLogModal 
        isOpen={isAddLogModalOpen} 
        onClose={() => setIsAddLogModalOpen(false)} 
        onLogPosted={handleLogPosted}
      />
    </>
  );
}
