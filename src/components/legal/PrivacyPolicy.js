import React from 'react';
import GlassCard from '../ui/GlassCard';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen py-8 px-4">
      <GlassCard className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        
        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Email address for authentication</li>
              <li>Username and profile information</li>
              <li>Posts, comments, and messages you create</li>
              <li>Images and videos you upload</li>
              <li>Device information for app optimization</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Provide and improve our services</li>
              <li>Authenticate your account</li>
              <li>Enable social features (posts, messages)</li>
              <li>Provide AI assistance through Sir G</li>
              <li>Ensure platform security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Data Sharing</h2>
            <p>We do not sell your personal data. We only share information:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>With your consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Your Rights</h2>
            <p>You can:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and data</li>
              <li>Export your data</li>
              <li>Opt-out of communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Data Retention</h2>
            <p>We retain your data until you delete your account. Deleted content is removed from our servers within 30 days.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Contact Us</h2>
            <p>For privacy concerns, contact: privacy@sirverse.com</p>
          </section>

          <div className="text-sm text-gray-500 mt-8">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
