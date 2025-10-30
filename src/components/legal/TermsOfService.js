import React from 'react';
import GlassCard from '../ui/GlassCard';

export default function TermsOfService() {
  return (
    <div className="min-h-screen py-8 px-4">
      <GlassCard className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
        
        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p>By using SirVerse, you agree to these terms and our Privacy Policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. User Responsibilities</h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Post illegal, harmful, or offensive content</li>
              <li>Harass or bully other users</li>
              <li>Impersonate others</li>
              <li>Share spam or malicious content</li>
              <li>Violate intellectual property rights</li>
              <li>Attempt to hack or disrupt the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Content Ownership</h2>
            <p>You own the content you create. By posting, you grant us license to display and distribute your content on our platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Account Termination</h2>
            <p>We reserve the right to suspend or terminate accounts that violate these terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Limitation of Liability</h2>
            <p>SirVerse is provided "as is" without warranties. We are not liable for damages arising from app use.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Changes to Terms</h2>
            <p>We may update these terms. Continued use constitutes acceptance of changes.</p>
          </section>

          <div className="text-sm text-gray-500 mt-8">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
