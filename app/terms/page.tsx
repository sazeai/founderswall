import type { Metadata } from "next"
import { PublicHeader } from "@/components/public-header"
import PublicFooter from "@/components/public-footer"

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read FoundersWall's Terms of Service. Understand your rights and responsibilities when using our indie maker platform.",
  openGraph: {
    title: "Terms of Service | FoundersWall",
    description: "Read FoundersWall's Terms of Service and understand your rights and responsibilities.",
    url: "https://founderswall.com/terms",
  },
  alternates: {
    canonical: "https://founderswall.com/terms",
  },
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <PublicHeader />

      <main className="container mx-auto px-4 pb-12 pt-24 max-w-4xl">
        <div className="bg-gray-900 border-2 border-yellow-400 rounded-lg p-8 shadow-2xl">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-yellow-400 mb-4 [text-shadow:_2px_2px_4px_rgba(255,0,0,0.5)]">
              Terms of Service
            </h1>
            <p className="text-gray-300 text-lg">
              Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </header>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-300">
                By accessing and using FoundersWall, you accept and agree to be bound by the terms and provision of this
                agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">2. Description of Service</h2>
              <div className="space-y-4 text-gray-300">
                <p>FoundersWall is a platform that provides:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>A public directory of indie makers and their profiles</li>
                  <li>Product launch showcase and discovery features</li>
                  <li>Voting and engagement tools for the maker community</li>
                  <li>Connection features to network with other makers</li>
                  <li>Premium features for enhanced visibility and tools</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">3. User Accounts</h2>
              <div className="space-y-4 text-gray-300">
                <ul className="list-disc list-inside space-y-2">
                  <li>You must provide accurate and complete information when creating an account</li>
                  <li>You are responsible for maintaining the security of your account credentials</li>
                  <li>You must be at least 13 years old to use our service</li>
                  <li>One person may not maintain multiple accounts</li>
                  <li>You are responsible for all activities that occur under your account</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">4. Content Guidelines</h2>
              <div className="space-y-4 text-gray-300">
                <p>When using FoundersWall, you agree not to:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Post false, misleading, or fraudulent information about yourself or your products</li>
                  <li>Upload content that violates intellectual property rights</li>
                  <li>Share spam, promotional content unrelated to indie making, or malicious links</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Attempt to manipulate voting or engagement systems</li>
                  <li>Use the platform for any illegal activities</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">5. Public Content</h2>
              <div className="space-y-4 text-gray-300">
                <p>By using FoundersWall, you understand that:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Your maker profile and submitted products will be publicly visible</li>
                  <li>Other users can vote on and interact with your content</li>
                  <li>Your profile URL is permanent and cannot be changed to maintain SEO integrity</li>
                  <li>You retain ownership of your content but grant us license to display it</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">6. Payment Terms</h2>
              <div className="space-y-4 text-gray-300">
                <ul className="list-disc list-inside space-y-2">
                  <li>Premium features require payment as specified on our platform</li>
                  <li>All payments are processed securely through third-party providers</li>
                  <li>Refunds are handled on a case-by-case basis</li>
                  <li>We reserve the right to change pricing with reasonable notice</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">7. Intellectual Property</h2>
              <div className="space-y-4 text-gray-300">
                <ul className="list-disc list-inside space-y-2">
                  <li>FoundersWall and its design are owned by us and protected by intellectual property laws</li>
                  <li>You retain rights to your submitted content</li>
                  <li>You grant us a license to display, distribute, and promote your content on our platform</li>
                  <li>You must respect the intellectual property rights of others</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">8. Account Termination</h2>
              <div className="space-y-4 text-gray-300">
                <p>We may terminate or suspend your account if you:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Violate these terms of service</li>
                  <li>Engage in fraudulent or harmful behavior</li>
                  <li>Abuse our platform or other users</li>
                  <li>Fail to pay for premium services</li>
                </ul>
                <p>You may delete your account at any time through your profile settings.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-300">
                FoundersWall is provided "as is" without warranties of any kind. We are not liable for any damages
                arising from your use of our platform, including but not limited to direct, indirect, incidental, or
                consequential damages.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">10. Privacy</h2>
              <p className="text-gray-300">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the
                service, to understand our practices.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">11. Changes to Terms</h2>
              <p className="text-gray-300">
                We reserve the right to modify these terms at any time. We will notify users of significant changes
                through our platform. Continued use of the service constitutes acceptance of modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">12. Contact Information</h2>
              <p className="text-gray-300">
                 If you have any questions about this Terms of Service, please contact us at warden@founderswall.com
              </p>
            </section>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
