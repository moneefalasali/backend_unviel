import { useState, useRef, useEffect } from 'react';
import { Menu, X, Globe, Settings, User, CreditCard, Moon, Sun, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage, Language } from '../contexts/LanguageContext';

interface HamburgerMenuProps {
  onNavigate: (page: string) => void;
}

export const HamburgerMenu = ({ onNavigate }: HamburgerMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t, availableLanguages } = useLanguage();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowLanguages(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setShowLanguages(false);
  };

  const handleLogout = async () => {
    await signOut();
    setIsOpen(false);
    onNavigate('landing');
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-neutral-gray hover:text-neutral-white transition-colors rounded-lg hover:bg-primary-bg"
        aria-label="Menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-primary-dark rounded-xl shadow-2xl border border-primary-purple/30 overflow-hidden z-50 animate-fade-in">
          <div className="py-2">
            <button
              onClick={() => setShowLanguages(!showLanguages)}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-primary-bg transition-colors text-neutral-white"
            >
              <Globe size={20} className="text-accent-gold" />
              <span className="flex-1 text-left">{t('language')}</span>
              <span className="text-sm text-neutral-gray">
                {availableLanguages[language]}
              </span>
            </button>

            {showLanguages && (
              <div className="bg-primary-bg/50 border-t border-b border-primary-purple/20">
                {(Object.keys(availableLanguages) as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageSelect(lang)}
                    className={`w-full px-8 py-2 text-left hover:bg-primary-bg transition-colors ${
                      language === lang
                        ? 'text-accent-gold font-medium'
                        : 'text-neutral-gray'
                    }`}
                  >
                    {availableLanguages[lang]}
                  </button>
                ))}
              </div>
            )}

            <div className="border-t border-primary-purple/20 my-2" />

            <button
              onClick={() => {
                onNavigate('settings');
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-primary-bg transition-colors text-neutral-white"
            >
              <Settings size={20} className="text-accent-gold" />
              <span>{t('settings')}</span>
            </button>

            <button
              onClick={() => {
                toggleTheme();
              }}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-primary-bg transition-colors text-neutral-white"
            >
              {theme === 'dark' ? (
                <>
                  <Sun size={20} className="text-accent-gold" />
                  <span>{t('lightMode')}</span>
                </>
              ) : (
                <>
                  <Moon size={20} className="text-accent-gold" />
                  <span>{t('darkMode')}</span>
                </>
              )}
            </button>

            <div className="border-t border-primary-purple/20 my-2" />

            <button
              onClick={() => {
                onNavigate('profile');
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-primary-bg transition-colors text-neutral-white"
            >
              <User size={20} className="text-accent-gold" />
              <span>{t('profile')}</span>
            </button>

            <button
              onClick={() => {
                onNavigate('subscription');
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-primary-bg transition-colors text-neutral-white"
            >
              <CreditCard size={20} className="text-accent-gold" />
              <span>{t('subscription')}</span>
            </button>

            <div className="border-t border-primary-purple/20 my-2" />

            {user ? (
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-500/10 transition-colors text-red-400"
              >
                <LogOut size={20} />
                <span>{t('logout')}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onNavigate('login');
                  setIsOpen(false);
                }}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-primary-bg transition-colors text-neutral-white"
              >
                <LogIn size={20} className="text-accent-gold" />
                <span>{t('login')}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
