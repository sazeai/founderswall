import { createClient } from '@/utils/supabase/server';
import type { Metadata, ResolvingMetadata } from 'next';
import { PinWall } from '@/components/PinWall';
import AddLogModalButton from '@/components/AddLogModalButton';
import { PublicHeader } from "@/components/public-header"
import PublicFooter from "@/components/public-footer"

export async function generateMetadata(
  { searchParams }: { searchParams: any },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await searchParams;
  const supabase = await createClient();
  const pinId = params.pin;

  if (pinId) {
    // Try to fetch the pin by short or full id
    const { data: pin, error } = await supabase
      .from('pins')
      .select('id, content, created_at')
      .ilike('id', `${pinId}%`)
      .single();
    if (pin) {
      const shortId = pin.id.slice(0, 8);
      return {
        title: `Shipping My MVP in Public - Build Log`,
        description: pin.content?.slice(0, 120) || 'See the latest build log on FoundersWall.',
        openGraph: {
          type: 'website',
          url: `https://founderswall.com/logs?pin=${shortId}`,
          title: `🚧 Build Update on FoundersWall` ,
          description: pin.content?.slice(0, 120) || 'See the latest build log on FoundersWall.',
          images: [
            {
              url: `https://founderswall.com/api/og/pin/${shortId}`,
              width: 1200,
              height: 630,
              alt: 'FoundersWall Pin Card',
            },
          ],
        },
        twitter: {
          card: 'summary_large_image',
          title: `🚧 Build Update on FoundersWall`,
          description: pin.content?.slice(0, 120) || 'See the latest build log and product journey.',
          images: [`https://founderswall.com/api/og/pin/${shortId}`],
        },
      };
    }
  }
  // Default OG tags for the wall
  return {
    title: "The Founders' Log | FoundersWall",
    description: 'Follow the real-time progress of indie makers building in public.',
    openGraph: {
      type: 'website',
      url: 'https://founderswall.com/logs',
      title: "The Founders' Log | FoundersWall",
      description: 'Follow the real-time progress of indie makers building in public.',
      images: [
        {
          url: 'https://founderswall.com/screenshot.png',
          width: 1200,
          height: 630,
          alt: 'FoundersWall',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: "The Founders' Log | FoundersWall",
      description: 'Follow the real-time progress of indie makers building in public.',
      images: ['https://founderswall.com/screenshot.png'],
    },
  };
}

export default function PinWallPage() {
  // This is a server component. All interactive logic is in subcomponents.
  return (
    <main className="min-h-screen flex flex-col bg-black text-white">
      <PublicHeader />
      <div className="container mx-auto py-24 px-4 flex-grow relative">

      {/* Header */}
      <section className="pt-24 px-6 pb-4 text-center">
        <h1
          className="text-white text-3xl sm:text-5xl font-bold tracking-wider mb-4 glitch-text"
          data-text="THE HEIST BOARD"
        >
          THE BUILD LOGS
        </h1>
        <h2 className="text-white text-2xl sm:text-4xl font-bold tracking-wider mb-4" data-text="Alt Text">
          FOLLOW THE REAL-TIME PROGRESS OF INDIE MAKERS BUILDING IN PUBLIC.
        </h2>
        <p className="text-gray-200 max-w-2xl mx-auto font-semibold">
          Every commit, drop, and meltdown logged in public.
        </p>
      </section>

      {/* Yellow Caution Stripe with Crime Scene Text */}
      <div className="h-8 w-full bg-yellow-400 relative overflow-hidden my-6">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, #000 0, #000 10px, #f6e05e 10px, #f6e05e 20px)",
            backgroundSize: "28px 28px",
          }}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-black text-xs font-bold tracking-wider uppercase">Crime Scene - Do Not Cross</span>
        </div>
      </div>
      
        <PinWall />
        {/* Floating Add Log Button - Stuck to device right edge */}
        <div
          className="fixed top-1/3 right-0 z-50 group"
          style={{ minWidth: 0 }}
        >
          <AddLogModalButton />
        </div>
      </div>
      <PublicFooter />
    </main>
  );
}
