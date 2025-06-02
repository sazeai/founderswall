import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import type { Metadata, ResolvingMetadata } from 'next';
import { PinWall } from '@/components/PinWall';
import { PublicHeader } from '@/components/public-header';
import PublicFooter from '@/components/public-footer';

export async function generateMetadata(props: any, parent: ResolvingMetadata): Promise<Metadata> {
  const { params } = props;
  const supabase = await createClient();
  const pinId = params.id;

  // Try to fetch the pin by short or full id
  const { data: pin, error } = await supabase
    .from('pins')
    .select('id, content, created_at')
    .ilike('id', `${pinId}%`)
    .single();
  if (pin) {
    const shortId = pin.id.slice(0, 8);
    return {
      title: `New startup update on FoundersWall`,
      description: pin.content?.slice(0, 120) || 'See the latest build log on FoundersWall.',
      openGraph: {
        type: 'website',
        url: `https://founderswall.com/logs/pin/${shortId}`,
        title: `🚧 Build Update on FoundersWall`,
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
  // Fallback OG tags if not found
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
          url: 'https://founderswall.com/og-default.png',
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
      images: ['https://founderswall.com/og-default.png'],
    },
  };
}

export default async function PinPage(props: any) {
  const { params } = props;
  const supabase = await createClient();
  const pinId = params.id;
  const { data: pin, error } = await supabase
    .from('pins')
    .select('id, content, created_at')
    .ilike('id', `${pinId}%`)
    .single();

  if (!pin) {
    return (
      <main className="min-h-screen flex flex-col bg-black text-white">
        <PublicHeader />
        <div className="container mx-auto py-24 px-4 flex-grow relative">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-yellow-400 mb-2">Pin Not Found</h1>
            <p className="text-lg text-gray-300">Sorry, this log does not exist or has been removed.</p>
          </div>
        </div>
        <PublicFooter />
      </main>
    );
  }

  // Render the sticky note UI for the pin
  return (
    <main className="min-h-screen flex flex-col bg-black text-white">
      <PublicHeader />
      <div className="container mx-auto py-24 px-4 flex-grow relative">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">🚧 Build Update</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto whitespace-pre-line">{pin.content}</p>
        </div>
      </div>
      <PublicFooter />
    </main>
  );
} 