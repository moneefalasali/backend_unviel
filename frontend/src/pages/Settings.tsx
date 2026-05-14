import { ArrowLeft, Moon, Sun, Bell, Shield, Database } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Card } from '../components/Card';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface SettingsProps {
  onNavigate: (page: string) => void;
}

export const Settings = ({ onNavigate }: SettingsProps) => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-primary-bg">
      <nav className="bg-primary-dark border-b border-primary-purple/30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => onNavigate('dashboard')}
                className="text-neutral-gray hover:text-neutral-white transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <Logo size="small" />
            </div>
            <div className="flex items-center gap-3 text-neutral-white">
              <span className="font-semibold">{t('settings')}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-white mb-3">
            {t('settings')}
          </h1>
          <p className="text-xl text-neutral-gray">
            Manage your preferences and account settings
          </p>
        </div>

        <div className="space-y-6">
          <Card className="p-6 ">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-bg  rounded-lg">
                {theme === 'dark' ? (
                  <Moon className="text-accent-gold" size={24} />
                ) : (
                  <Sun className="text-accent-gold" size={24} />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-neutral-white  mb-2">
                  Appearance
                </h3>
                <p className="text-neutral-gray  mb-4">
                  Switch between dark and light mode
                </p>
                <button
                  onClick={toggleTheme}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    theme === 'dark'
                      ? 'bg-primary-purple text-neutral-white hover:bg-accent-lavender'
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  }`}
                >
                  {theme === 'dark' ? t('lightMode') : t('darkMode')}
                </button>
              </div>
            </div>
          </Card>

          <Card className="p-6 ">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-bg  rounded-lg">
                <Bell className="text-accent-gold" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-neutral-white  mb-2">
                  Notifications
                </h3>
                <p className="text-neutral-gray  mb-4">
                  Manage your notification preferences
                </p>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-5 h-5 rounded border-2 border-primary-purple bg-primary-dark text-accent-gold focus:ring-2 focus:ring-accent-lavender cursor-pointer"
                    />
                    <span className="text-neutral-white ">
                      Email notifications
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-5 h-5 rounded border-2 border-primary-purple bg-primary-dark text-accent-gold focus:ring-2 focus:ring-accent-lavender cursor-pointer"
                    />
                    <span className="text-neutral-white ">
                      Analysis completion alerts
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 ">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-bg  rounded-lg">
                <Shield className="text-accent-gold" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-neutral-white  mb-2">
                  Privacy & Security
                </h3>
                <p className="text-neutral-gray  mb-4">
                  Manage your privacy settings and security options
                </p>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-5 h-5 rounded border-2 border-primary-purple bg-primary-dark text-accent-gold focus:ring-2 focus:ring-accent-lavender cursor-pointer"
                    />
                    <span className="text-neutral-white ">
                      Two-factor authentication
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded border-2 border-primary-purple bg-primary-dark text-accent-gold focus:ring-2 focus:ring-accent-lavender cursor-pointer"
                    />
                    <span className="text-neutral-white ">
                      Share anonymous usage data
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 ">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-bg  rounded-lg">
                <Database className="text-accent-gold" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-neutral-white  mb-2">
                  Data Management
                </h3>
                <p className="text-neutral-gray  mb-4">
                  Manage your stored data and history
                </p>
                <button className="px-6 py-2 rounded-lg font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
                  Clear All History
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
