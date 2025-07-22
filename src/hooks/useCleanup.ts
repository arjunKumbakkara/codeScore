import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useCleanup = () => {
  useEffect(() => {
    const cleanupOldReviews = async () => {
      try {
        // Only run cleanup once per day
        const lastCleanup = localStorage.getItem('lastCleanup');
        const today = new Date().toDateString();
        
        if (lastCleanup === today) {
          return;
        }

        // Delete reviews older than 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { error } = await supabase
          .from('code_reviews')
          .delete()
          .lt('created_at', sevenDaysAgo.toISOString());

        if (!error) {
          localStorage.setItem('lastCleanup', today);
          console.log('Old code reviews cleaned up successfully');
        }
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    };

    // Run cleanup on app load
    cleanupOldReviews();

    // Set up interval to check daily (24 hours)
    const interval = setInterval(cleanupOldReviews, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
};