import React, { useState } from 'react';
import { X, Mail, Lock, User, AlertCircle, Send } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'signup' }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showInviteRequest, setShowInviteRequest] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteReason, setInviteReason] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('');

  // Reset states when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      // Set initial mode based on prop
      if (initialMode === 'signin') {
        setShowInviteRequest(false);
        setIsSignUp(false);
      } else {
        setShowInviteRequest(true);
        setIsSignUp(true);
      }
      // Reset other states
      setError('');
      setInviteSuccess(false);
      setInviteMessage('');
      setInviteLoading(false);
      setLoading(false);
    } else {
      // Reset all states when modal closes
      setEmail('');
      setPassword('');
      setInviteEmail('');
      setInviteReason('');
      setError('');
      setInviteSuccess(false);
      setInviteMessage('');
      setShowInviteRequest(false);
      setIsSignUp(false);
      setInviteLoading(false);
      setLoading(false);
    }
  }, [isOpen, initialMode]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        if (error.message.includes('User already registered') || error.message.includes('user_already_exists')) {
          if (isSignUp) {
            setIsSignUp(false);
            setError('This email is already registered. Please sign in instead.');
          } else {
            setError('Invalid email or password. Please check your credentials and try again.');
          }
        } else if (error.message.includes('Invalid login credentials') || error.message.includes('invalid_credentials')) {
          if (isSignUp) {
            setError('Unable to create account. Please check your email format and ensure password is at least 6 characters.');
          } else {
            setError('Invalid email or password. Please check your credentials. If you\'re a new user, ensure your account has been approved and your email confirmed.');
          }
        } else {
          setError(error.message);
        }
      } else {
        onClose();
        setEmail('');
        setPassword('');
        setError('');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    setError('');

    try {
      // Use the request-approval Edge Function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/request-approval`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email: inviteEmail,
          reason: inviteReason,
          password: password
        }),
      });

      const result = await response.json();

      if (result.success) {
        setInviteSuccess(true);
        setInviteMessage(result.message || 'Your access request has been submitted! Arjun will review your request in the admin panel. You\'ll get a confirmation email once approved.');
      } else {
        setError(result.message || 'Failed to submit request. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting approval request:', err);
      setError('Failed to submit request. Please try again.');
    } finally {
      setInviteLoading(false);
    }
  };

  if (!isOpen) return null;

  if (showInviteRequest) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md transform transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Request Access</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {inviteSuccess ? (
            <div className="text-center py-8">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Send className="text-green-600" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Request Sent!</h3>
              <p className="text-gray-600 mb-4">{inviteMessage}</p>
              <p className="text-sm text-gray-500">
                You'll receive access credentials once your request is approved.
              </p>
              <button
                onClick={onClose}
                className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
                  <AlertCircle size={16} className="mr-2" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <form onSubmit={handleInviteRequest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Email Address
                  </label>
                  <div className="relative">
                    <Mail size={20} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Choose a Password
                  </label>
                  <div className="relative">
                    <Lock size={20} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Choose your password"
                      required
                      minLength={6}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    You'll use this password to sign in once approved
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Access
                  </label>
                  <textarea
                    value={inviteReason}
                    onChange={(e) => setInviteReason(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Please explain why you need access to CodeScore..."
                    rows={4}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                >
                  {inviteLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send size={20} className="mr-2" />
                      Send Access Request
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have access?
                  <button
                    onClick={() => {
                      setShowInviteRequest(false);
                      setIsSignUp(false);
                    }}
                    className="ml-1 text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md transform transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isSignUp ? 'Access Required' : 'Welcome Back'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {isSignUp && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>CodeScore requires approval.</strong> You need approval to create an account unless you're the admin. 
              If you don't have access yet, please request access.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
            <AlertCircle size={16} className="mr-2" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail size={20} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock size={20} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Enter your password"
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <User size={20} className="mr-2" />
                {isSignUp ? 'Create Account' : 'Sign In'}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {isSignUp ? 'Already have an account?' : 'Need to create an account?'}
            <button
              onClick={() => {
                setError('');
                if (isSignUp) {
                  setShowInviteRequest(true);
                } else {
                  setIsSignUp(true);
                  setShowInviteRequest(true);
                }
              }}
              className="ml-1 text-purple-600 hover:text-purple-700 font-medium"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
            <p className="text-sm text-gray-600 mt-2">
              Don't have access yet?
              <button
                onClick={() => {
                  setError('');
                  setShowInviteRequest(true);
                  setIsSignUp(true);
                }}
                className="ml-1 text-purple-600 hover:text-purple-700 font-medium"
              >
                Request access
              </button>
            </p>
        </div>
      </div>
    </div>
  );
}