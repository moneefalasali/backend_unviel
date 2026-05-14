import { useState, useEffect } from 'react';
import { ArrowLeft, Share2, Loader2, AlertCircle, CheckCircle2, Globe, Twitter, Linkedin, Instagram, ExternalLink, BarChart3, RefreshCw } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../contexts/AuthContext';

interface SocialAnalysisProps {
  onNavigate: (page: string) => void;
}

export const SocialAnalysis = ({ onNavigate }: SocialAnalysisProps) => {
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);
  const [connectedPosts, setConnectedPosts] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

  useEffect(() => {
    fetchSocialData();
  }, []);

  const fetchSocialData = async () => {
    setLoadingData(true);
    try {
      const [accountsRes, postsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/social/accounts`),
        fetch(`${API_BASE_URL}/social/posts`)
      ]);
      
      if (accountsRes.ok) setConnectedAccounts(await accountsRes.json());
      if (postsRes.ok) setConnectedPosts(await postsRes.json());
    } catch (err) {
      console.error("Failed to fetch social data", err);
    } finally {
      setLoadingData(false);
    }
  };

  const connectAccount = (provider: string) => {
    window.location.href = `${API_BASE_URL}/auth/${provider}/redirect`;
  };

  const analyzePost = async () => {
    if (!url) return;
    
    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/analyze-social-post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Analysis failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

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
              <Share2 size={24} className="text-accent-gold" />
              <span className="font-semibold">Social Media AI Platform</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Connections & Quick Analysis */}
          <div className="lg:col-span-1 space-y-8">
            <section>
              <h2 className="text-xl font-bold text-neutral-white mb-4 flex items-center gap-2">
                <RefreshCw size={20} className="text-primary-purple" />
                Connect Accounts
              </h2>
              <Card className="p-6 space-y-4">
                <Button 
                  onClick={() => connectAccount('twitter')}
                  className="w-full bg-[#1DA1F2] hover:bg-[#1a91da] text-white flex items-center justify-center gap-3"
                >
                  <Twitter size={20} />
                  Connect X / Twitter
                </Button>
                <Button 
                  onClick={() => connectAccount('linkedin')}
                  className="w-full bg-[#0077B5] hover:bg-[#006396] text-white flex items-center justify-center gap-3"
                >
                  <Linkedin size={20} />
                  Connect LinkedIn
                </Button>
                <Button 
                  onClick={() => connectAccount('instagram')}
                  className="w-full bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-90 text-white flex items-center justify-center gap-3"
                >
                  <Instagram size={20} />
                  Connect Instagram
                </Button>
              </Card>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-white mb-4 flex items-center gap-2">
                <Globe size={20} className="text-accent-gold" />
                Quick URL Analysis
              </h2>
              <Card className="p-6">
                <div className="space-y-4">
                  <Input
                    placeholder="Paste post URL..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={analyzing}
                  />
                  <Button onClick={analyzePost} disabled={analyzing || !url} className="w-full">
                    {analyzing ? <Loader2 className="animate-spin" /> : 'Analyze Now'}
                  </Button>
                </div>
              </Card>
            </section>

            {connectedAccounts.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-neutral-white mb-4">Connected Accounts</h2>
                <div className="space-y-3">
                  {connectedAccounts.map((acc, i) => (
                    <Card key={i} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-purple/20 flex items-center justify-center text-primary-purple">
                          {acc.platform === 'twitter' ? <Twitter size={20} /> : acc.platform === 'linkedin' ? <Linkedin size={20} /> : <Instagram size={20} />}
                        </div>
                        <div>
                          <p className="text-neutral-white font-medium">@{acc.username}</p>
                          <p className="text-neutral-gray text-xs capitalize">{acc.platform}</p>
                        </div>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column: Dashboard & Results */}
          <div className="lg:col-span-2 space-y-8">
            {result ? (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-neutral-white">Analysis Result</h2>
                  <Button variant="outline" size="sm" onClick={() => setResult(null)}>Clear</Button>
                </div>
                <Card className={`p-8 border-2 ${result.overall_ai_probability > 50 ? 'border-red-500 bg-red-500/5' : 'border-green-500 bg-green-500/5'}`}>
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 rounded-full bg-primary-purple text-xs font-bold text-white uppercase tracking-wider">
                          {result.platform}
                        </span>
                        <span className="text-neutral-gray text-sm">{result.post_type}</span>
                      </div>
                      <h2 className="text-3xl font-bold text-neutral-white">
                        {result.classification}
                      </h2>
                    </div>
                    <div className="text-right">
                      <p className="text-neutral-gray text-sm mb-1">Confidence Score</p>
                      <p className="text-2xl font-bold text-accent-gold">
                        {Math.round(result.confidence * 100)}%
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-neutral-white font-medium">AI Probability</span>
                        <span className="text-accent-gold font-bold">{result.overall_ai_probability}%</span>
                      </div>
                      <div className="w-full bg-primary-dark rounded-full h-3">
                        <div
                          className="h-3 rounded-full bg-accent-gold transition-all duration-1000"
                          style={{ width: `${result.overall_ai_probability}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-neutral-white font-medium">Human Probability</span>
                        <span className="text-green-400 font-bold">{result.human_probability}%</span>
                      </div>
                      <div className="w-full bg-primary-dark rounded-full h-3">
                        <div
                          className="h-3 rounded-full bg-green-400 transition-all duration-1000"
                          style={{ width: `${result.human_probability}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary-bg/50 rounded-xl p-6 border border-primary-purple/20">
                    <h3 className="text-lg font-semibold text-neutral-white mb-3">Analysis Explanation</h3>
                    <p className="text-neutral-gray leading-relaxed">
                      {result.explanation}
                    </p>
                  </div>
                </Card>
              </section>
            ) : (
              <section>
                <h2 className="text-2xl font-bold text-neutral-white mb-6 flex items-center gap-3">
                  <BarChart3 className="text-accent-gold" />
                  Connected Posts Analysis
                </h2>
                
                {loadingData ? (
                  <div className="flex flex-col items-center justify-center py-20 text-neutral-gray">
                    <Loader2 className="animate-spin mb-4" size={40} />
                    <p>Fetching your latest social media content...</p>
                  </div>
                ) : connectedPosts.length > 0 ? (
                  <div className="space-y-4">
                    {connectedPosts.map((post) => (
                      <Card key={post.id} className="p-6 hover:border-primary-purple/50 transition-all">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-xs font-bold text-primary-purple uppercase">{post.platform}</span>
                              <span className="text-neutral-gray text-xs">• {post.created_at}</span>
                            </div>
                            <p className="text-neutral-white mb-4 line-clamp-2">{post.content}</p>
                            <div className="flex items-center gap-6">
                              <div className="flex items-center gap-2">
                                <div className="w-24 bg-primary-dark h-2 rounded-full overflow-hidden">
                                  <div className="bg-accent-gold h-full" style={{ width: `${post.overall_ai_probability}%` }} />
                                </div>
                                <span className="text-xs text-neutral-gray">AI: {post.overall_ai_probability}%</span>
                              </div>
                              <span className={`text-xs font-bold px-2 py-1 rounded ${post.overall_ai_probability > 50 ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                                {post.classification}
                              </span>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="shrink-0">
                            <ExternalLink size={14} />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 text-center">
                    <Share2 size={48} className="mx-auto text-neutral-gray/30 mb-4" />
                    <h3 className="text-xl font-bold text-neutral-white mb-2">No connected accounts found</h3>
                    <p className="text-neutral-gray mb-6">Connect your social media accounts to automatically analyze your posts for AI content.</p>
                    <div className="flex justify-center gap-4">
                      <Button onClick={() => connectAccount('twitter')} size="sm">Connect X</Button>
                      <Button onClick={() => connectAccount('linkedin')} size="sm">Connect LinkedIn</Button>
                    </div>
                  </Card>
                )}
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
