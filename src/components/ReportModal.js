import React, { useState } from 'react';
import GlassCard from './ui/GlassCard';
import Button from './ui/Button';

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
    if (!reason) return;

    setLoading(true);
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content_type: contentType,
          content_id: contentId,
          reason: reason,
          description: description
        })
      });

      if (response.ok) {
        alert('Report submitted successfully!');
        onClose();
        setReason('');
        setDescription('');
      } else {
        alert('Failed to submit report');
      }
    } catch (error) {
      console.error('Report error:', error);
      alert('Error submitting report');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <GlassCard className="max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Report Content</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for reporting
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Please provide more information..."
            />
          </div>

          {contentAuthor && (
            <div className="text-sm text-gray-600">
              Reporting content by: <span className="font-medium">@{contentAuthor}</span>
            </div>
          )}

          <div className="flex gap-3 pt-4">
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
              disabled={!reason}
              className="flex-1 bg-red-500 hover:bg-red-600"
            >
              Submit Report
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
