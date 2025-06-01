"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "./ui/button";
import { Loader2, Edit, Trash2, Save, X } from "lucide-react";

interface Pin {
  id: string;
  content: string;
  created_at: string;
}

export function YourLogsWall() {
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchUserPins = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setPins([]);
        setLoading(false);
        return;
      }
      const { data: pinsData, error: pinsError } = await supabase
        .from("pins")
        .select("id, content, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (pinsError) throw pinsError;
      setPins(pinsData || []);
      setLoading(false);
    };
    fetchUserPins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEdit = (pin: Pin) => {
    setEditingId(pin.id);
    setEditContent(pin.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const saveEdit = async (pin: Pin) => {
    if (editContent.trim() === "") return;
    const { error } = await supabase
      .from("pins")
      .update({ content: editContent })
      .eq("id", pin.id);
    if (!error) {
      setPins((prev) => prev.map((p) => (p.id === pin.id ? { ...p, content: editContent } : p)));
      setEditingId(null);
      setEditContent("");
    } else {
      alert("Failed to update log.");
    }
  };

  const confirmDelete = (pin: Pin) => {
    setDeletingId(pin.id);
  };

  const cancelDelete = () => {
    setDeletingId(null);
  };

  const deletePin = async (pin: Pin) => {
    const { error } = await supabase
      .from("pins")
      .delete()
      .eq("id", pin.id);
    if (!error) {
      setPins((prev) => prev.filter((p) => p.id !== pin.id));
      setDeletingId(null);
    } else {
      alert("Failed to delete log.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[120px]">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }
  if (!loading && pins.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-400">You haven't posted any logs yet.</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pins.map((pin) => (
          <div key={pin.id} className="relative group border border-gray-700 rounded-lg p-4 bg-gray-800/60">
            {editingId === pin.id ? (
              <div>
                <textarea
                  className="w-full bg-gray-900 text-white rounded p-2 border border-gray-700 mb-2"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => saveEdit(pin)}>
                    <Save className="w-4 h-4 mr-1" /> Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={cancelEdit}>
                    <X className="w-4 h-4 mr-1" /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-2 text-gray-200 whitespace-pre-line">{pin.content}</div>
                <div className="text-xs text-gray-500 mb-2">{new Date(pin.created_at).toLocaleString()}</div>
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="ghost" title="Edit" onClick={() => startEdit(pin)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" title="Delete" onClick={() => confirmDelete(pin)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
            {deletingId === pin.id && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 rounded-lg">
                <p className="mb-4 text-red-400">Are you sure you want to delete this log?</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="destructive" onClick={() => deletePin(pin)}>
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </Button>
                  <Button size="sm" variant="ghost" onClick={cancelDelete}>
                    <X className="w-4 h-4 mr-1" /> Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 