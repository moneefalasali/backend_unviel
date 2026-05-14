import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

type PlanType = 'free' | 'plus';
type SubscriptionStatus = 'active' | 'cancelled' | 'expired';

interface Subscription {
  id: string;
  plan_type: PlanType;
  status: SubscriptionStatus;
  started_at: string;
  expires_at: string | null;
}

interface SubscriptionContextType {
  subscription: Subscription | null;
  loading: boolean;
  isUnlimited: boolean;
  activateSubscription: () => Promise<void>;
  cancelSubscription: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSubscription(data);
      } else {
        const { data: newSub, error: insertError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: user.id,
            plan_type: 'free',
            status: 'active',
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setSubscription(newSub);
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const activateSubscription = async () => {
    if (!user) return;

    try {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          plan_type: 'plus',
          status: 'active',
          started_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setSubscription(data);
    } catch (error) {
      console.error('Failed to activate subscription:', error);
      throw error;
    }
  };

  const cancelSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          plan_type: 'free',
          status: 'cancelled',
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setSubscription(data);
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw error;
    }
  };

  const refreshSubscription = async () => {
    await fetchSubscription();
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  const isUnlimited = subscription?.plan_type === 'plus' && subscription?.status === 'active';

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        loading,
        isUnlimited,
        activateSubscription,
        cancelSubscription,
        refreshSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
