import React, { useState, useEffect } from 'react';
import { History, Search, Filter, Calendar, Code, FileText, ChevronDown, Share2, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { CodeReview } from '../types';
import { useAuth } from '../hooks/useAuth';
import { ShareModal } from './ShareModal';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const ReviewHistory: React.FC = () => {
  const [reviews, setReviews] = useState<CodeReview[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<CodeReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [expandedReview, setExpandedReview] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null);
  const [shareModalData, setShareModalData] = useState<{
    isOpen: boolean;
    reviewId: string;
    reviewData: any;
  }>({
    isOpen: false,
    reviewId: '',
    reviewData: null,
  });
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchReviews();
    }
  }, [user]);

  useEffect(() => {
    filterReviews();
  }, [reviews, searchTerm, selectedLanguage]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('code_reviews')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterReviews = () => {
    let filtered = reviews;

    if (searchTerm) {
      filtered = filtered.filter(review =>
        review.code_content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.review_result.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.filename?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(review => review.language === selectedLanguage);
    }

    setFilteredReviews(filtered);
  };

  const languages = [...new Set(reviews.map(review => review.language))];

  const handleShare = (review: CodeReview) => {
    setShareModalData({
      isOpen: true,
      reviewId: review.id,
      reviewData: {
        code: review.code_content,
        review: review.review_result,
        language: review.language,
        filename: review.filename,
        createdAt: review.created_at,
      },
    });
  };

  const downloadReviewAsPDF = async (review: CodeReview) => {
    setDownloadingPdf(review.id);
    try {
      // Create a temporary container with better styling for PDF
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '800px';
      tempContainer.style.backgroundColor = 'white';
      tempContainer.style.padding = '40px';
      tempContainer.style.fontFamily = 'Arial, sans-serif';
      tempContainer.style.fontSize = '14px';
      tempContainer.style.lineHeight = '1.6';
      tempContainer.style.color = '#333';
      
      // Format markdown for PDF
      const formatMarkdownForPDF = (text: string) => {
        return text
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/`(.*?)`/g, '<code style="background: #f3f4f6; padding: 2px 4px; border-radius: 3px; font-family: monospace;">$1</code>')
          .replace(/\n\n/g, '</p><p style="margin: 15px 0;">')
          .replace(/\n/g, '<br>');
      };
      
      // Create PDF content
      const pdfContent = `
        <div style="margin-bottom: 30px; border-bottom: 2px solid #6366f1; padding-bottom: 20px;">
          <h1 style="color: #6366f1; margin: 0 0 10px 0; font-size: 28px;">CodeScore Report</h1>
          <p style="margin: 0; color: #666; font-size: 16px;">AI-Powered Code Analysis by Arjun Kumbakkara</p>
        </div>
        
        <div style="margin-bottom: 25px;">
          <h2 style="color: #374151; margin: 0 0 15px 0; font-size: 20px;">Review Details</h2>
          <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <p style="margin: 5px 0;"><strong>Language:</strong> ${review.language}</p>
            ${review.filename ? `<p style="margin: 5px 0;"><strong>File:</strong> ${review.filename}</p>` : ''}
            <p style="margin: 5px 0;"><strong>Generated:</strong> ${new Date(review.created_at).toLocaleString()}</p>
          </div>
        </div>
        
        <div style="margin-bottom: 25px;">
          <h2 style="color: #374151; margin: 0 0 15px 0; font-size: 20px;">Code Submitted</h2>
          <div style="background: #f9fafb; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 12px; white-space: pre-wrap; overflow-wrap: break-word;">
            ${review.code_content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
          </div>
        </div>
        
        <div style="margin-bottom: 25px;">
          <h2 style="color: #374151; margin: 0 0 15px 0; font-size: 20px;">Code Analysis & Score</h2>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #6366f1;">
            <p style="margin: 15px 0;">${formatMarkdownForPDF(review.review_result)}</p>
          </div>
        </div>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
          <p>Generated by CodeScore - AI-Powered Code Review Platform</p>
          <p>Created by Arjun Kumbakkara | ${new Date().toLocaleDateString()}</p>
        </div>
      `;
      
      tempContainer.innerHTML = pdfContent;
      document.body.appendChild(tempContainer);
      
      // Generate canvas from the temporary container
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      // Remove temporary container
      document.body.removeChild(tempContainer);
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      // Add first page
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Generate filename
      const fileName = review.filename 
        ? `CodeScore_${review.filename.replace(/\.[^/.]+$/, '')}_${new Date(review.created_at).toISOString().split('T')[0]}.pdf`
        : `CodeScore_${review.language}_${new Date(review.created_at).toISOString().split('T')[0]}.pdf`;
      
      // Download the PDF
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloadingPdf(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center mb-6">
        <History className="text-purple-600 mr-3" size={28} />
        <h2 className="text-2xl font-bold text-gray-900">Review History</h2>
        <span className="ml-auto text-sm text-gray-500">
          {filteredReviews.length} review{filteredReviews.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Reviews
          </label>
          <div className="relative">
            <Search size={20} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by code content, filename, or review..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Language
          </label>
          <div className="relative">
            <Filter size={20} className="absolute left-3 top-3 text-gray-400" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none"
            >
              <option value="all">All Languages</option>
              {languages.map(lang => (
                <option key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>
            <ChevronDown size={20} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {filteredReviews.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">No reviews found matching your criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedReview(expandedReview === review.id ? null : review.id)}
              >
                <div className="flex items-center">
                  <Code className="text-purple-600 mr-3" size={20} />
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {review.filename || `${review.language} Code`}
                    </h4>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Calendar size={16} className="mr-1" />
                      {new Date(review.created_at).toLocaleDateString()}
                      <span className="mx-2">•</span>
                      <span className="capitalize">{review.language}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadReviewAsPDF(review);
                    }}
                    disabled={downloadingPdf === review.id}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Download as PDF"
                  >
                    {downloadingPdf === review.id ? (
                      <div className="w-4 h-4 border border-green-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Download size={16} />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(review);
                    }}
                    className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Share this score"
                  >
                    <Share2 size={16} />
                  </button>
                  <ChevronDown
                    className={`text-gray-400 transition-transform ${
                      expandedReview === review.id ? 'rotate-180' : ''
                    }`}
                    size={20}
                  />
                </div>
              </div>

              {expandedReview === review.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="mb-4">
                    <h5 className="font-medium text-gray-900 mb-2">Code:</h5>
                    <pre className="bg-gray-50 p-3 rounded-lg text-sm overflow-x-auto">
                      <code>{review.code_content}</code>
                    </pre>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Score & Analysis:</h5>
                    <div className="prose prose-sm max-w-none">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: review.review_result
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\*(.*?)\*/g, '<em>$1</em>')
                            .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
                            .replace(/\n\n/g, '</p><p>')
                            .replace(/\n/g, '<br>'),
                        }}
                        className="text-gray-700 leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          <ShareModal
            isOpen={shareModalData.isOpen}
            onClose={() => setShareModalData({ isOpen: false, reviewId: '', reviewData: null })}
            reviewId={shareModalData.reviewId}
            reviewData={shareModalData.reviewData || {}}
          />
        </div>
      )}
    </div>
  );
};