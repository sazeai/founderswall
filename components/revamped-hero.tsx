"use client"

const RevampedHero = () => {


  const floatingCodeSnippets = [
    'console.log("shipping...");',
    "git push origin main",
    "if (idea) { ship(); }",
    "sudo make me a founder",
  ]

  const chaosTexts = [
    "HUSTLE MODE ON",
    "404: SOCIAL LIFE NOT FOUND",
    "BREAK THINGS FAST",
    "VALIDATE OR DIE",
    "USERS OVER FEATURES",
    "SPEED OVER PERFECTION",
    "GROWTH HACKING",
    "LEAN STARTUP",
  ]




 
  return (
    <div className="bg-black pt-24 relative overflow-hidden">
      {/* Minimalist two-column hero */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start justify-between  px-4 sm:px-8 lg:px-16">
        {/* Mascot on the left */}
        <div className="flex-shrink-0 flex mb-4 sm:flex-col items-center justify-start gap-0" style={{ minWidth: 120 }}>
          {/* Mascot image */}
          <img
            src="/caught-shipping.webp"
            alt="Caught Shipping Mascot"
            className="w-28 h-28 md:w-36 md:h-36 lg:w-36 lg:h-36 drop-shadow-2xl -mb-4 z-10"
            style={{ objectFit: "contain" }}
          />
          {/* Product Hunt badge, visually under mascot */}
         <div className="mx-auto inline-flex mt-4 sm:mt-0">
            <div className="relative">
              {/* Evidence bag style container */}
              <div
                className="bg-yellow-100 p-1 md:p-2 border-2 border-black shadow-lg relative"
                style={{
                  transform: "rotate(3deg)",
                  clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                }}
              >
                {/* Evidence tag label */}
                <div className="absolute -top-1 md:-top-2 left-1 md:left-2 bg-red-600 text-white text-[9px] sm:text-xs font-bold px-1 md:px-2 py-0.5 md:py-1 transform -rotate-12">
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
                    className="w-40 h-8 md:w-40 md:h-8 lg:w-48 lg:h-10"
                    width="170"
                    height="35"
                  />
                </a>

                {/* Case number */}
                <div className="absolute -bottom-1 md:-bottom-2 right-1 md:right-2 bg-black text-white text-[8px] sm:text-xs font-mono px-1 md:px-2 py-0.5 md:py-1 transform rotate-6">
                  #PH001
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Heading on the right */}
        <div className="flex-1 flex flex-col items-start align-center justify-center sm:pl-8">
           <h1 className="text-[1.7rem] mt-4 sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight tracking-tight text-foreground">
              BUILD. <span className="text-primary">LAUNCH.</span> <span className="text-accent">REPEAT.</span>
            </h1>
          <p className="text-lg mt-4 sm:text-xl md:text-2xl text-gray-300 font-medium leading-tight mt-2">
Ship every week, stack your launches, and show you're still building. No followers to chase, no noise to fake, just your timeline proving you're alive and putting in the work. </p>
        </div>
      </div>
      <div className="h-8 w-full bg-yellow-400 relative overflow-hidden z-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, #000 0, #000 10px, #f6e05e 10px, #f6e05e 20px)",
            backgroundSize: "28px 28px",
          }}
        ></div>
      </div>
    </div>
  )
}

export default RevampedHero

