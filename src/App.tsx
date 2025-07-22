import React, { useState } from 'react';
import { Github, BookOpen } from 'lucide-react';
import { Header } from './components/Header';
import AuthModal from './components/AuthModal';
import { CodeInput } from './components/CodeInput';
import { ReviewResult } from './components/ReviewResult';
import { ReviewHistory } from './components/ReviewHistory';
import { SQLInput } from './components/SQLInput';
import { CodeSafetySection } from './components/CodeSafetySection';
import { AboutSection } from './components/AboutSection';
import { AdminPanel } from './components/AdminPanel';
import { useAuth } from './hooks/useAuth';
import { useCleanup } from './hooks/useCleanup';
import { reviewCode } from './services/deepseek';
import { supabase } from './lib/supabase';
import { AlertCircle, Sparkles, Shield, Zap, Database, Code } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'code' | 'sql'>('code');
  const [currentReview, setCurrentReview] = useState<{
    review: string;
    language: string;
    filename?: string;
    createdAt: string;
    id?: string;
    code?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');

  // Initialize cleanup hook
  useCleanup();

  const handleCodeSubmit = async (code: string, language: string, filename?: string) => {
    if (!user) {
      setAuthMode('signup');
      setShowAuthModal(true);
      return;
    }

    setLoading(true);
    setError('');
    setCurrentReview(null);

    try {
      const review = await reviewCode(code, language);
      const createdAt = new Date().toISOString();

      // Save to database
      const { data: savedReview } = await supabase.from('code_reviews').insert({
        user_id: user.id,
        code_content: code,
        review_result: review,
        language,
        filename,
      }).select().single();

      setCurrentReview({
        review,
        language,
        filename,
        createdAt,
        id: savedReview?.id,
        code,
      });
    } catch (err) {
      console.error('Code review error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred while analyzing your code';
      
      // Check if it's an insufficient balance error and provide helpful guidance
      if (errorMessage.includes('Insufficient Balance') || errorMessage.includes('insufficient balance')) {
        setError('Your DeepSeek API account needs more credits. Please visit https://platform.deepseek.com/ to add funds to your account, then try again.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSQLSubmit = async (query: string, tableStructures: string, dataVolume: string) => {
    if (!user) {
      setAuthMode('signup');
      setShowAuthModal(true);
      return;
    }

    setLoading(true);
    setError('');
    setCurrentReview(null);

    try {
      const review = await reviewCode(query, 'sql', tableStructures, dataVolume);
      const createdAt = new Date().toISOString();

      // Save to database with additional SQL context
      const { data: savedReview } = await supabase.from('code_reviews').insert({
        user_id: user.id,
        code_content: query,
        review_result: review,
        language: 'sql',
        table_structures: tableStructures,
        data_volume: dataVolume,
      }).select().single();

      setCurrentReview({
        review,
        language: 'sql',
        createdAt,
        id: savedReview?.id,
        code: query,
      });
    } catch (err) {
      console.error('SQL review error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred while analyzing your SQL query';
      
      if (errorMessage.includes('Insufficient Balance') || errorMessage.includes('insufficient balance')) {
        setError('Your DeepSeek API account needs more credits. Please visit https://platform.deepseek.com/ to add funds to your account, then try again.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!user ? (
          <div className="text-center py-12">
            <div className="max-w-3xl mx-auto">
              <div className="flex justify-center mb-6">
                <div className="bg-purple-100 p-4 rounded-full">
                  <Sparkles className="text-purple-600" size={48} />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Score Java & SQL Queries
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Get instant, comprehensive code scoring and reviews powered by advanced AI for Java, JavaScript, Python, and SQL queries. 
                Improve your code quality, optimize SQL performance, catch bugs, and learn best practices with detailed analysis.
              </p>
              
              <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-800 text-sm">
                  <strong>🔒 Approval Required:</strong> CodeScore requires approval from Arjun Kumbakkara. 
                  Submit a request and you'll receive email confirmation once approved.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex justify-center mb-4">
                    <Database className="text-blue-500" size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    SQL Query Analysis
                  </h3>
                  <p className="text-gray-600">
                    Analyze SQL queries with production table structures and data volumes
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex justify-center mb-4">
                    <Shield className="text-green-500" size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Security Focus
                  </h3>
                  <p className="text-gray-600">
                    Identify security vulnerabilities and potential risks
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex justify-center mb-4">
                    <Code className="text-purple-500" size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Code Reviews
                  </h3>
                  <p className="text-gray-600">
                    Get instant code analysis for Java, JavaScript, and Python
                  </p>
                </div>
              </div>
              
              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={() => {
                    setAuthMode('signup');
                    setShowAuthModal(true);
                  }}
                  className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors text-lg font-semibold"
                >
                  Request Access
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user.email?.split('@')[0]}!
              </h1>
              <p className="text-gray-600">
                Submit your code or SQL queries for AI-powered review and analysis
              </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg max-w-md mx-auto">
              <button
                onClick={() => setActiveTab('code')}
                className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'code'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Code size={16} className="mr-2" />
                Code Review
              </button>
              <button
                onClick={() => setActiveTab('sql')}
                className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'sql'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Database size={16} className="mr-2" />
                SQL Review
              </button>
            </div>

            {/* Content based on active tab */}
            {activeTab === 'code' ? (
              <CodeInput onCodeSubmit={handleCodeSubmit} loading={loading} />
            ) : (
              <SQLInput onSQLSubmit={handleSQLSubmit} loading={loading} />
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center text-red-700">
                <AlertCircle size={20} className="mr-3" />
                <span>{error}</span>
              </div>
            )}

            {currentReview && (
              <ReviewResult
                review={currentReview.review}
                language={currentReview.language}
                filename={currentReview.filename}
                createdAt={currentReview.createdAt}
                reviewId={currentReview.id}
                code={currentReview.code}
              />
            )}

            <ReviewHistory />

            {user?.email === 'outsource.arjun@gmail.com' && <AdminPanel />}

            <CodeSafetySection />
          </div>
        )}
        
        <AboutSection />
      </main>

      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <img 
                src="/InstaProfile.jpeg" 
                alt="Arjun Kumbakkara" 
                className="w-12 h-12 rounded-full mr-4 object-cover border-2 border-gray-600"
              />
              <div>
                <h3 className="text-lg font-bold text-white">Arjun Kumbakkara</h3>
                <p className="text-gray-300 text-sm">Creator & Developer</p>
                <p className="text-gray-400 text-xs">AI & Software Engineering Enthusiast</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <a
                href="https://arjunkumbakkara.github.io"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Github size={20} className="mr-2" />
                GitHub
              </a>
              <a
                href="https://www.medium.com/@arjunkumbakkara"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <BookOpen size={20} className="mr-2" />
                Medium
              </a>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-700 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 CodeScore. Created by Arjun Kumbakkara. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </div>
  );
}

export default App;