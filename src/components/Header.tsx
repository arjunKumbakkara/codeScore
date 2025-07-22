import React from 'react';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './AuthModal';

interface HeaderProps {
  // Remove onAuthClick prop since we'll handle modals internally
}

export const Header: React.FC<HeaderProps> = () => {
  const { user, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<'signin' | 'signup'>('signin');

  const handleSignOut = async () => {
    await signOut();
  };

  const handleSignInClick = () => {
    setAuthMode('signin');
    setShowAuthModal(true);
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <img 
              src="/codescore-removebg-preview.png" 
              alt="CodeScore Logo" 
              className="h-32 w-auto mr-4"
            />
            <h1 className="text-xl font-bold text-gray-900">
              <span className="text-sm text-gray-500 ml-2">by Arjun Kumbakkara</span>
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-sm text-gray-700">
                  <User size={16} className="mr-2" />
                  {user.email}
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LogOut size={16} className="mr-2" />
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignInClick}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
              >
                <User size={16} className="mr-2" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
      </header>
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </>
  );
};