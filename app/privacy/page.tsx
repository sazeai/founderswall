import type { Metadata } from "next"
import { PublicHeader } from "@/components/public-header"
import PublicFooter from "@/components/public-footer"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how FoundersWall collects, uses, and protects your personal information. Our commitment to your privacy and data security.",
  openGraph: {
    title: "Privacy Policy | FoundersWall",
    description: "Learn how FoundersWall collects, uses, and protects your personal information.",
    url: "https://founderswall.com/privacy",
  },
  alternates: {
    canonical: "https://founderswall.com/privacy",
  },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <PublicHeader />

      <main className="container mx-auto px-4 pb-12 pt-24 max-w-4xl">
        <div className="bg-gray-900 border-2 border-yellow-400 rounded-lg p-8 shadow-2xl">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-yellow-400 mb-4 [text-shadow:_2px_2px_4px_rgba(255,0,0,0.5)]">
              Privacy Policy
            </h1>
            <p className="text-gray-300 text-lg">
              Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </header>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">1. Information We Collect</h2>
              <div className="space-y-4 text-gray-300">
                <h3 className="text-xl font-semibold text-white">Personal Information</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Name and email address when you create an account</li>
                  <li>Profile information including bio, social links, and profile photos</li>
                  <li>Product information when you submit launches</li>
                  <li>Payment information processed securely through our payment providers</li>
                </ul>

                <h3 className="text-xl font-semibold text-white">Usage Information</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Pages visited and features used on our platform</li>
                  <li>Voting and interaction data</li>
                  <li>Connection requests and maker interactions</li>
                  <li>Device information and IP addresses</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">2. How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Display your maker profile and submitted products publicly</li>
                <li>Enable connections and interactions with other makers</li>
                <li>Process payments for premium features</li>
                <li>Send important updates about your account and our service</li>
                <li>Improve our platform through analytics and usage patterns</li>
                <li>Prevent fraud and ensure platform security</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">3. Information Sharing</h2>
              <div className="space-y-4 text-gray-300">
                <p>We share information in the following circumstances:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    <strong>Public Profiles:</strong> Your maker profile, products, and interactions are publicly
                    visible
                  </li>
                  <li>
                    <strong>Service Providers:</strong> We use Supabase for database services and authentication
                  </li>
                  <li>
                    <strong>Analytics:</strong> We use Google Analytics to understand platform usage
                  </li>
                  <li>
                    <strong>Payment Processing:</strong> Payment information is processed by secure third-party
                    providers
                  </li>
                  <li>
                    <strong>Legal Requirements:</strong> When required by law or to protect our rights
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">4. Third-Party Services</h2>
              <div className="space-y-4 text-gray-300">
                <p>We integrate with the following third-party services:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    <strong>Supabase:</strong> Database and authentication services
                  </li>
                  <li>
                    <strong>Google Analytics:</strong> Website analytics and user behavior tracking
                  </li>
                  <li>
                    <strong>OAuth Providers:</strong> Google and GitHub for account authentication
                  </li>
                  <li>
                    <strong>Payment Processors:</strong> Secure payment processing services
                  </li>
                </ul>
                <p>Each service has its own privacy policy governing their use of your information.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">5. Data Security</h2>
              <p className="text-gray-300">
                We implement appropriate security measures to protect your personal information against unauthorized
                access, alteration, disclosure, or destruction. However, no internet transmission is completely secure,
                and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">6. Your Rights</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Access and update your profile information at any time</li>
                <li>Delete your account and associated data</li>
                <li>Opt out of non-essential communications</li>
                <li>Request information about data we have collected</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">7. Cookies and Tracking</h2>
              <p className="text-gray-300">
                We use cookies and similar technologies to maintain your session, remember your preferences, and analyze
                platform usage through Google Analytics. You can control cookie settings through your browser.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">8. Children's Privacy</h2>
              <p className="text-gray-300">
                Our service is not intended for users under 13 years of age. We do not knowingly collect personal
                information from children under 13.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">9. Changes to This Policy</h2>
              <p className="text-gray-300">
                We may update this privacy policy from time to time. We will notify you of any changes by posting the
                new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">10. Contact Us</h2>
              <p className="text-gray-300">
                If you have any questions about this Privacy Policy, please contact us at warden@founderswall.com
              </p>
            </section>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
