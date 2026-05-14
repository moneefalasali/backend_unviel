import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { Landing } from './pages/Landing';
import { SignUp } from './pages/SignUp';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { TextAnalysis } from './pages/TextAnalysis';
import { ImageAnalysis } from './pages/ImageAnalysis';
import { VideoAnalysis } from './pages/VideoAnalysis';
import { AudioAnalysis } from './pages/AudioAnalysis';
import { History } from './pages/History';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';
import { Subscription } from './pages/Subscription';
import { SocialAnalysis } from './pages/SocialAnalysis';

type Page =
  | 'landing'
  | 'signup'
  | 'login'
  | 'dashboard'
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'history'
  | 'settings'
  | 'profile'
  | 'subscription'
  | 'social';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('landing');

  useEffect(() => {
    if (!loading) {
      if (user && currentPage === 'landing') {
        setCurrentPage('dashboard');
      } else if (!user && !['landing', 'signup', 'login'].includes(currentPage)) {
        setCurrentPage('landing');
      }
    }
  }, [user, loading, currentPage]);

  const navigate = (page: Page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-accent-gold border-t-transparent mx-auto mb-4" />
          <p className="text-neutral-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  switch (currentPage) {
    case 'landing':
      return <Landing onNavigate={navigate} />;
    case 'signup':
      return <SignUp onNavigate={navigate} />;
    case 'login':
      return <Login onNavigate={navigate} />;
    case 'dashboard':
      return <Dashboard onNavigate={navigate} />;
    case 'text':
      return <TextAnalysis onNavigate={navigate} />;
    case 'image':
      return <ImageAnalysis onNavigate={navigate} />;
    case 'video':
      return <VideoAnalysis onNavigate={navigate} />;
    case 'audio':
      return <AudioAnalysis onNavigate={navigate} />;
    case 'history':
      return <History onNavigate={navigate} />;
    case 'settings':
      return <Settings onNavigate={navigate} />;
    case 'profile':
      return <Profile onNavigate={navigate} />;
    case 'subscription':
      return <Subscription onNavigate={navigate} />;
    case 'social':
      return <SocialAnalysis onNavigate={navigate} />;
    default:
      return <Landing onNavigate={navigate} />;
  }
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <AppContent />
          </SubscriptionProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
