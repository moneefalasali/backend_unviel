import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'ar';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  en: {
    welcome: 'Welcome back',
    selectMedia: 'Select a media type to begin your content analysis',
    text: 'Text',
    image: 'Image',
    video: 'Video',
    audio: 'Audio',
    history: 'History',
    settings: 'Settings',
    language: 'Language',
    logout: 'Logout',
    login: 'Log In',
    home: 'Home',
    analyzeText: 'Analyze Text',
    analyzeImage: 'Analyze Image',
    analyzeVideo: 'Analyze Video',
    analyzeAudio: 'Analyze Audio',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    profile: 'Profile',
    subscription: 'Subscription',
    unveilPlus: 'Unveil Plus',
  },
  es: {
    welcome: 'Bienvenido de nuevo',
    selectMedia: 'Selecciona un tipo de medio para comenzar tu análisis de contenido',
    text: 'Texto',
    image: 'Imagen',
    video: 'Video',
    audio: 'Audio',
    history: 'Historial',
    settings: 'Configuración',
    language: 'Idioma',
    logout: 'Cerrar sesión',
    login: 'Iniciar sesión',
    home: 'Inicio',
    analyzeText: 'Analizar Texto',
    analyzeImage: 'Analizar Imagen',
    analyzeVideo: 'Analizar Video',
    analyzeAudio: 'Analizar Audio',
    darkMode: 'Modo Oscuro',
    lightMode: 'Modo Claro',
    profile: 'Perfil',
    subscription: 'Suscripción',
    unveilPlus: 'Unveil Plus',
  },
  fr: {
    welcome: 'Bon retour',
    selectMedia: 'Sélectionnez un type de média pour commencer votre analyse de contenu',
    text: 'Texte',
    image: 'Image',
    video: 'Vidéo',
    audio: 'Audio',
    history: 'Historique',
    settings: 'Paramètres',
    language: 'Langue',
    logout: 'Se déconnecter',
    login: 'Se connecter',
    home: 'Accueil',
    analyzeText: 'Analyser le texte',
    analyzeImage: 'Analyser l\'image',
    analyzeVideo: 'Analyser la vidéo',
    analyzeAudio: 'Analyser l\'audio',
    darkMode: 'Mode Sombre',
    lightMode: 'Mode Clair',
    profile: 'Profil',
    subscription: 'Abonnement',
    unveilPlus: 'Unveil Plus',
  },
  de: {
    welcome: 'Willkommen zurück',
    selectMedia: 'Wählen Sie einen Medientyp aus, um Ihre Inhaltsanalyse zu beginnen',
    text: 'Text',
    image: 'Bild',
    video: 'Video',
    audio: 'Audio',
    history: 'Verlauf',
    settings: 'Einstellungen',
    language: 'Sprache',
    logout: 'Abmelden',
    login: 'Anmelden',
    home: 'Startseite',
    analyzeText: 'Text analysieren',
    analyzeImage: 'Bild analysieren',
    analyzeVideo: 'Video analysieren',
    analyzeAudio: 'Audio analysieren',
    darkMode: 'Dunkler Modus',
    lightMode: 'Heller Modus',
    profile: 'Profil',
    subscription: 'Abonnement',
    unveilPlus: 'Unveil Plus',
  },
  zh: {
    welcome: '欢迎回来',
    selectMedia: '选择媒体类型开始内容分析',
    text: '文本',
    image: '图像',
    video: '视频',
    audio: '音频',
    history: '历史',
    settings: '设置',
    language: '语言',
    logout: '登出',
    login: '登录',
    home: '主页',
    analyzeText: '分析文本',
    analyzeImage: '分析图像',
    analyzeVideo: '分析视频',
    analyzeAudio: '分析音频',
    darkMode: '深色模式',
    lightMode: '浅色模式',
    profile: '个人资料',
    subscription: '订阅',
    unveilPlus: 'Unveil Plus',
  },
  ja: {
    welcome: 'おかえりなさい',
    selectMedia: 'コンテンツ分析を開始するメディアタイプを選択してください',
    text: 'テキスト',
    image: '画像',
    video: 'ビデオ',
    audio: 'オーディオ',
    history: '履歴',
    settings: '設定',
    language: '言語',
    logout: 'ログアウト',
    login: 'ログイン',
    home: 'ホーム',
    analyzeText: 'テキストを分析',
    analyzeImage: '画像を分析',
    analyzeVideo: 'ビデオを分析',
    analyzeAudio: 'オーディオを分析',
    darkMode: 'ダークモード',
    lightMode: 'ライトモード',
    profile: 'プロフィール',
    subscription: 'サブスクリプション',
    unveilPlus: 'Unveil Plus',
  },
  ar: {
    welcome: 'مرحبا بعودتك',
    selectMedia: 'حدد نوع الوسائط لبدء تحليل المحتوى',
    text: 'نص',
    image: 'صورة',
    video: 'فيديو',
    audio: 'صوت',
    history: 'التاريخ',
    settings: 'الإعدادات',
    language: 'اللغة',
    logout: 'تسجيل الخروج',
    login: 'تسجيل الدخول',
    home: 'الرئيسية',
    analyzeText: 'تحليل النص',
    analyzeImage: 'تحليل الصورة',
    analyzeVideo: 'تحليل الفيديو',
    analyzeAudio: 'تحليل الصوت',
    darkMode: 'الوضع الداكن',
    lightMode: 'الوضع الفاتح',
    profile: 'الملف الشخصي',
    subscription: 'الاشتراك',
    unveilPlus: 'Unveil Plus',
  },
};

const languageNames: Record<Language, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  zh: '中文',
  ja: '日本語',
  ar: 'العربية',
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  availableLanguages: typeof languageNames;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, availableLanguages: languageNames }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
