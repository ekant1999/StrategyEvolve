import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { User } from '../types';

// Check localStorage for saved user on app load
export const useAutoLogin = () => {
  const { user, setUser } = useAppStore();

  useEffect(() => {
    if (!user) {
      // Check localStorage for saved user
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const userData: User = JSON.parse(savedUser);
          // Convert created_at string back to Date if needed
          if (userData.created_at && typeof userData.created_at === 'string') {
            userData.created_at = new Date(userData.created_at);
          }
          setUser(userData);
          console.log('Restored user from localStorage:', userData.email);
        } catch (error) {
          console.error('Failed to parse saved user:', error);
          localStorage.removeItem('user');
        }
      }
    }
  }, [user, setUser]);
};

