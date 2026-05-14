import { useState } from 'react';
import { ArrowLeft, Crown, Check, ExternalLink } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';

interface SubscriptionProps {
  onNavigate: (page: string) => void;
}

export const Subscription = ({ onNavigate }: SubscriptionProps) => {
  const { user } = useAuth();
  const { subscription, isUnlimited, activateSubscription, cancelSubscription } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleActivateDemo = async () => {
    setLoading(true);
    setError('');

    try {
      await activateSubscription();
      setSuccess(true);
      setLoading(false);

      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err) {
      setError('Failed to activate subscription. Please try again.');
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your Unveil Plus subscription?')) {
      return;
    }

    try {
      setLoading(true);
      await cancelSubscription();
      setLoading(false);
    } catch (err) {
      setError('Failed to cancel subscription. Please try again.');
      setLoading(false);
    }
  };

  const features = [
    'Unlimited AI content analysis checks',
    'Priority processing for faster results',
    'Advanced analysis with detailed reports',
    'Batch upload and analysis',
    'API access for integration',
    'Export results in multiple formats',
    'Email support with priority response',
    'Early access to new features',
  ];

  return (
    <div className="min-h-screen bg-primary-bg">
      <nav className="bg-primary-dark border-b border-primary-purple/30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => onNavigate('dashboard')}
                className="text-neutral-gray hover:text-neutral-white  transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <Logo size="small" />
            </div>
            <div className="flex items-center gap-3 text-neutral-white ">
              <Crown size={24} className="text-accent-gold" />
              <span className="font-semibold">Subscription</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-neutral-white mb-4">
            Upgrade to Unveil Plus
          </h1>
          <p className="text-xl text-neutral-gray">
            Unlock unlimited AI content analysis and premium features
          </p>
        </div>

        <div className="mb-8 bg-accent-gold/10 border border-accent-gold text-neutral-white px-6 py-4 rounded-xl text-center">
          <p className="font-semibold text-lg">
            Payments are securely handled عبر منصة سلة
          </p>
        </div>

        {success && (
          <div className="mb-8 bg-green-500/10 border border-green-500 text-green-400 px-6 py-4 rounded-xl text-center">
            <p className="font-semibold text-lg mb-1">Subscription Activated!</p>
            <p className="text-sm">Welcome to Unveil Plus. Enjoy unlimited access.</p>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <Card className="p-8 ">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-neutral-white  mb-2">
                Free Plan
              </h3>
              <div className="text-4xl font-bold text-neutral-gray  mb-4">
                $0<span className="text-lg">/month</span>
              </div>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3 text-neutral-gray ">
                <Check size={20} className="text-primary-purple flex-shrink-0 mt-0.5" />
                <span>10 analysis checks per month</span>
              </li>
              <li className="flex items-start gap-3 text-neutral-gray ">
                <Check size={20} className="text-primary-purple flex-shrink-0 mt-0.5" />
                <span>Basic analysis reports</span>
              </li>
              <li className="flex items-start gap-3 text-neutral-gray ">
                <Check size={20} className="text-primary-purple flex-shrink-0 mt-0.5" />
                <span>Standard processing speed</span>
              </li>
            </ul>
            {subscription?.plan_type === 'free' ? (
              <Button variant="outline" fullWidth disabled>
                Current Plan
              </Button>
            ) : (
              <Button variant="secondary" fullWidth onClick={handleCancelSubscription} disabled={loading}>
                Downgrade to Free
              </Button>
            )}
          </Card>

          <Card className="p-8 border-2 border-accent-gold relative overflow-hidden">
            {!isUnlimited && (
              <div className="absolute top-4 right-4 bg-accent-gold text-primary-dark px-3 py-1 rounded-full text-sm font-bold">
                POPULAR
              </div>
            )}
            {isUnlimited && (
              <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                ACTIVE
              </div>
            )}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-neutral-white  mb-2">
                Unveil Plus
              </h3>
              <div className="text-5xl font-bold text-accent-gold mb-4">
                $29<span className="text-lg">/month</span>
              </div>
              <p className="text-neutral-gray  text-sm">
                Billed monthly, cancel anytime
              </p>
            </div>
            <ul className="space-y-3 mb-8">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3 text-neutral-white ">
                  <Check size={20} className="text-accent-gold flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            {!isUnlimited && (
              <div className="space-y-3">
                <Button fullWidth onClick={handleActivateDemo} disabled={loading}>
                  <Crown className="mr-2" size={18} />
                  {loading ? 'Activating...' : 'Activate Demo Plus'}
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => window.open('https://salla.sa/twon0098', '_blank')}
                >
                  <ExternalLink className="mr-2" size={18} />
                  Subscribe via Salla
                </Button>
              </div>
            )}
            {isUnlimited && (
              <Button variant="outline" fullWidth disabled>
                Current Plan
              </Button>
            )}
          </Card>
        </div>

        {error && (
          <div className="mb-8 bg-red-500/10 border border-red-500 text-red-400 px-6 py-4 rounded-xl text-center">
            <p className="font-semibold">{error}</p>
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-neutral-gray text-sm">
            By subscribing, you agree to our Terms of Service and Privacy Policy.
            Your subscription will auto-renew monthly unless cancelled.
          </p>
        </div>
      </div>
    </div>
  );
};
