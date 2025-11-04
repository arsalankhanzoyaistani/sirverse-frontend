import React, { useState, useEffect } from "react";
import { submitReport, getReportTypes } from "../utils/api";
import GlassCard from "./ui/GlassCard";
import Button from "./ui/Button";

export default function ReportModal({ isOpen, onClose, reportedItem }) {
  const [reportTypes, setReportTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(false);

  useEffect(() => {
    if (isOpen) {
      console.log("📋 ReportModal opened with reportedItem:", reportedItem);
      loadReportTypes();
    } else {
      // Reset form when modal closes
      setSelectedType("");
      setDescription("");
      setSubmitted(false);
    }
  }, [isOpen, reportedItem]);

  const loadReportTypes = async () => {
    setLoadingTypes(true);
    try {
      console.log("🔄 Loading report types...");
      const res = await getReportTypes();
      console.log("📊 Report types response:", res);
      
      if (res.ok && res.data) {
        setReportTypes(res.data.report_types || []);
        console.log(`✅ Loaded ${res.data.report_types?.length || 0} report types`);
      } else {
        console.error("❌ Failed to load report types:", res);
        // Fallback to default types if API fails
        setReportTypes(getDefaultReportTypes());
      }
    } catch (error) {
      console.error("❌ Error loading report types:", error);
      // Fallback to default types
      setReportTypes(getDefaultReportTypes());
    } finally {
      setLoadingTypes(false);
    }
  };

  // Fallback function if API fails
  const getDefaultReportTypes = () => {
    return [
      { value: "spam", label: "Spam" },
      { value: "harassment", label: "Harassment or Bullying" },
      { value: "hate_speech", label: "Hate Speech" },
      { value: "nudity", label: "Nudity or Sexual Content" },
      { value: "violence", label: "Violence or Harm" },
      { value: "false_info", label: "False Information" },
      { value: "scam", label: "Scam or Fraud" },
      { value: "intellectual_property", label: "Intellectual Property Violation" },
      { value: "suicide_self_injury", label: "Suicide or Self-Injury" },
      { value: "other", label: "Other" }
    ];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedType) {
      alert("Please select a report type");
      return;
    }

    setLoading(true);
    
    // Build report data explicitly to ensure correct structure
    const reportData = {
      report_type: selectedType,
      description: description,
    };

    // Add the specific reported item IDs
    if (reportedItem) {
      if (reportedItem.reported_user_id) {
        reportData.reported_user_id = parseInt(reportedItem.reported_user_id);
      }
      if (reportedItem.reported_post_id) {
        reportData.reported_post_id = parseInt(reportedItem.reported_post_id);
      }
      if (reportedItem.reported_reel_id) {
        reportData.reported_reel_id = parseInt(reportedItem.reported_reel_id);
      }
      // Also check for user_id as fallback
      if (reportedItem.user_id && !reportData.reported_user_id) {
        reportData.reported_user_id = parseInt(reportedItem.user_id);
      }
    }

    console.log("📤 Sending report data:", reportData);

    try {
      const res = await submitReport(reportData);
      setLoading(false);

      if (res.ok) {
        console.log("✅ Report submitted successfully:", res.data);
        setSubmitted(true);
        setTimeout(() => {
          onClose();
          setSubmitted(false);
          setSelectedType("");
          setDescription("");
        }, 2000);
      } else {
        console.error("❌ Report submission failed:", res.data);
        alert(res.data?.error || "Failed to submit report");
      }
    } catch (error) {
      setLoading(false);
      console.error("❌ Report submission error:", error);
      alert("Network error submitting report");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <GlassCard className="w-full max-w-md p-6">
        {submitted ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Report Submitted
            </h3>
            <p className="text-gray-600">
              Thank you for helping keep our community safe.
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Report Content
              </h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What's wrong with this content?
                </label>
                {loadingTypes ? (
                  <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500">
                    Loading report types...
                  </div>
                ) : (
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select a reason</option>
                    {reportTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                )}
                {reportTypes.length === 0 && !loadingTypes && (
                  <p className="text-red-500 text-sm mt-1">
                    Failed to load report types. Please refresh the page.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional details (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Please provide any additional information that might help us review this report..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  disabled={reportTypes.length === 0 || !selectedType}
                  className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Report
                </Button>
              </div>
            </form>
          </>
        )}
      </GlassCard>
    </div>
  );
}
