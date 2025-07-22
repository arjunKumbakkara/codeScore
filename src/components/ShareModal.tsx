import React, { useState } from 'react';
import { X, Share2, Copy, Check, ExternalLink } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewId: string;
  reviewData: {
    code: string;
    review: string;
    language: string;
    filename?: string;
    createdAt: string;
  };
}

export const ShareModal: React.FC<ShareModalProps> = ({ 
  isOpen, 
  onClose, 
  reviewId, 
  reviewData 
}) => {
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const generateShareableReport = async () => {
    setGenerating(true);
    try {
      // Create a shareable URL with the review data
      const reportData = {
        id: reviewId,
        code: reviewData.code,
        review: reviewData.review,
        language: reviewData.language,
        filename: reviewData.filename,
        createdAt: reviewData.createdAt,
        sharedAt: new Date().toISOString(),
      };

      // In a real implementation, you'd save this to a public table or generate a unique URL
      // For now, we'll create a URL with encoded data
      const encodedData = btoa(JSON.stringify(reportData));
      const url = `${window.location.origin}/shared/${encodedData}`;
      setShareUrl(url);
    } catch (error) {
      console.error('Error generating shareable report:', error);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const openInNewTab = () => {
    window.open(shareUrl, '_blank');
  };

  React.useEffect(() => {
    if (isOpen && !shareUrl) {
      generateShareableReport();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md transform transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Share2 className="text-purple-600 mr-3" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">Share Report</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Report Details</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">Language:</span> {reviewData.language}</p>
              {reviewData.filename && (
                <p><span className="font-medium">File:</span> {reviewData.filename}</p>
              )}
              <p><span className="font-medium">Created:</span> {new Date(reviewData.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {generating ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mr-3"></div>
              <span className="text-gray-600">Generating shareable link...</span>
            </div>
          ) : shareUrl ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shareable Link
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                {copied && (
                  <p className="text-sm text-green-600 mt-1">Copied to clipboard!</p>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={openInNewTab}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  <ExternalLink size={16} className="mr-2" />
                  Preview
                </button>
                <button
                  onClick={copyToClipboard}
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
                >
                  {copied ? <Check size={16} className="mr-2" /> : <Share2 size={16} className="mr-2" />}
                  {copied ? 'Copied!' : 'Share'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-red-600">Failed to generate shareable link. Please try again.</p>
              <button
                onClick={generateShareableReport}
                className="mt-2 text-purple-600 hover:text-purple-700 font-medium"
              >
                Retry
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> This link will allow anyone to view your code review report. 
            Only share with trusted individuals.
          </p>
        </div>
      </div>
    </div>
  );
};