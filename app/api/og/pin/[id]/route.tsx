// @ts-nocheck
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { NextURL } from 'next/dist/server/web/next-url';

export async function GET(req: NextRequest) {
  console.log('[OG Image Route] Received request:', req.url);
  const supabase = await createClient();
  
  const url = new NextURL(req.url);
  const pathSegments = url.pathname.split('/');
  const pinId = pathSegments[pathSegments.length - 1];
  console.log('[OG Image Route] Extracted pinId for RPC:', pinId);

  if (!pinId || pinId === '[id]') { 
    console.error('[OG Image Route] Invalid pinId extracted:', pinId);
    return new Response('Invalid Pin ID format', { status: 400 });
  }

  // 1. Fetch the pin using the RPC function
  console.log(`[OG Image Route] Calling RPC get_pin_by_prefix with id_prefix: ${pinId}`);
  const { data: pinData, error: pinError } = await supabase
    .rpc('get_pin_by_prefix', { id_prefix: pinId })
    .maybeSingle(); // Use maybeSingle() as RPC might return 0 or 1 row based on LIMIT 1 in function

  if (pinError) {
    console.error('[OG Image Route] Supabase RPC error fetching pin:', pinError);
    return new Response(`Supabase RPC error: ${pinError.message}`, { status: 500 });
  }
  if (!pinData) {
    console.warn('[OG Image Route] Pin not found via RPC for id_prefix:', pinId);
    return new Response('Pin not found', { status: 404 });
  }

  console.log('[OG Image Route] Pin data fetched successfully via RPC:', pinData);
  const userIdFromPin = pinData.user_id;

  if (!userIdFromPin) {
     console.warn('[OG Image Route] No user_id found on pin:', pinData.id, '- will use default user info.');
  }

  // 2. Fetch the mugshot/profile using the user_id from the pin
  let mugshotProfile = null;
  if (userIdFromPin) {
    console.log(`[OG Image Route] Querying Supabase for mugshot data, user_id: ${userIdFromPin}`);
    const { data: mugshotData, error: mugshotError } = await supabase
      .from('mugshots')
      .select('name, mugshot_url, twitter_handle') 
      .eq('user_id', userIdFromPin) 
      .single();

    if (mugshotError) {
      console.error('[OG Image Route] Supabase error fetching mugshot for user_id:', userIdFromPin, mugshotError);
    }
    if (mugshotData) {
      console.log('[OG Image Route] Mugshot data fetched successfully:', mugshotData);
      mugshotProfile = mugshotData;
    } else {
      console.warn('[OG Image Route] Mugshot not found for user_id:', userIdFromPin);
    }
  }

  const username = mugshotProfile?.name || 'Unknown'; 
  const twitter = mugshotProfile?.twitter_handle ? `@${mugshotProfile.twitter_handle}` : '';
  const avatar = mugshotProfile?.mugshot_url || `${req.nextUrl.origin}/images/indie-hackers/ava-ai.png`;

  // Pushpin SVG (inline)
  const PushPin = (
    <svg width="64" height="64" viewBox="0 0 32 32" style={{ position: 'absolute', top: -32, left: '50%', transform: 'translateX(-50%)', zIndex: 10, filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.2))' }}>
      <circle cx="16" cy="10" r="7" fill="#e74c3c" stroke="#b03a2e" strokeWidth="2" />
      <rect x="14.5" y="16" width="3" height="10" rx="1.5" fill="#b03a2e" />
    </svg>
  );

  try {
    const imageResponse = new ImageResponse(
      (
        <div
          style={{
            width: 1200,
            height: 630,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: '#18181b', // Outer background for contrast
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: 800,
              minHeight: 400,
              background: 'linear-gradient(135deg, #fffbe6 80%, #ffe066 100%)',
              borderRadius: 24,
              border: '3px solid #e2b203',
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              padding: '56px 64px 40px 64px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              fontFamily: 'Inter, Comic Sans MS, Comic Sans, cursive',
              color: '#18181b',
              overflow: 'visible',
            }}
          >
            {PushPin}
            {/* User avatar and username */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 24, marginTop: 16 }}>
              <img
                src={avatar}
                width={64}
                height={64}
                style={{ borderRadius: 32, border: '3px solid #e2b203', background: '#fff', boxShadow: '0 2px 8px rgba(255, 221, 51, 0.15)' }}
              />
              <span style={{ fontWeight: 700, fontSize: 32, color: '#18181b', fontFamily: 'inherit' }}>{username}</span>
              {twitter ? <span style={{ color: '#1da1f2', fontWeight: 400, fontSize: 24, marginLeft: 8 }}>{twitter}</span> : null}
            </div>
            {/* Content */}
            <div style={{ fontSize: 36, fontWeight: 600, lineHeight: 1.3, marginBottom: 24, textAlign: 'center', maxWidth: 600, fontFamily: 'inherit' }}>
              {pinData.content?.slice(0, 180) || ''}
            </div>
            {/* Build Update label */}
            <div style={{ fontSize: 28, fontWeight: 700, color: '#b68900', marginBottom: 8, letterSpacing: 1 }}>
              🚧 Build Update
            </div>
          </div>
          {/* Footer */}
          <div
            style={{
              position: 'absolute',
              bottom: 40,
              left: 0,
              width: '100%',
              textAlign: 'center',
              fontSize: 28,
              color: '#fff',
              letterSpacing: 1,
              fontWeight: 600,
              opacity: 0.85,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            founderswall.com · View full log & share your own
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
    console.log('[OG Image Route] ImageResponse generated successfully.');
    return imageResponse;
  } catch (e) {
    console.error('[OG Image Route] Error generating ImageResponse:', e);
    return new Response(`Error generating image: ${e.message}`, { status: 500 });
  }
} 