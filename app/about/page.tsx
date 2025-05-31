import type { Metadata } from "next"
import { PublicHeader } from "@/components/public-header"
import PublicFooter from "@/components/public-footer"
import Link from "next/link"
import Image from "next/image"

export const metadata: Metadata = {
  title: "About FoundersWall",
  description:
    "Learn about FoundersWall - the public log of legendary indie makers. Discover how we're building the ultimate directory of builders, creators, and innovators.",
  openGraph: {
    title: "About FoundersWall | The Public Log of Legendary Builders",
    description: "Learn about FoundersWall and our mission to celebrate indie makers and builders.",
    url: "https://founderswall.com/about",
  },
  alternates: {
    canonical: "https://founderswall.com/about",
  },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <PublicHeader />

      <main className="container mx-auto px-4 pb-12 pt-24 max-w-4xl">
        <div className="bg-gray-900 border-2 border-yellow-400 rounded-lg p-8 shadow-2xl">
          <header className="mb-8 text-center">
            <div className="flex justify-center mb-6">
              <Image
                src="/founderwall-logo.png"
                alt="FoundersWall Logo"
                width={400}
                height={100}
                className="max-w-full h-auto"
              />
            </div>
            <h1 className="text-4xl font-bold text-yellow-400 mb-4 [text-shadow:_2px_2px_4px_rgba(255,0,0,0.5)]">
              About FoundersWall
            </h1>
            <p className="text-xl text-gray-300 italic font-handwriting">
              Where legendary builders get tracked, logged, and celebrated
            </p>
          </header>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">Our Mission</h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                <span className="text-yellow-400">FoundersWall</span> started with a simple frustration, builders like
                us grind 24/7 but no one tracks us. No spotlight. No log. So I built it. A public wall where every indie
                maker especially the relentless ones finally gets seen. No investor pitch decks. No unicorn fantasy.
                Just raw build energy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">What We Do</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-800 p-6 rounded-lg border border-yellow-400/30">
                  <h3 className="text-xl font-bold text-yellow-400 mb-3">📸 Maker Profiles</h3>
                  <p className="text-gray-300">
                    Not just a profile. This is your mugshot. Your rap sheet of projects, your chaos log, your badge of
                    honor. All in our signature crime board style. If you've been building in silence, now your track
                    record gets a spotlight.
                  </p>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg border border-yellow-400/30">
                  <h3 className="text-xl font-bold text-yellow-400 mb-3">🚀 Product Launches</h3>
                  <p className="text-gray-300">
                    Drop your builds. Track your products from idea sparks to full-blown launches. Show people you're
                    not just tweeting ideas - you're actually shipping.
                  </p>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg border border-yellow-400/30">
                  <h3 className="text-xl font-bold text-yellow-400 mb-3">🤝 Maker Connections</h3>
                  <p className="text-gray-300">
                    Not a boring forum. We're building a real network of outlaws. Indie outlaws. DM, collab, hype each
                    other up — all inside the station. It's more gang than community.
                  </p>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg border border-yellow-400/30">
                  <h3 className="text-xl font-bold text-yellow-400 mb-3">⭐ Community Recognition</h3>
                  <p className="text-gray-300">
                    Upvote the real ones. Spot legends early. Celebrate those who don't wait for permission. Your vote
                    helps surface the next big bootstrapped story.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">Why the Crime Board Theme?</h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                Building indie products often feels like operating in the shadows - working late nights, breaking
                conventional rules, and hustling to make something from nothing. It's a tribute to all that madness.
                This crime board theme? Because building indie isn't clean or perfect - it's chaos, it's misfit energy.
                And that's what makes it legendary.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">Who We're For</h2>
              <div className="space-y-4 text-gray-300">
                <ul className="list-disc list-inside space-y-2 text-lg">
                  <li>
                    <strong>Solo Founders:</strong> You vs the world. We get it. We're that too.
                  </li>
                  <li>
                    <strong>Indie Hackers:</strong> Bootstrapping for freedom. Not playing VC games.
                  </li>
                  <li>
                    <strong>Side Project Builders:</strong> Juggling life, jobs, and late-night commits.
                  </li>
                  <li>
                    <strong>Serial Makers:</strong> Can't stop. Won't stop. New idea every damn week.
                  </li>
                  <li>
                    <strong>Supporters & Lurkers:</strong> You cheer, share, and vibe with the underdogs.
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">How It Works</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-yellow-400 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Get Arrested (Sign Up)</h3>
                    <p className="text-gray-300">Create your maker profile and join our wall of legendary builders.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-yellow-400 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Submit Your Launches</h3>
                    <p className="text-gray-300">
                      Showcase your products, share your story, and get community feedback.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-yellow-400 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Connect & Engage</h3>
                    <p className="text-gray-300">Clap for others. DM someone. Don't be boring. Build with the gang.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-yellow-400 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Get Recognized</h3>
                    <p className="text-gray-300">
                      The real ones will spot your work. This is how legends get remembered.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">Join the Movement</h2>
              <div className="bg-gray-800 p-6 rounded-lg border border-yellow-400/30 text-center">
                <p className="text-gray-300 text-lg mb-6">
                  Doesn't matter if you're launching your first toy or your 10th failed SaaS. If you're building, you
                  belong here. The Wall is yours. Claim your space.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/station/get-arrested"
                    className="bg-yellow-400 text-black px-8 py-3 rounded-lg font-bold hover:bg-yellow-300 transition-colors"
                  >
                    Get Arrested (Sign Up)
                  </Link>
                  <Link
                    href="/"
                    className="border-2 border-yellow-400 text-yellow-400 px-8 py-3 rounded-lg font-bold hover:bg-yellow-400 hover:text-black transition-colors"
                  >
                    Explore the Wall
                  </Link>
                </div>
              </div>
            </section>

            <section>
              <p className="text-gray-300 text-center text-lg">
                Got a question? Got drama? Want to collaborate? Ping the warden{" "}
                <a href="mailto:warden@founderswall.com" className="text-blue-400 underline hover:text-blue-300">
                  warden@founderswall.com
                </a>
                . Or just yell on{" "}
                <a
                  href="https://x.com/AINotSoSmart"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline hover:text-blue-300"
                >
                  X
                </a>
                . I'm around.
              </p>
            </section>
          </div>
          <div className="mt-16 text-center text-sm text-gray-400">
            <div className="inline-block bg-gray-900 border border-yellow-400 px-4 py-3 rounded-lg shadow-md shadow-yellow-400/10">
              <p className="text-gray-300">
                Built by&nbsp;
                <a
                  href="https://x.com/AINotSoSmart"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-400 hover:underline font-semibold"
                >
                  Harvansh
                </a>
                &nbsp;— builder of this weird little wall. If it breaks, that's on me. If it bangs, still me.
              </p>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
