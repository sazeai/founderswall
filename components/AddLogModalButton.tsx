'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import { AddLogModal } from '@/components/AddLogModal';

export default function AddLogModalButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    setIsChecking(true);
    try {
      const response = await fetch('/api/user/mugshot-check');
      const data = await response.json();

      if (data.hasMugshot) {
        setIsModalOpen(true);
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
      <Button
        onClick={handleClick}
        disabled={isChecking}
        className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg font-semibold shadow transition"
        aria-label="Add new log"
      >
        {isChecking ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <PlusCircle className="h-5 w-5" />
        )}
        <span>{isChecking ? 'Checking...' : 'Pin Your Chaos'}</span>
      </Button>
      <AddLogModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onLogPosted={() => {
          // can add refresh logic here if needed
        }} 
      />
    </>
  );
}
