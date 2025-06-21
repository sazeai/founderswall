import { notFound } from "next/navigation"
import { getMugshotByUsername } from "@/lib/mugshot-service"
import { getProductsByFounderId } from "@/lib/product-service"
import type { Metadata } from "next"
import MakerProfileClient from "./MakerProfileClient"
import { PublicHeader } from "@/components/public-header"
import { createClient } from "@/utils/supabase/server"
import type { Launch } from "@/lib/types"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  const awaitedParams = await params
  const { username } = awaitedParams
  const mugshot = await getMugshotByUsername(username)

  if (!mugshot) {
    return {
      title: "Maker Not Found | FoundersWall",
      description: "This legendary builder could not be found on FoundersWall.",
    }
  }

  const products = await getProductsByFounderId(mugshot.id)
  const productCount = products.length
  const description = `${mugshot.name} is a legendary builder on FoundersWall. ${mugshot.crime} • ${productCount} products launched • Discover their maker journey and product launches.`

  return {
    title: `${mugshot.name} - Legendary Builder | FoundersWall`,
    description: description,
    keywords: [
      mugshot.name,
      "indie maker",
      "startup founder",
      "product builder",
      "SaaS founder",
      "build in public",
      "legendary builder",
      "FoundersWall",
    ],
    authors: [{ name: mugshot.name }],
    creator: mugshot.name,
    openGraph: {
      title: `${mugshot.name} - Legendary Builder | FoundersWall`,
      description: description,
      type: "profile",
      images: [
        {
          url: mugshot.imageUrl || "/placeholder.svg?height=400&width=400&text=Legendary+Builder",
          width: 400,
          height: 400,
          alt: `${mugshot.name} - Legendary Builder Profile`,
        },
      ],
      url: `${process.env.NEXT_PUBLIC_APP_URL}/maker/${username}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${mugshot.name} - Legendary Builder`,
      description: description,
      images: [mugshot.imageUrl || "/placeholder.svg?height=400&width=400&text=Legendary+Builder"],
      creator: mugshot.twitterHandle ? `@${mugshot.twitterHandle.replace("@", "")}` : undefined,
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL}/maker/${username}`,
    },
  }
}

type PersonSchema = {
  "@context": string
  "@type": string
  "@id": string
  name: any
  description: string
  url: string
  image: {
    "@type": string
    url: any
    width: number
    height: number
  }
  sameAs: any[]
  jobTitle: string
  worksFor: {
    "@type": string
    name: string
  }
  knowsAbout: string[]
  hasCredential: {
    "@type": string
    name: string
    description: string
  }
  hasCreated?: any[]
}

async function generateMakerSchema(mugshot: any, products: any[], username: string) {
  const supabase = await createClient()

  // Calculate total upvotes
  const totalUpvotes = products.reduce((sum, product) => sum + (product.upvotes || 0), 0)

  // Generate social profiles array
  const sameAs = []
  if (mugshot.productUrl) sameAs.push(mugshot.productUrl)
  if (mugshot.twitterHandle) {
    sameAs.push(`https://twitter.com/${mugshot.twitterHandle.replace("@", "")}`)
  }

  const personSchema: PersonSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${process.env.NEXT_PUBLIC_APP_URL}/maker/${username}#person`,
    name: mugshot.name,
    description: `${mugshot.crime} • Legendary builder with ${products.length} products launched`,
    url: `${process.env.NEXT_PUBLIC_APP_URL}/maker/${username}`,
    image: {
      "@type": "ImageObject",
      url: mugshot.imageUrl || "/placeholder.svg?height=400&width=400&text=Legendary+Builder",
      width: 400,
      height: 400,
    },
    sameAs: sameAs,
    jobTitle: "Indie Maker & Product Builder",
    worksFor: {
      "@type": "Organization",
      name: "Independent",
    },
    knowsAbout: ["Product Development", "Startup Building", "SaaS Development", "Indie Making"],
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      name: `${totalUpvotes} Community Upvotes`,
      description: "Recognition from the FoundersWall community",
    },
  }

  // Add products as CreativeWork
  if (products.length > 0) {
    personSchema["hasCreated"] = products.map((product) => ({
      "@type": "SoftwareApplication",
      "@id": `${process.env.NEXT_PUBLIC_APP_URL}/launch/${product.slug}#software`,
      name: product.title,
      description: product.description,
      url: product.productUrl,
      creator: {
        "@type": "Person",
        "@id": `${process.env.NEXT_PUBLIC_APP_URL}/maker/${username}#person`,
      },
      datePublished: product.launchDate,
      aggregateRating:
        product.upvotes > 0
          ? {
              "@type": "AggregateRating",
              ratingValue: Math.min(5, Math.max(1, product.upvotes / 10 + 3)),
              ratingCount: product.upvotes,
              bestRating: 5,
              worstRating: 1,
            }
          : undefined,
    }))
  }

  // ProfilePage schema
  const profilePageSchema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${process.env.NEXT_PUBLIC_APP_URL}/maker/${username}`,
    mainEntity: {
      "@id": `${process.env.NEXT_PUBLIC_APP_URL}/maker/${username}#person`,
    },
    name: `${mugshot.name} - Legendary Builder Profile`,
    description: `Discover ${mugshot.name}'s maker journey, products, and achievements on FoundersWall`,
    url: `${process.env.NEXT_PUBLIC_APP_URL}/maker/${username}`,
    isPartOf: {
      "@type": "WebSite",
      "@id": `${process.env.NEXT_PUBLIC_APP_URL}#website`,
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "FoundersWall",
          item: process.env.NEXT_PUBLIC_APP_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Makers",
          item: `${process.env.NEXT_PUBLIC_APP_URL}/launch`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: mugshot.name,
          item: `${process.env.NEXT_PUBLIC_APP_URL}/maker/${username}`,
        },
      ],
    },
  }

  return [personSchema, profilePageSchema]
}

export default async function MakerProfilePage({ params }: { params: { username: string } }) {
  const awaitedParams = await params
  const { username } = awaitedParams
  const mugshot = await getMugshotByUsername(username)

  if (!mugshot) {
    notFound()
  }

  const products = await getProductsByFounderId(mugshot.id)

  // Fetch upvotes for each product using server client
  const supabase = await createClient()
  const productsWithUpvotes = await Promise.all(
    products.map(async (product) => {
      const { count: upvotes } = await supabase
        .from("product_upvotes")
        .select("*", { count: "exact", head: true })
        .eq("product_id", product.id)

      return {
        ...product,
        upvotes: upvotes || 0,
      }
    }),
  )

  const { data: launchesData } = await supabase
    .from("launches")
    .select(
      `
    *,
    mugshot:user_id(id, name, username, imageUrl),
    supporters:launch_supports(id, user_id, mugshot:user_id(id, name, username, imageUrl))
  `,
    )
    .eq("user_id", mugshot.id)
    .order("created_at", { ascending: false })

  const launches: Launch[] = launchesData || []

  // Generate schema
  const schemas = await generateMakerSchema(mugshot, productsWithUpvotes, username)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemas),
        }}
      />
      <PublicHeader />
      <MakerProfileClient
        username={username}
        mugshot={mugshot}
        products={productsWithUpvotes}
        launches={launches}
      />
    </>
  )
}
