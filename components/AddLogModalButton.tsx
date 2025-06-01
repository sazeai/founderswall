'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { AddLogModal } from '@/components/AddLogModal';

export default function AddLogModalButton() {
  const [isAddLogModalOpen, setIsAddLogModalOpen] = useState(false);
  return (
    <>
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
      <AddLogModal 
        isOpen={isAddLogModalOpen} 
        onClose={() => setIsAddLogModalOpen(false)} 
        onLogPosted={() => {}} 
      />
    </>
  );
} 