import React, { useState, useEffect } from 'react';
import { Shield, Users, FileText, Calendar, Eye, Check, X, Trash2, AlertCircle, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface ApprovalRequest {
  id: string;
  email: string;
  reason: string;
  status: string;
  created_at: string;
  approved_at?: string;
  approved_by?: string;
}

interface CodeReviewSummary {
  id: string;
  user_id: string;
  language: string;
  filename?: string;
  created_at: string;
  user_email?: string;
}

export const AdminPanel: React.FC = () => {
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
  const [codeReviews, setCodeReviews] = useState<CodeReviewSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'approvals' | 'reviews'>('approvals');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const { user } = useAuth();

  const isAdmin = user?.email === 'outsource.arjun@gmail.com';

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('Fetching approval requests...');
      // Fetch approval requests
      const { data: approvals } = await supabase
        .from('user_approvals')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Approval requests fetched:', approvals);
      setApprovalRequests(approvals || []);

      // Fetch code reviews with user emails
      const { data: reviews } = await supabase
        .from('code_reviews')
        .select(`
          id,
          user_id,
          language,
          filename,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      // Get user emails for the reviews
      if (reviews && reviews.length > 0) {
        const userIds = [...new Set(reviews.map(r => r.user_id))];
        
        // Call Edge Function to get user emails
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-user-emails`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ userIds }),
        });

        const { emailMap } = await response.json();

        const reviewsWithEmails = reviews.map(review => ({
          ...review,
          user_email: emailMap[review.user_id] || 'Unknown'
        }));

        setCodeReviews(reviewsWithEmails);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (requestId: string, action: 'approve' | 'deny') => {
    setProcessingId(requestId);
    try {
      const request = approvalRequests.find(r => r.id === requestId);
      if (!request) {
        throw new Error('Request not found');
      }

      if (!request.approval_token) {
        throw new Error('Approval token not found');
      }

      // Use the handle-approval Edge Function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-approval?token=${request.approval_token}&action=${action}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Edge Function response error:', errorText);
        throw new Error(`Failed to ${action} user: HTTP ${response.status}`);
      }

      // The Edge Function returns HTML, check for success indicators
      const responseText = await response.text();
      console.log('Edge Function response:', responseText);
      
      // Check if the response indicates success
      if (responseText.includes('Error Creating User') || responseText.includes('Error')) {
        // Extract error message from HTML if possible
        const errorMatch = responseText.match(/<p>Failed to create user account: ([^<]+)<\/p>/) || 
                          responseText.match(/<h1>Error[^<]*<\/h1><p>([^<]+)<\/p>/);
        const errorMessage = errorMatch ? errorMatch[1] : 'Unknown error occurred during user creation';
        throw new Error(errorMessage);
      }
      
      if (!responseText.includes('✅ Approved!') && !responseText.includes('❌ Denied')) {
        console.error('Unexpected response format:', responseText);
        throw new Error(`Unexpected response from server. Please check the logs.`);
      }

      // Refresh data
      await fetchData();
      
      // Show success message
      const successMessage = action === 'approve' 
        ? `User ${request.email} approved successfully! They can now sign in.`
        : `User ${request.email} denied successfully.`;
      alert(successMessage);
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to ${action} user: ${errorMessage}`);
    } finally {
      setProcessingId(null);
    }
  };

  const cleanupOldReviews = async () => {
    setCleanupLoading(true);
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('code_reviews')
        .delete()
        .lt('created_at', sevenDaysAgo.toISOString());

      if (error) throw error;

      alert('Old reviews cleaned up successfully!');
      await fetchData();
    } catch (error) {
      console.error('Error cleaning up old reviews:', error);
      alert('Failed to cleanup old reviews. Please try again.');
    } finally {
      setCleanupLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <Shield className="mx-auto text-red-500 mb-4" size={48} />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to access the admin panel.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Shield className="text-purple-600 mr-3" size={28} />
          <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={cleanupOldReviews}
            disabled={cleanupLoading}
            className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cleanupLoading ? (
              <div className="w-4 h-4 border border-red-700 border-t-transparent rounded-full animate-spin mr-2"></div>
            ) : (
              <Trash2 size={16} className="mr-2" />
            )}
            Cleanup Old Reviews (7+ days)
          </button>
        </div>
      </div>

      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('approvals')}
          className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md transition-colors ${
            activeTab === 'approvals'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users size={16} className="mr-2" />
          Approval Requests ({approvalRequests.filter(r => r.status === 'pending').length})
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md transition-colors ${
            activeTab === 'reviews'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText size={16} className="mr-2" />
          Code Reviews ({codeReviews.length})
        </button>
      </div>

      {activeTab === 'approvals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Approval Requests</h3>
            <span className="text-sm text-gray-500">
              {approvalRequests.length} total requests
            </span>
          </div>

          {approvalRequests.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">No approval requests found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {approvalRequests.map((request) => (
                <div
                  key={request.id}
                  className={`border rounded-lg p-4 ${
                    request.status === 'pending'
                      ? 'border-yellow-200 bg-yellow-50'
                      : request.status === 'approved'
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h4 className="font-medium text-gray-900">{request.email}</h4>
                        <span
                          className={`ml-3 px-2 py-1 text-xs rounded-full ${
                            request.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : request.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{request.reason}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar size={12} className="mr-1" />
                        Requested: {new Date(request.created_at).toLocaleString()}
                        {request.approved_at && (
                          <>
                            <span className="mx-2">•</span>
                            <Clock size={12} className="mr-1" />
                            Processed: {new Date(request.approved_at).toLocaleString()}
                          </>
                        )}
                      </div>
                    </div>
                    {request.status === 'pending' && (
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleApproval(request.id, 'approve')}
                          disabled={processingId === request.id}
                          className="flex items-center px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingId === request.id ? (
                            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Check size={14} />
                          )}
                        </button>
                        <button
                          onClick={() => handleApproval(request.id, 'deny')}
                          disabled={processingId === request.id}
                          className="flex items-center px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingId === request.id ? (
                            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <X size={14} />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Code Review History</h3>
            <span className="text-sm text-gray-500">
              {codeReviews.length} recent reviews
            </span>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="text-blue-600 mr-2" size={16} />
              <p className="text-sm text-blue-800">
                <strong>Retention Policy:</strong> Code reviews are automatically deleted after 7 days to maintain privacy and reduce storage costs.
              </p>
            </div>
          </div>

          {codeReviews.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">No code reviews found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Language</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Filename</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Created</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Age</th>
                  </tr>
                </thead>
                <tbody>
                  {codeReviews.map((review) => {
                    const createdDate = new Date(review.created_at);
                    const daysSinceCreated = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
                    const isOld = daysSinceCreated >= 7;

                    return (
                      <tr
                        key={review.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 ${
                          isOld ? 'bg-red-50' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-purple-600 text-sm font-medium">
                                {review.user_email?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-sm text-gray-900">{review.user_email}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                            {review.language}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {review.filename || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {createdDate.toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                              isOld
                                ? 'bg-red-100 text-red-800'
                                : daysSinceCreated >= 5
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {daysSinceCreated === 0 ? 'Today' : `${daysSinceCreated}d ago`}
                            {isOld && ' (Will be deleted)'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};