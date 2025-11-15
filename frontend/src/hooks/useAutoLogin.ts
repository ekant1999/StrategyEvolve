import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

// Auto-create a demo user for the hackathon demo
export const useAutoLogin = () => {
  const { user, setUser } = useAppStore();

  useEffect(() => {
    if (!user) {
      // Create a demo user automatically
      const demoUser = {
        id: 'demo_user_001',
        email: 'demo@strategyevolve.ai',
        name: 'Demo User',
        fastino_user_id: 'demo_fastino_001',
        created_at: new Date(),
      };
      
      setUser(demoUser);
      console.log('Auto-logged in as demo user');
    }
  }, [user, setUser]);
};

