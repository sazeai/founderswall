"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

const RevampedHero = () => {
  const [currentQuote, setCurrentQuote] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [glitchText, setGlitchText] = useState("BUILD")

  const hackerQuotes = [
    "Ship early, ship often. Perfection is the enemy of progress.",
    "Build in public. Learn in public. Fail in public. Succeed in public.",
    "The best time to launch was yesterday. The second best time is today.",
    "Your first version should embarrass you, or you waited too long to ship.",
    "Revenue is the ultimate validation.",
    "Move fast and break things, then fix them faster.",
  ]

  const floatingCodeSnippets = [
    'console.log("shipping...");',
    "git push origin main",
    "if (idea) { ship(); }",
    "const success = hustle * time;",
    "rm -rf imposter-syndrome",
    'git commit -m "fix everything"',
    "npm install motivation",
    "const caffeine = Math.max();",
    "async function getSuccess() {}",
    "boolean burnout = false;",
    "if(!working) { panic(); }",
    "git clone dreams",
    "npm start hustle",
    "while(building) { learn(); }",
    "git add . && git commit",
    "sudo make me a founder",
    'import { success } from "failure";',
  ]

  const chaosTexts = [
    "HUSTLE MODE ON",
    "404: SOCIAL LIFE NOT FOUND",
    "BREAK THINGS FAST",
    "VALIDATE OR DIE",
    "USER FEEDBACK = GOLD",
    "ITERATE ITERATE ITERATE",
    "FAIL FASTER",
    "SHIP OR SINK",
    "CODE NEVER LIES",
    "BUGS ARE FEATURES",
    "SCALE LATER",
    "BUILD IN PUBLIC",
    "SOLVE REAL PROBLEMS",
    "USERS OVER FEATURES",
    "SPEED OVER PERFECTION",
    "GROWTH HACKING",
    "LEAN STARTUP",
  ]

  const founderQuotes = [
    "Shipped at 3AM again 🚀",
    "Coffee > Sleep",
    "Just hit $1K MRR!",
    "Failed fast, learned faster",
    "Bug = Feature?",
    "Launch today!",
    "Feedback loop ∞",
    "Caffeine-driven development",
    "Move fast, break things",
    "Ideas are cheap, execution is everything",
  ]

  const chaosWords = ["BUILD", "B|_|1LD", "BU1LD", "BUILD", "B∪ILD"]

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => setCurrentQuote((prev) => (prev + 1) % hackerQuotes.length), 4000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    let idx = 0
    const glitchInterval = setInterval(() => {
      setGlitchText(chaosWords[idx % chaosWords.length])
      idx++
    }, 200)

    const stopInitial = setTimeout(() => {
      clearInterval(glitchInterval)
      setGlitchText("BUILD")
    }, 2000)

    return () => {
      clearInterval(glitchInterval)
      clearTimeout(stopInitial)
    }
  }, [])

  return (
    <div className="bg-black py-24 sm:pt-24 pb-12 relative overflow-hidden">
      {/* BACKGROUND LAYERS */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-800" />

        {/* Prison bars effect */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.1) 40px, rgba(255,255,255,0.1) 45px)",
            }}
          />
        </div>

        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* FLOATING CODE SNIPPETS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {floatingCodeSnippets.map((s, i) => (
          <span
            key={i}
            className="absolute text-green-400/30 font-mono text-xs md:text-sm"
            style={{
              top: `${5 + ((i * 7) % 85)}%`,
              left: `${5 + ((i * 11) % 85)}%`,
              transform: `rotate(${(i % 2 === 0 ? -1 : 1) * (5 + (i % 15))}deg)`,
            }}
          >
            {s}
          </span>
        ))}
      </div>

      {/* CHAOS TEXT */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {chaosTexts.map((t, i) => (
          <span
            key={i}
            className="absolute font-mono font-black opacity-15 select-none"
            style={{
              top: `${10 + ((i * 13) % 75)}%`,
              left: `${5 + ((i * 17) % 85)}%`,
              fontSize: `${10 + (i % 4) * 2}px`,
              color: i % 4 === 0 ? "#ef4444" : i % 4 === 1 ? "#10b981" : i % 4 === 2 ? "#f59e0b" : "#8b5cf6",
              transform: `rotate(${(i % 2 === 0 ? -1 : 1) * (5 + (i % 20))}deg)`,
            }}
          >
            {t}
          </span>
        ))}
      </div>

      {/* CAUGHT SHIPPING MASCOT - positioned strategically */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
        <div className="absolute top-16 right-8 md:top-20 md:right-16 transform rotate-12 hover:rotate-6 transition-transform duration-500">
          <img
            src="/caught-shipping.webp"
            alt="Caught Shipping Mascot"
            className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 drop-shadow-2xl"
          />
        </div>

        {/* Additional smaller mascots scattered around */}
        <div className="hidden lg:block absolute bottom-32 left-16 transform -rotate-12 opacity-60">
          <img src="/caught-shipping.webp" alt="Caught Shipping Mascot" className="w-20 h-20 drop-shadow-xl" />
        </div>

        <div className="hidden md:block absolute top-1/3 left-8 transform rotate-45 opacity-40">
          <img src="/caught-shipping.webp" alt="Caught Shipping Mascot" className="w-16 h-16 drop-shadow-lg" />
        </div>
      </div>

      {/* STICKY NOTES */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
        {founderQuotes.map((q, i) => {
          const hideOnMobile = [
            "Just hit $1K MRR!",
            "Launch today!",
            "Move fast, break things",
            "Feedback loop ∞",
            "Ideas are cheap, execution is everything",
            "Caffeine-driven development",
          ].includes(q)

          return (
            <div
              key={i}
              className={`absolute bg-yellow-300/90 p-2 text-black text-xs font-bold max-w-28 shadow-lg ${
                hideOnMobile ? "hidden md:block" : ""
              }`}
              style={{
                top: `${[12, 68, 22, 78, 43, 88, 33, 58, 3, 93, 25, 75][i] || 5 + ((i * 23) % 80)}%`,
                left: `${[6, 78, 28, 3, 65, 88, 38, 18, 92, 48, 13, 73][i] || 2 + ((i * 19) % 85)}%`,
                transform: `rotate(${(i % 2 === 0 ? -1 : 1) * (3 + (i % 18))}deg)`,
              }}
            >
              {q}
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full" />
            </div>
          )
        })}
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-20 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center space-y-2">
          {/* Badge with prison theme */}
          {/* Product Hunt Badge - Styled as Evidence Tag */}
          <div className="mx-auto inline-flex">
            <div className="relative">
              {/* Evidence bag style container */}
              <div
                className="bg-yellow-100 p-2 md:p-3 border-2 border-black shadow-lg relative"
                style={{
                  transform: "rotate(3deg)",
                  clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                }}
              >
                {/* Evidence tag label */}
                <div className="absolute -top-1 md:-top-2 left-1 md:left-2 bg-red-600 text-white text-xs font-bold px-1 md:px-2 py-0.5 md:py-1 transform -rotate-12">
                  EVIDENCE
                </div>

                {/* Pin */}
                <div className="absolute left-1/2 -top-2 md:-top-3 transform -translate-x-1/2 w-3 h-3 md:w-4 md:h-4 bg-red-500 rounded-full shadow border-2 border-red-700 z-10" />

                {/* Product Hunt Badge */}
                <a
                  href="https://www.producthunt.com/products/founderswall?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-founderswall"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:scale-105 transition-transform duration-200"
                >
                  <img
                    src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=983121&theme=dark&t=1750987443834"
                    alt="FoundersWall - Where founders show the chaos, not just the launch | Product Hunt"
                    className="w-32 h-7 md:w-48 md:h-10 lg:w-56 lg:h-12"
                    width="200"
                    height="43"
                  />
                </a>

                {/* Case number */}
                <div className="absolute -bottom-1 md:-bottom-2 right-1 md:right-2 bg-black text-white text-[9px] sm:text-xs font-mono px-1 md:px-2 py-0.5 md:py-1 transform rotate-6">
                  #PH001
                </div>
              </div>
            </div>
          </div>

          {/* Big Heading with prison/crime theme */}
          <div
            className={`space-y-2 transition-all duration-1000 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            {["BUILD", "SHIP", "REPEAT"].map((word, idx) => (
              <h1
                key={word}
                className="text-7xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-none tracking-tight"
                style={{
                  background:
                    idx === 0
                      ? "linear-gradient(135deg,#fbbf24 0%,#f59e0b 50%,#d97706 100%)"
                      : idx === 1
                        ? "linear-gradient(135deg,#ef4444 0%,#dc2626 50%,#b91c1c 100%)"
                        : "linear-gradient(135deg,#10b981 0%,#059669 50%,#047857 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter:
                    idx === 0
                      ? "drop-shadow(3px 3px 0 rgba(220,38,38,0.8))"
                      : idx === 1
                        ? "drop-shadow(3px 3px 0 rgba(251,191,36,0.8))"
                        : "drop-shadow(3px 3px 0 rgba(55,65,81,0.8))",
                }}
              >
                {idx === 0 ? glitchText : word}
              </h1>
            ))}
          </div>

          {/* Sub-headline with crime theme */}
          <section
            className={`space-y-6 transition-all duration-1000 delay-400 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <p className="text-lg sm:text-xl md:text-2xl text-white font-semibold max-w-4xl mx-auto leading-relaxed">
              The underground hideout where <span className="text-yellow-400 font-bold">real builders</span> turn{" "}
              <span className="text-red-400 font-bold">wild ideas into cold hard cash</span> and get{" "}
              <span className="text-green-400 font-bold">caught shipping</span> every damn day.
            </p>

            <div className="h-10 flex items-center justify-center relative">
              <span className="absolute left-0 text-orange-400 text-6xl opacity-30 font-serif">"</span>
              <p className="text-gray-300 text-base sm:text-lg font-mono max-w-3xl mx-auto italic px-12">
                {hackerQuotes[currentQuote]}
              </p>
              <span className="absolute right-0 text-orange-400 text-6xl opacity-30 font-serif">"</span>
            </div>
          </section>

          {/* CTAs with crime theme */}
          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-1000 delay-600 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <Link
              href="/station"
              className="group bg-yellow-400 hover:bg-yellow-500 text-black px-6 lg:px-8 py-3 lg:py-4 rounded-lg font-bold text-base lg:text-lg transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center justify-center"
            >
              <span className="mr-2">👮‍♂️</span>
              Get on the Board
              <div className="ml-2 group-hover:translate-x-1 transition-transform">→</div>
            </Link>
            <Link href="/logs">
              <button className="group bg-transparent border-2 border-white hover:bg-white hover:text-red-600 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-lg font-bold text-base lg:text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center">
                <span className="mr-2">🔍</span>
                Log Your Chaos
                <div className="ml-2 group-hover:translate-x-1 transition-transform">→</div>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom accent with prison stripes */}
    </div>
  )
}

export default RevampedHero
