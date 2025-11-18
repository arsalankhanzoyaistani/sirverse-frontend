import React, { useState, useEffect } from "react";
import { getTermsOfService } from "../utils/api";
import GlassCard from "../components/ui/GlassCard";

export default function TermsOfService() {
  const [terms, setTerms] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTerms();
  }, []);

  const loadTerms = async () => {
    try {
      const res = await getTermsOfService();
      if (res.ok) {
        setTerms(res.data);
      }
    } catch (error) {
      console.error("Error loading terms:", error);
      // Fallback content
      setTerms({
        title: "Terms of Service",
        last_updated: "2024-01-01",
        sections: [
          {
            title: "User Conduct",
            content: "You agree not to post illegal, harmful, or offensive content. Respect other users and their privacy."
          },
          {
            title: "Content Ownership", 
            content: "You retain ownership of your content but grant us license to display and distribute it on our platform."
          },
          {
            title: "Account Termination",
            content: "We reserve the right to suspend or terminate accounts that violate our terms."
          },
          {
            title: "Limitation of Liability",
            content: "We are not liable for any indirect damages resulting from your use of our service."
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
          <p className="text-gray-600 mt-2">Loading terms of service...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-4 max-w-4xl mx-auto px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Terms of Service</h1>
        <p className="text-gray-600 mt-1">Platform rules and guidelines</p>
      </div>

      <GlassCard className="p-6">
        {terms ? (
          <div>
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-gray-900">{terms.title}</h2>
              <div className="text-sm text-gray-500">
                Last updated: {terms.last_updated}
              </div>
            </div>

            <div className="space-y-6">
              {terms.sections?.map((section, index) => (
                <div key={index} className="border-l-4 border-green-500 pl-4">
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
            <p className="text-gray-700">Terms of service not available</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
