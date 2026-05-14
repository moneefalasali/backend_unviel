import { useState } from 'react';
import { Logo } from '../components/Logo';
import { Card } from '../components/Card';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { HamburgerMenu } from '../components/HamburgerMenu';
import { FileText, Image, Video, Music, Home, History, Crown, Share2 } from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export const Dashboard = ({ onNavigate }: DashboardProps) => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const { subscription, isUnlimited } = useSubscription();
  const [activeTab, setActiveTab] = useState('home');

  const mediaTypes = [
    {
      id: 'text',
      title: t('text'),
      icon: FileText,
      description: 'Analyze linguistic patterns and estimate AI assistance',
      color: 'from-blue-500 to-blue-700',
    },
    {
      id: 'image',
      title: t('image'),
      icon: Image,
      description: 'Analyze visual patterns and metadata indicators',
      color: 'from-green-500 to-green-700',
    },
    {
      id: 'video',
      title: t('video'),
      icon: Video,
      description: 'Analyze temporal patterns and manipulation indicators',
      color: 'from-purple-500 to-purple-700',
    },
    {
      id: 'audio',
      title: t('audio'),
      icon: Music,
      description: 'Analyze speech patterns and frequency characteristics',
      color: 'from-orange-500 to-orange-700',
    },
    {
      id: 'social',
      title: 'Social Media',
      icon: Share2,
      description: 'Connect accounts and analyze posts from Twitter, LinkedIn, and Instagram',
      color: 'from-pink-500 to-pink-700',
    },
  ];

  return (
    <div className="min-h-screen bg-primary-bg">
      <nav className="bg-primary-dark border-b border-primary-purple/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <Logo size="small" />

            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => onNavigate('history')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'history'
                    ? 'bg-primary-purple text-neutral-white'
                    : 'text-neutral-gray hover:text-neutral-white'
                }`}
              >
                <History size={18} />
                <span className="hidden sm:inline">{t('history')}</span>
              </button>

              <button
                onClick={() => setActiveTab('home')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'home'
                    ? 'bg-primary-purple text-neutral-white'
                    : 'text-neutral-gray hover:text-neutral-white'
                }`}
              >
                <Home size={18} />
                <span className="hidden sm:inline">{t('home')}</span>
              </button>

              <HamburgerMenu onNavigate={onNavigate} />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-neutral-white mb-3">
                {t('welcome')}, {profile?.full_name || user?.email}
              </h1>
              <p className="text-xl text-neutral-gray">
                {t('selectMedia')}
              </p>
            </div>
            {isUnlimited && (
              <Card className="p-4 bg-gradient-to-br from-accent-gold to-yellow-600 border-2 border-accent-gold">
                <div className="flex items-center gap-2 text-primary-dark">
                  <Crown size={24} />
                  <div>
                    <p className="font-bold text-lg">Unveil Plus</p>
                    <p className="text-sm">Unlimited Access</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mediaTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Card
                key={type.id}
                hover
                onClick={() => onNavigate(type.id)}
                className="p-6 cursor-pointer"
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-4`}>
                  <Icon className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-neutral-white mb-2">
                  {type.title}
                </h3>
                <p className="text-neutral-gray text-sm">
                  {type.description}
                </p>
              </Card>
            );
          })}
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold text-neutral-white mb-6">
            Quick Stats
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6">
              <p className="text-neutral-gray text-sm mb-2">Total Analyses</p>
              <p className="text-4xl font-bold text-accent-gold">0</p>
            </Card>
            <Card className="p-6">
              <p className="text-neutral-gray text-sm mb-2">This Month</p>
              <p className="text-4xl font-bold text-accent-lavender">0</p>
            </Card>
            <Card className="p-6">
              <p className="text-neutral-gray text-sm mb-2">Accuracy Rate</p>
              <p className="text-4xl font-bold text-green-400">98%</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
