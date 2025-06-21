'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, X as CloseIcon, Copy as CopyIcon, Download as DownloadIcon, Twitter as TwitterIcon } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

const EMOJI_LIST = ['❤️', '🔥', '👍', '🎉', '🤯'];

interface PinCardProps {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    avatarUrl: string;
    twitterHandle?: string;
  };
  product?: {
    id: string;
    name: string;
    slug: string;
  };
  reactions: {
    emoji: string;
    count: number;
    hasReacted: boolean;
  }[];
  currentUserId?: string;
}

export function PinCard({
  id,
  content,
  createdAt,
  user,
  product,
  reactions,
  currentUserId
}: PinCardProps) {
  const [localReactions, setLocalReactions] = useState(reactions);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const supabase = createClient();

  // Add a random rotation for sticky note effect (memoized per card)
  const rotation = useMemo(() => (Math.random() * 4 - 2), []); // -2deg to +2deg

  // Pushpin SVG (inline, for top of card)
  const PushPin = (
    <svg width="32" height="32" viewBox="0 0 32 32" className="absolute -top-3 left-1/2 -translate-x-1/2 z-10" style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.2))' }}>
      <circle cx="16" cy="10" r="7" fill="#e74c3c" stroke="#b03a2e" strokeWidth="2" />
      <rect x="14.5" y="16" width="3" height="10" rx="1.5" fill="#b03a2e" />
    </svg>
  );

  const handleReaction = async (emoji: string) => {
    if (!currentUserId) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }

    // Find the emoji the user has currently reacted with (if any)
    const currentReaction = localReactions.find(r => r.hasReacted);
    const hasReactedToThis = currentReaction?.emoji === emoji;

    try {
      if (hasReactedToThis) {
        // Remove reaction
        await supabase
          .from('pin_reactions')
          .delete()
          .match({ pin_id: id, user_id: currentUserId });

        setLocalReactions(prev =>
          prev.map(r =>
            r.emoji === emoji
              ? { ...r, count: Math.max(0, r.count - 1), hasReacted: false }
              : r
          )
        );
      } else {
        // Remove previous reaction if it exists
        if (currentReaction) {
          await supabase
            .from('pin_reactions')
            .delete()
            .match({ pin_id: id, user_id: currentUserId });
        }
        // Add new reaction
        await supabase
          .from('pin_reactions')
          .insert({ pin_id: id, user_id: currentUserId, emoji });

        setLocalReactions(prev =>
          prev.map(r => {
            if (r.emoji === emoji) {
              return { ...r, count: r.count + 1, hasReacted: true };
            } else if (r.hasReacted) {
              return { ...r, count: Math.max(0, r.count - 1), hasReacted: false };
            } else {
              return r;
            }
          })
        );
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
  };

  const shortId = id.slice(0, 8);
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://founderswall.com'}/logs?pin=${shortId}`;
  const ogImageUrl = `/api/og/pin/${shortId}`;
  const tweetText = encodeURIComponent(
    `🚨 Logging Every step of my build journey. This one went up on #FoundersWall New build update on #founderswall by 🚀\n📌 ${content.slice(0, 80)}\n🔗 ${shareUrl}\n#buildinpublic #startuplife`
  );
  const tweetUrl = `https://x.com/intent/tweet?text=${tweetText}`;

  const handleShare = () => setShareOpen(true);
  const handleClose = () => setShareOpen(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = ogImageUrl;
    link.download = `founderswall-pin-${shortId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="relative flex flex-col items-center"
      style={{
        transform: `rotate(${rotation}deg)`
      }}
    >
      {PushPin}
      <div
        className="w-full max-w-xs min-h-[180px] bg-yellow-100 rounded-lg shadow-xl border border-yellow-300 px-5 pt-8 pb-4 flex flex-col justify-between sticky-note-font"
        style={{
          boxShadow: '0 4px 16px 0 rgba(0,0,0,0.10), 0 1.5px 0 0 #e2b203',
          borderRadius: '12px',
          border: '1.5px solid #e2b203',
          background: 'linear-gradient(135deg, #fffbe6 80%, #ffe066 100%)',
          position: 'relative',
        }}
      >
        {/* User avatar and username */}
        <div className="flex items-center gap-2 mb-2">
          <Image
            src={user.avatarUrl}
            alt={user.username}
            width={32}
            height={32}
            className="rounded-full border-2 border-yellow-300 shadow-sm bg-white"
          />
          <span className="font-bold text-gray-800 text-base sticky-note-font" style={{ fontFamily: 'inherit' }}>{user.username}</span>
        </div>
        <div className="flex-1 flex flex-col">
          <div
            className="mb-2 text-md font-semibold text-gray-900 leading-snug break-words whitespace-pre-line"
            style={{
              fontFamily: 'Inter, "Comic Sans MS", "Comic Sans", cursive',
              wordBreak: 'break-word',
              overflowWrap: 'anywhere',
            }}
          >
            {content}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-500 font-mono">{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
            {product && (
              <Link
                href={`/launch/${product.slug}`}
                className="ml-auto text-xs text-blue-700 hover:underline font-semibold"
              >
                {product.name}
              </Link>
            )}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 justify-center">
          {EMOJI_LIST.map(emoji => {
            const reaction = localReactions.find(r => r.emoji === emoji);
            const count = reaction?.count || 0;
            return (
              <Button
                key={emoji}
                variant={reaction?.hasReacted ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleReaction(emoji)}
                className={`gap-1 rounded-full px-2 py-1 text-lg ${reaction?.hasReacted ? 'bg-yellow-300 border-yellow-500' : 'bg-white border-yellow-200'}`}
                style={{ boxShadow: reaction?.hasReacted ? '0 2px 8px 0 rgba(255, 221, 51, 0.15)' : undefined }}
              >
                {emoji}
                {count > 0 && (
                  <span className="text-xs font-bold text-gray-700">{count}</span>
                )}
              </Button>
            );
          })}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="ml-auto"
            aria-label="Share this pin"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {/* Share Modal */}
      {shareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 max-w-xs sm:max-w-md w-full relative text-black flex flex-col items-center" style={{ minWidth: 0 }}>
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={handleClose}
              aria-label="Close share modal"
            >
              <CloseIcon className="h-6 w-6" />
            </button>
            <div className="mb-2 w-full flex flex-col items-center">
              <img
                src={ogImageUrl}
                alt="OG Card Preview"
                className="rounded-lg border border-gray-200 shadow-md w-full max-w-xs mb-2"
                style={{ background: '#fffbe6', maxWidth: '320px', width: '100%', height: 'auto' }}
                width={320}
                height={168}
              />
              <div className="flex gap-2 w-full justify-center mt-2">
                <Button
                  className="p-2 h-10 w-10 flex items-center justify-center"
                  onClick={handleDownload}
                  title="Download Image"
                  aria-label="Download Image"
                >
                  <DownloadIcon className="h-5 w-5" />
                </Button>
                <Button
                  asChild
                  className="p-2 h-10 w-10 flex items-center justify-center bg-[#1da1f2] hover:bg-[#1a8cd8] text-white"
                  title="Share to X (Twitter)"
                  aria-label="Share to X (Twitter)"
                >
                  <a
                    href={tweetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <TwitterIcon className="h-5 w-5" />
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="p-2 h-10 w-10 flex items-center justify-center"
                  onClick={handleCopy}
                  title="Copy Link"
                  aria-label="Copy Link"
                >
                  <CopyIcon className="h-5 w-5" />
                </Button>
              </div>
              <div className="text-xs text-gray-500 text-center mt-2">
                <span>Download the image above and upload it to your tweet.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add a sticky-note-font class to your global CSS or tailwind config for a friendly, handwritten look
