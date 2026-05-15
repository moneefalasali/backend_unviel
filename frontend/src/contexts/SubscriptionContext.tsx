import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  activateSubscription as activateSubscriptionApi,
  cancelSubscription as cancelSubscriptionApi,
  fetchUserProfile,
} from '../lib/api';

type PlanType = 'free' | 'plus';
type SubscriptionStatus = 'active' | 'cancelled' | 'expired';

interface Subscription {
  plan_type: PlanType;
  subscription_status: SubscriptionStatus;
  subscription_started_at: string | null;
  subscription_expires_at: string | null;
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
      const profile = await fetchUserProfile();

      setSubscription({
        plan_type: (profile.plan_type as PlanType) || 'free',
        subscription_status: (profile.subscription_status as SubscriptionStatus) || 'active',
        subscription_started_at: profile.subscription_started_at ?? null,
        subscription_expires_at: profile.subscription_expires_at ?? null,
      });
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const activateSubscription = async () => {
    if (!user) return;

    try {
      const profile = await activateSubscriptionApi();
      setSubscription({
        plan_type: (profile.plan_type as PlanType) || 'plus',
        subscription_status: (profile.subscription_status as SubscriptionStatus) || 'active',
        subscription_started_at: profile.subscription_started_at ?? null,
        subscription_expires_at: profile.subscription_expires_at ?? null,
      });
    } catch (error) {
      console.error('Failed to activate subscription:', error);
      throw error;
    }
  };

  const cancelSubscription = async () => {
    if (!user) return;

    try {
      const profile = await cancelSubscriptionApi();
      setSubscription({
        plan_type: (profile.plan_type as PlanType) || 'free',
        subscription_status: (profile.subscription_status as SubscriptionStatus) || 'cancelled',
        subscription_started_at: profile.subscription_started_at ?? null,
        subscription_expires_at: profile.subscription_expires_at ?? null,
      });
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

  const isUnlimited = subscription?.plan_type === 'plus' && subscription?.subscription_status === 'active';

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
