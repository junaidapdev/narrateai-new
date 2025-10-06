import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="max-w-6xl mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-semibold text-black">
            Narrate
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/signin" className="text-gray-600 hover:text-black transition-colors">
              Sign In
            </Link>
            <Link href="/signup">
              <Button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-black mb-8">
            Privacy Policy
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            <strong>Last updated:</strong> December 2024
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">
                1. Information We Collect
              </h2>
              <div className="space-y-4 text-gray-600">
                <div>
                  <h3 className="text-lg font-semibold text-black mb-2">Account Information</h3>
                  <p>When you create an account, we collect your email address and any profile information you choose to provide.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-black mb-2">Voice Recordings</h3>
                  <p>We collect and process your voice recordings to provide transcription and content generation services. These recordings are processed using AI technology to create your content.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-black mb-2">Usage Data</h3>
                  <p>We collect information about how you use our service, including the number of recordings, content generated, and feature usage to improve our service.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-black mb-2">Device Information</h3>
                  <p>We may collect information about your device, including browser type, operating system, and IP address for security and analytics purposes.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">
                2. How We Use Your Information
              </h2>
              <div className="space-y-4 text-gray-600">
                <ul className="list-disc list-inside space-y-2">
                  <li>To provide and improve our voice-to-content services</li>
                  <li>To transcribe your voice recordings using AI technology</li>
                  <li>To generate content based on your recordings and preferences</li>
                  <li>To communicate with you about your account and our services</li>
                  <li>To analyze usage patterns and improve our AI models</li>
                  <li>To ensure the security and integrity of our platform</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">
                3. Data Storage and Security
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  We use industry-standard security measures to protect your data, including:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Secure cloud infrastructure with regular security audits</li>
                  <li>Access controls and authentication systems</li>
                  <li>Regular security monitoring and incident response procedures</li>
                </ul>
                <p>
                  Your voice recordings and generated content are stored securely and are only accessible to you and our systems for processing.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">
                4. Data Sharing and Disclosure
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Service Providers:</strong> With trusted third-party services that help us operate our platform (e.g., cloud storage, AI processing services)</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and the rights of others</li>
                  <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets</li>
                  <li><strong>Consent:</strong> When you explicitly consent to sharing your information</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">
                5. Your Rights and Choices
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>You have the following rights regarding your personal information:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Access:</strong> Request access to your personal information</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                  <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                  <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                  <li><strong>Account Deletion:</strong> Delete your account and associated data</li>
                </ul>
                <p>
                  To exercise these rights, please contact us at privacy@narrate.ai or through your account settings.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">
                6. Data Retention
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  We retain your information for as long as your account is active or as needed to provide our services. Specifically:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Voice recordings are retained for processing and may be stored for up to 30 days after processing</li>
                  <li>Account information is retained while your account is active</li>
                  <li>Usage data may be retained for analytics and service improvement</li>
                  <li>We may retain certain information for legal compliance purposes</li>
                </ul>
                <p>
                  You can request deletion of your data at any time, and we will process your request within 30 days.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">
                7. International Data Transfers
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards to protect your information.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">
                8. Children's Privacy
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">
                9. Changes to This Privacy Policy
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically for any changes.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">
                10. Contact Us
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Email: privacy@narrate.ai</li>
                  <li>Website: https://narrate.ai</li>
                </ul>
                <p>
                  We will respond to your inquiry within 30 days.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 py-12 border-t border-gray-200 mt-16">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-2xl font-semibold text-black mb-4 md:mb-0">
            Narrate
          </div>
          <div className="flex space-x-6 text-sm">
            <Link href="/" className="text-gray-600 hover:text-black transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-black transition-colors">
              About
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-black transition-colors">
              Pricing
            </Link>
            <Link href="/privacy" className="text-gray-600 hover:text-black transition-colors">
              Privacy
            </Link>
            <Link href="/signin" className="text-gray-600 hover:text-black transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
