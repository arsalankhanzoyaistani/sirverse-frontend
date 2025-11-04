import React, { useState, useEffect } from "react";
import { getPrivacyPolicy } from "../utils/api";
import GlassCard from "../components/ui/GlassCard";

export default function PrivacyPolicy() {
  const [privacyPolicy, setPrivacyPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrivacyPolicy();
  }, []);

  const loadPrivacyPolicy = async () => {
    try {
      const res = await getPrivacyPolicy();
      if (res.ok) {
        setPrivacyPolicy(res.data);
      }
    } catch (error) {
      console.error("Error loading privacy policy:", error);
      // Fallback content
      setPrivacyPolicy({
        title: "Privacy Policy",
        last_updated: "2024-01-01",
        sections: [
          {
            title: "Information We Collect",
            content: "We collect information you provide directly to us, including your username, email address, profile information, and content you post."
          },
          {
            title: "How We Use Your Information",
            content: "We use your information to provide and improve our services, communicate with you, and ensure platform safety."
          },
          {
            title: "Data Sharing",
            content: "We do not sell your personal data. We may share information with service providers or when required by law."
          },
          {
            title: "Your Rights",
            content: "You can access, update, or delete your personal information through your account settings."
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading privacy policy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-4 max-w-4xl mx-auto px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="text-gray-600 mt-1">How we handle your data</p>
      </div>

      <GlassCard className="p-6">
        {privacyPolicy ? (
          <div>
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-gray-900">{privacyPolicy.title}</h2>
              <div className="text-sm text-gray-500">
                Last updated: {privacyPolicy.last_updated}
              </div>
            </div>

            <div className="space-y-6">
              {privacyPolicy.sections?.map((section, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {section.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📄</div>
            <p className="text-gray-700">Privacy policy not available</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
