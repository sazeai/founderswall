import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://founderswall.com"),
  title: {
    default: "FoundersWall – A Public Log of Legendary Builders",
    template: "%s | FoundersWall",
  },
  description:
    "Discover and explore top indie makers. FoundersWall is where the most consistent, creative, and relentless builders get tracked, logged, and celebrated.",
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
    title: "FoundersWall – A Public Log of Legendary Builders",
    description:
      "Discover and explore top indie makers. FoundersWall is where the most consistent, creative, and relentless builders get tracked, logged, and celebrated.",
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
    title: "FoundersWall – A Public Log of Legendary Builders",
    description:
      "Discover and explore top indie makers. FoundersWall is where the most consistent, creative, and relentless builders get tracked, logged, and celebrated.",
    images: ["/screenshot.png"],
    creator: "@founderswall",
    site: "@founderswall",
  },
  verification: {
    google: "your-google-verification-code",
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
  },
  alternates: {
    canonical: "https://founderswall.com",
  },
  category: "technology",
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
      description: "A Public Log of Legendary Builders - Discover and explore top indie makers",
      publisher: {
        "@id": "https://founderswall.com/#organization",
      },
      potentialAction: [
        {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: "https://founderswall.com/?search={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      ],
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
        url: "https://founderswall.com/founderswalllogo.png",
        contentUrl: "https://founderswall.com/founderswalllogo.png",
        width: 400,
        height: 100,
        caption: "FoundersWall",
      },
      image: {
        "@id": "https://founderswall.com/#/schema/logo/image/",
      },
      description: "A Public Log of Legendary Builders - Discover and explore top indie makers",
      sameAs: ["https://twitter.com/founderswall", "https://github.com/founderswall"],
      foundingDate: "2024",
      slogan: "Where Legendary Builders Get Tracked, Logged, and Celebrated",
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
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
