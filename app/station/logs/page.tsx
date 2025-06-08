'use client';
import Link from "next/link";
import { YourLogsWall } from "@/components/YourLogsWall";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { useState } from "react";
import { AddLogModal } from "@/components/AddLogModal";

export default function LogsPage() {
  const [isAddLogModalOpen, setIsAddLogModalOpen] = useState(false);
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex items-center gap-2">
        <Link href="/station" className="text-gray-400 hover:text-white flex items-center">
          <ArrowLeft className="w-5 h-5 mr-1" /> Back to Station
        </Link>
      </div>
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setIsAddLogModalOpen(true)}
          className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg font-semibold shadow transition"
        >
          <PlusCircle className="h-5 w-5" />
          Pin Your Chaos
        </button>
      </div>
      <h1 className="text-3xl font-bold text-white mb-6">Your Build Logs</h1>
      <YourLogsWall />
      <AddLogModal
        isOpen={isAddLogModalOpen}
        onClose={() => setIsAddLogModalOpen(false)}
      />
    </div>
  );
} 