import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://founderswall.com"),
  title: {
    default: "Build in Public. Get Seen by Founders. Found by Customers.",
    template: "%s | FoundersWall",
  },
  description:
    "FoundersWall is your public space to build in public, log your progress, and launch your product. Get a timeline, product page, SEO boost, and visibility from both founders and customers.",
  keywords: [
    "indie makers",
    "startup builders",
    "product launch",
    "build in public",
    "founder profiles",
    "saas listing",
    "indie hackers",
    "startup founders",
    "product hunt",
    "maker community",
  ],
  authors: [{ name: "FoundersWall" }],
  creator: "FoundersWall",
  publisher: "FoundersWall",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://founderswall.com",
    siteName: "FoundersWall",
    title: "Your Product. Your Timeline. Founders See It. Google Finds It.",
    description:
      " Not another startup graveyard. FoundersWall is your public board to log updates, launch products, and get seen by humans and Google.",
    images: [
      {
        url: "/screenshot.png",
        width: 1200,
        height: 630,
        alt: "FoundersWall - The Indie Hacker Wall of Fame",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Your Product. Your Timeline. Founders See It. Google Finds It.",
    description:
    " Not another startup graveyard. FoundersWall is your public board to log updates, launch products, and get seen by humans and Google.",
   images: ["/screenshot.png"],
    creator: "@AINotSoSmart",
    site: "https://founderswall.com",
  },
  verification: {
    google: "your-google-verification-code",
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
  },
  alternates: {
    canonical: "https://founderswall.com",
  },
    generator: 'v0.dev'
}

// Sitewide JSON-LD Schema
const siteSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://founderswall.com/#website",
      url: "https://founderswall.com",
      name: "FoundersWall",
      description:     "FoundersWall is your public space to build in public, log your progress, and launch your product. Get a timeline, product page, SEO boost, and visibility from both founders and customers.",
      publisher: {
        "@id": "https://founderswall.com/#organization",
      },
      inLanguage: "en-US",
    },
    {
      "@type": "Organization",
      "@id": "https://founderswall.com/#organization",
      name: "FoundersWall",
      url: "https://founderswall.com",
      logo: {
        "@type": "ImageObject",
        inLanguage: "en-US",
        "@id": "https://founderswall.com/#/schema/logo/image/",
        url: "https://founderswall.com/founderswall-logo.png",
        contentUrl: "https://founderswall.com/founderswall-logo.png",
        width: 400,
        height: 100,
        caption: "FoundersWall",
      },
      image: {
        "@id": "https://founderswall.com/#/schema/logo/image/",
      },
      description:     "FoundersWall is your public space to build in public, log your progress, and launch your product. Get a timeline, product page, SEO boost, and visibility from both founders and customers.",
      sameAs: ["https://x.com/AINotSoSmart"],
      foundingDate: "2024",
      slogan: "Build in Public. Be Seen. Be Found. | FoundersWall",
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap" rel="stylesheet" />
        {/* Sitewide JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(siteSchema),
          }}
        />

        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-1S3MZEFCX6"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-1S3MZEFCX6');
              `,
          }}
        />

        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Theme color */}
        <meta name="theme-color" content="#000000" />
        <meta name="color-scheme" content="dark" />
      </head>
      <body className={inter.className + " dark"} style={{ colorScheme: "dark" }}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
