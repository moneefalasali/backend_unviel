import { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Image, Video, Music, Calendar, TrendingUp } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Card } from '../components/Card';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { AnalysisHistory, fetchAnalysisHistory } from '../lib/api';

interface HistoryProps {
  onNavigate: (page: string) => void;
}

export const History = ({ onNavigate }: HistoryProps) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [history, setHistory] = useState<AnalysisHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'text' | 'image' | 'video' | 'audio'>('all');

  useEffect(() => {
    loadHistory();
  }, [user]);

  const loadHistory = async () => {
    if (!user) {
      setHistory([]);
      setLoading(false);
      return;
    }

    try {
      const data = await fetchAnalysisHistory();
      setHistory(data || []);
    } catch (error) {
      console.error('Error loading history:', error);
      addToast({
        type: 'error',
        title: 'Unable to load history',
        description: 'Please refresh the page or sign in again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'text':
        return FileText;
      case 'image':
        return Image;
      case 'video':
        return Video;
      case 'audio':
        return Music;
      default:
        return FileText;
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'LOW' || status === 'AUTHENTIC') {
      return 'text-green-400';
    } else if (status === 'MEDIUM' || status === 'SUSPICIOUS') {
      return 'text-yellow-400';
    } else {
      return 'text-red-400';
    }
  };

  const filteredHistory = filter === 'all'
    ? history
    : history.filter(item => item.media_type === filter);

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
              <Calendar size={24} className="text-accent-gold" />
              <span className="font-semibold">Analysis History</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-white mb-3">
            Your Analysis History
          </h1>
          <p className="text-xl text-neutral-gray">
            Review all your previous content analyses
          </p>
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              filter === 'all'
                ? 'bg-accent-gold text-primary-dark'
                : 'bg-primary-dark text-neutral-gray hover:text-neutral-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('text')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              filter === 'text'
                ? 'bg-accent-gold text-primary-dark'
                : 'bg-primary-dark text-neutral-gray hover:text-neutral-white'
            }`}
          >
            Text
          </button>
          <button
            onClick={() => setFilter('image')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              filter === 'image'
                ? 'bg-accent-gold text-primary-dark'
                : 'bg-primary-dark text-neutral-gray hover:text-neutral-white'
            }`}
          >
            Image
          </button>
          <button
            onClick={() => setFilter('video')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              filter === 'video'
                ? 'bg-accent-gold text-primary-dark'
                : 'bg-primary-dark text-neutral-gray hover:text-neutral-white'
            }`}
          >
            Video
          </button>
          <button
            onClick={() => setFilter('audio')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              filter === 'audio'
                ? 'bg-accent-gold text-primary-dark'
                : 'bg-primary-dark text-neutral-gray hover:text-neutral-white'
            }`}
          >
            Audio
          </button>
        </div>

        {loading ? (
          <Card className="p-12 text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-primary-purple/30 rounded w-1/4 mx-auto mb-4" />
              <div className="h-4 bg-primary-purple/20 rounded w-1/2 mx-auto" />
            </div>
          </Card>
        ) : filteredHistory.length === 0 ? (
          <Card className="p-12 text-center">
            <TrendingUp className="mx-auto text-neutral-gray mb-4" size={48} />
            <h3 className="text-xl font-semibold text-neutral-white mb-2">
              No analyses yet
            </h3>
            <p className="text-neutral-gray mb-6">
              Start analyzing content to see your history here
            </p>
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-6 py-3 bg-accent-gold text-primary-dark rounded-lg font-medium hover:bg-yellow-500 transition-colors"
            >
              Go to Dashboard
            </button>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((item) => {
              const MediaIcon = getMediaIcon(item.media_type);
              return (
                <Card key={item.id} className="p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary-bg rounded-lg">
                      <MediaIcon className="text-accent-gold" size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-neutral-white mb-1">
                            {item.media_type.charAt(0).toUpperCase() + item.media_type.slice(1)} Analysis
                          </h3>
                          <p className="text-neutral-gray text-sm">
                            {new Date(item.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-neutral-gray text-sm mb-1">Status</p>
                          <p className={`text-xl font-bold ${getStatusColor(item.result_status)}`}>
                            {item.result_status}
                          </p>
                        </div>
                      </div>
                      <div className="bg-primary-bg rounded-lg p-4 mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-neutral-gray text-sm">Confidence Score</span>
                          <span className={`font-bold ${getStatusColor(item.result_status)}`}>
                            {item.confidence_score}%
                          </span>
                        </div>
                        <div className="w-full bg-primary-dark rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              item.result_status === 'LOW' || item.result_status === 'AUTHENTIC'
                                ? 'bg-green-400'
                                : item.result_status === 'MEDIUM' || item.result_status === 'SUSPICIOUS'
                                ? 'bg-yellow-400'
                                : 'bg-red-400'
                            }`}
                            style={{ width: `${item.confidence_score}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-neutral-gray text-sm line-clamp-2">
                        {item.explanation}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
