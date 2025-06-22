import HomePageSchema from "@/components/HomePageSchema"
import HomeClient from "@/components/HomeClient"

export default function Home() {
  // Split schema into @graph with WebPage and BreadcrumbList as separate objects
  const webPageSchema = {
    "@type": "WebPage",
    "@id": "https://founderswall.com/#webpage",
    url: "https://founderswall.com",
    name: "FoundersWall – A Public Log of Legendary Builders",
    description:
      "Discover and explore top indie makers. FoundersWall is where the most consistent, creative, and relentless builders get tracked, logged, and celebrated.",
    inLanguage: "en-US",
    isPartOf: "https://founderswall.com/#website",
    about: {
      "@type": "Organization",
      "@id": "https://founderswall.com/#organization",
      name: "FoundersWall",
      description: "A platform for indie makers to showcase their builds and connect with the community",
    },
    potentialAction: [
      {
        "@type": "ReadAction",
        target: ["https://founderswall.com"],
      },
    ],
  }


  const schema = {
    "@context": "https://schema.org",
    "@graph": [webPageSchema],
  }

  return (
    <>
      <HomePageSchema schema={schema} />
      <HomeClient />
    </>
  )
}
