import React, { useState } from 'react';
import GlassCard from './ui/GlassCard';
import Button from './ui/Button';
import { submitReport } from '../utils/api';

export default function ReportModal({ isOpen, onClose, contentType, contentId, contentAuthor }) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const reportReasons = [
    'Spam',
    'Harassment or Bullying',
    'Hate Speech',
    'Violence',
    'Nudity or Sexual Content',
    'False Information',
    'Intellectual Property Violation',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      alert('Please select a reason for reporting');
      return;
    }

    setLoading(true);
    try {
      const res = await submitReport({
        content_type: contentType,
        content_id: contentId,
        reason: reason,
        description: description
      });

      if (res.ok) {
        alert('✅ Report submitted successfully! Our team will review it shortly.');
        onClose();
        setReason('');
        setDescription('');
      } else {
        alert(`❌ Failed to submit report: ${res.data?.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Report error:', error);
      alert('❌ Error submitting report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getContentTypeText = () => {
    switch(contentType) {
      case 'post': return 'post';
      case 'reel': return 'reel';
      case 'comment': return 'comment';
      case 'user': return 'user profile';
      default: return 'content';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <GlassCard className="max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Report Content</h2>
        
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            Reporting {getContentTypeText()} by <span className="font-semibold">@{contentAuthor}</span>
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for reporting *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a reason</option>
              {reportReasons.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional details (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Please provide more information about why you're reporting this content..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={!reason}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              Submit Report
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
