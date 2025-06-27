// @ts-nocheck
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { NextURL } from 'next/dist/server/web/next-url';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  
  const url = new NextURL(req.url);
  const pathSegments = url.pathname.split('/');
  const pinId = pathSegments[pathSegments.length - 1];

  if (!pinId || pinId === '[id]') { 
    return new Response('Invalid Pin ID format', { status: 400 });
  }

  // 1. Fetch the pin using the RPC function
  const { data: pinData, error: pinError } = await supabase
    .rpc('get_pin_by_prefix', { id_prefix: pinId })
    .maybeSingle();

  if (pinError) {
    return new Response(`Supabase RPC error: ${pinError.message}`, { status: 500 });
  }
  if (!pinData) {
    return new Response('Pin not found', { status: 404 });
  }

  const userIdFromPin = pinData.user_id;

  // 2. Fetch the mugshot/profile using the user_id from the pin
  let mugshotProfile = null;
  if (userIdFromPin) {
    const { data: mugshotData, error: mugshotError } = await supabase
      .from('mugshots')
      .select('name, mugshot_url, twitter_handle') 
      .eq('user_id', userIdFromPin) 
      .single();

    if (mugshotData) {
      mugshotProfile = mugshotData;
    }
  }

  const username = mugshotProfile?.name || 'Unknown'; 
  const twitter = mugshotProfile?.twitter_handle ? `${mugshotProfile.twitter_handle}` : '';
  const avatar = mugshotProfile?.mugshot_url || `${req.nextUrl.origin}/images/indie-hackers/ava-ai.png`;
  const logoUrl = `${req.nextUrl.origin}/founderwall-logo.png`;

  // Pushpin SVG (inline)
  const PushPin = (
    <svg width="64" height="64" viewBox="0 0 32 32" style={{ position: 'absolute', top: -32, left: '50%', transform: 'translateX(-50%)', zIndex: 10, filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.2))' }}>
      <circle cx="16" cy="10" r="7" fill="#e74c3c" stroke="#b03a2e" strokeWidth="2" />
      <rect x="14.5" y="16" width="3" height="10" rx="1.5" fill="#b03a2e" />
    </svg>
  );

  // Floating sticky notes with dopamine text
  const floatingNotes = [
    { x: 80, y: 90, rot: -8, color: '#fffbe6', pin: true, text: '#BuildInPublic' },
    { x: 1000, y: 120, rot: 6, color: '#fffbe6', pin: false, text: 'Shipped 🚀' },
    { x: 200, y: 500, rot: 4, color: '#fffbe6', pin: true, text: 'Indie Win!' },
    { x: 950, y: 500, rot: -5, color: '#fffbe6', pin: false, text: 'Maker Streak' },
  ];
  
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
            background: `#18181b url(${req.nextUrl.origin}/paper-texture.png) center/cover no-repeat`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Floating sticky notes with dopamine text */}
          {floatingNotes.map((note, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: note.x,
                top: note.y,
                width: 140,
                height: 120,
                background: note.color,
                borderRadius: 16,
                border: '2px solid #e2b203',
                boxShadow: '0 4px 16px 0 rgba(0,0,0,0.10)',
                transform: `rotate(${note.rot}deg)`,
                zIndex: 2,
                opacity: 0.72,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                fontFamily: 'Comic Sans MS, Comic Sans, Inter, cursive',
                fontWeight: 700,
                fontSize: 22,
                color: '#b68900',
                padding: '18px 10px 10px 10px',
                textAlign: 'center',
                letterSpacing: 0.5,
              }}
            >
              {note.pin && (
                <svg width="24" height="24" viewBox="0 0 32 32" style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', zIndex: 3 }}>
                  <circle cx="16" cy="10" r="7" fill="#e74c3c" stroke="#b03a2e" strokeWidth="2" />
                  <rect x="14.5" y="16" width="3" height="10" rx="1.5" fill="#b03a2e" />
                </svg>
              )}
              <span style={{ position: 'relative', zIndex: 4 }}>{note.text}</span>
            </div>
          ))}
  
          {/* Main sticky note card */}
          <div
            style={{
              position: 'relative',
              width: 800,
              minHeight: 400,
              background: 'linear-gradient(135deg, #fffbe6 80%, #ffe066 100%)',
              borderRadius: 24,
              border: '3px solid #e2b203',
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              padding: '32px 40px 28px 40px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              fontFamily: 'Inter, Comic Sans MS, Comic Sans, cursive',
              color: '#18181b',
              overflow: 'visible',
              zIndex: 10,
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
            <div style={{ fontSize: 28, fontWeight: 700, color: '#cc5f24', marginBottom: 4, letterSpacing: 1 }}>
              🚧 Build Update
            </div>
            {/* FoundersWall text logo in bottom right */}
            <div
              style={{
                position: 'absolute',
                bottom: 18,
                right: 32,
                fontFamily: 'Pacifico, Comic Sans MS, Comic Sans, cursive',
                fontSize: 30,
                color: '#e2b203',
                textShadow: '0 2px 8px #fffbe6, 0 1px 0 #fff',
                opacity: 0.96,
                letterSpacing: 1.5,
                fontWeight: 700,
                zIndex: 30,
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              FoundersWall
            </div>
          </div>
          {/* Footer tagline */}
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
              opacity: 0.92,
              fontFamily: 'Inter, sans-serif',
              zIndex: 20,
              textShadow: '0 2px 8px #18181b',
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Every log is a milestone. Share yours!
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
    return imageResponse;
  } catch (e) {
    return new Response(`Error generating image: ${e.message}`, { status: 500 });
  }
}
