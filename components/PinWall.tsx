'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { PinCard } from './PinCard';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';

interface PinUser {
  id: string;
  username: string;
  avatar_url: string;
}

interface PinProduct {
  id: string;
  name: string;
  slug: string;
}

interface PinReactionDetail {
  emoji: string;
  count: number;
  hasReacted: boolean;
}

interface Pin {
  id: string;
  content: string;
  created_at: string;
  user: PinUser;
  product?: PinProduct;
  reactions: PinReactionDetail[];
}

interface PinReaction {
  id: string;
  pin_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

interface RealtimePinInsert {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  product_id: string | null;
  visibility: 'public' | 'private';
}

interface RealtimePayload<T> {
  new: T;
  old?: T;
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  schema: string;
  table: string;
  commit_timestamp: string;
  errors: any[] | null;
}

export function PinWall() {
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [currentAuthUserId, setCurrentAuthUserId] = useState<string | undefined>();
  
  const supabase = createClient();

  const fetchPins = useCallback(async (pageNumber: number) => {
    setLoading(true);
    try {
      // 1. Fetch pins (no mugshots join)
      const { data: pinsData, error: pinsError } = await supabase
        .from('pins')
        .select('id, content, created_at, user_id, product_id')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .range((pageNumber - 1) * 20, pageNumber * 20 - 1);

      if (pinsError) throw pinsError;

      // 2. Fetch mugshots for all user_ids in those pins
      const userIds = (pinsData || []).map((p: any) => p.user_id);
      let mugshotsData: any[] = [];
      if (userIds.length > 0) {
        const { data: mData, error: mugshotsError } = await supabase
          .from('mugshots')
          .select('user_id, name, image_url')
          .in('user_id', userIds);
        if (mugshotsError) throw mugshotsError;
        mugshotsData = mData || [];
      }
      const mugshotMap = new Map(mugshotsData.map((m: any) => [m.user_id, m]));

      // 3. Fetch product info for all product_ids in those pins
      const productIds = (pinsData || []).map((p: any) => p.product_id).filter(Boolean);
      let productsData: any[] = [];
      if (productIds.length > 0) {
        const { data: pData, error: productsError } = await supabase
          .from('products')
          .select('id, title, slug')
          .in('id', productIds);
        if (productsError) throw productsError;
        productsData = pData || [];
      }
      const productMap = new Map(productsData.map((p: any) => [p.id, p]));

      // 4. Fetch reactions for these pins
      const pinIds = (pinsData || []).map((p: any) => p.id);
      let reactionsData: PinReaction[] = [];
      if (pinIds.length > 0) {
        const { data: rData, error: reactionsError } = await supabase
          .from('pin_reactions')
          .select('*')
          .in('pin_id', pinIds);
        if (reactionsError) throw reactionsError;
        reactionsData = rData || [];
      }

      // 5. Get current user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const authUserId = authUser?.id;
      setCurrentAuthUserId(authUserId);

      // 6. Merge mugshot and product data into pins
      const processedPins = (pinsData || []).map((pin: any) => {
        const mugshot = mugshotMap.get(pin.user_id);
        const product = pin.product_id ? productMap.get(pin.product_id) : undefined;
        const pinReactions = reactionsData.filter((r: PinReaction) => r.pin_id === pin.id);
        const reactions = ['❤️', '🔥', '👍', '🎉', '🚀', '🙌'].map(emoji => ({
          emoji,
          count: pinReactions.filter((r: PinReaction) => r.emoji === emoji).length,
          hasReacted: pinReactions.some(
            (r: PinReaction) => r.emoji === emoji && r.user_id === authUserId
          )
        }));
        return {
          id: pin.id,
          content: pin.content,
          created_at: pin.created_at,
          user: {
            id: pin.user_id,
            username: mugshot?.name || 'Anonymous',
            avatar_url: mugshot?.image_url || '/images/indie-hackers/default-avatar.png'
          },
          product: product ? {
            id: product.id,
            name: product.title,
            slug: product.slug
          } : undefined,
          reactions
        } as Pin;
      });
      
      if (pageNumber === 1) {
        setPins(processedPins);
      } else {
        setPins(prevPins => [...prevPins, ...processedPins]);
      }

      setHasMore(processedPins.length === 20);
    } catch (error: any) {
      console.error('Error fetching pins:', error);
      if (error.message) console.error('Error message:', error.message);
      if (error.details) console.error('Error details:', error.details);
      if (error.hint) console.error('Error hint:', error.hint);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchPins(1);

    const pinsChannel = supabase
      .channel('public-pins-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pins'
        },
        async (payload: any) => {
          const newPinRaw = payload.new as RealtimePinInsert;
          
          if (!newPinRaw || newPinRaw.visibility !== 'public') return;

          let userForNewPin: PinUser = {
            id: newPinRaw.user_id,
            username: 'Loading...',
            avatar_url: '/images/indie-hackers/default-avatar.png'
          };

          const { data: mugshotData, error: mugshotError } = await supabase
            .from('mugshots')
            .select('name, image_url')
            .eq('user_id', newPinRaw.user_id)
            .single();

          if (mugshotData) {
            userForNewPin.username = mugshotData.name || 'Anonymous';
            userForNewPin.avatar_url = mugshotData.image_url || '/images/indie-hackers/default-avatar.png';
          } else if (mugshotError) {
            console.error('Error fetching mugshot for new pin:', mugshotError);
          }
          
          let productForNewPin: PinProduct | undefined = undefined;
          if (newPinRaw.product_id) {
            const {data: productData, error: productError} = await supabase
              .from('products')
              .select('id, title, slug')
              .eq('id', newPinRaw.product_id)
              .single();
            if(productData){
              productForNewPin = { id: productData.id, name: productData.title, slug: productData.slug };
            } else if (productError) {
              console.error('Error fetching product for new pin:', productError);
            }
          }

          const newPinProcessed: Pin = {
            id: newPinRaw.id,
            content: newPinRaw.content,
            created_at: newPinRaw.created_at,
            user: userForNewPin,
            product: productForNewPin,
            reactions: ['❤️', '🔥', '👍', '🎉', '🚀', '🙌'].map(emoji => ({
              emoji,
              count: 0,
              hasReacted: false
            }))
          };
          setPins(prevPins => [newPinProcessed, ...prevPins]);
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to pins channel!');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('Failed to subscribe to pins channel:', err);
        }
      });

    return () => {
      supabase.removeChannel(pinsChannel);
    };
  }, [supabase, fetchPins]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPins(nextPage);
  };

  if (loading && pins.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!loading && pins.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-gray-500">No logs found. Be the first to add one!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pins.map(pin => (
          <PinCard
            key={pin.id}
            id={pin.id}
            content={pin.content}
            createdAt={pin.created_at}
            user={{
              id: pin.user.id,
              username: pin.user.username,
              avatarUrl: pin.user.avatar_url
            }}
            product={
              pin.product
                ? {
                    id: pin.product.id,
                    name: pin.product.name,
                    slug: pin.product.slug
                  }
                : undefined
            }
            reactions={pin.reactions}
            currentUserId={currentAuthUserId}
          />
        ))}
      </div>
      {hasMore && (
        <div className="flex justify-center mt-8">
          <Button onClick={loadMore} variant="outline" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Load More Logs
          </Button>
        </div>
      )}
    </div>
  );
} 