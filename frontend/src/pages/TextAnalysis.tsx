import { useState } from 'react';
import {
  ArrowLeft,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { analyzeTextContent } from '../lib/analyzeTextContent';

interface TextAnalysisProps {
  onNavigate: (page: string) => void;
}

export const TextAnalysis = ({ onNavigate }: TextAnalysisProps) => {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    label: 'Low' | 'Medium' | 'High';
    explanation: string;
    signals: {
      name: string;
      impact: 'increased' | 'decreased' | 'neutral';
      value: string;
    }[];
  } | null>(null);

  const analyzeText = async () => {
    if (!text.trim()) return;

    setAnalyzing(true);

    try {
      const analysisResult = await analyzeTextContent(text);
      setResult(analysisResult);

      if (user) {
        const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;

        await supabase.from('analysis_history').insert({
          user_id: user.id,
          media_type: 'text',
          content: text.substring(0, 500),
          result_status: analysisResult.label.toUpperCase(),
          confidence_score: analysisResult.score,
          explanation: analysisResult.explanation,
          metadata: {
            word_count: wordCount,
            signals: analysisResult.signals.length,
            detection_mode: 'heuristic',
          },
        });
      }
    } catch (error) {
      console.error('Text analysis failed:', error);
      alert('Text analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const getStatusConfig = (label: string) => {
    switch (label) {
      case 'High':
        return {
          icon: AlertCircle,
          color: 'text-red-400',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500',
          label: 'High Estimated AI Involvement',
        };
      case 'Medium':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500',
          label: 'Medium Estimated AI Involvement',
        };
      case 'Low':
        return {
          icon: CheckCircle,
          color: 'text-green-400',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500',
          label: 'Low Estimated AI Involvement',
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-neutral-gray',
          bgColor: 'bg-neutral-gray/10',
          borderColor: 'border-neutral-gray',
          label: 'Unknown',
        };
    }
  };

  const getSignalIcon = (impact: string) => {
    switch (impact) {
      case 'increased':
        return TrendingUp;
      case 'decreased':
        return TrendingDown;
      default:
        return Minus;
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
              <FileText size={24} className="text-accent-gold" />
              <span className="font-semibold">Text Analysis</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-white mb-3">
            Text Content Analysis
          </h1>
          <p className="text-xl text-neutral-gray">
            Paste your text below to analyze linguistic patterns and estimate AI assistance likelihood
          </p>
        </div>

        <Card className="p-6 mb-6 bg-yellow-500/10 border-2 border-yellow-500">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-yellow-400 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                Analysis Disclaimer
              </h3>
              <p className="text-neutral-gray text-sm leading-relaxed">
                This analysis provides probability-based estimates, not definitive proof. Results are based on pattern recognition and statistical analysis, which may produce false positives or negatives. Human-written content, especially formal or technical writing, can exhibit patterns similar to AI-generated text.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-8 mb-6">
          <label className="block text-neutral-white text-lg font-semibold mb-4">
            Enter Text for Analysis
          </label>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type the text you want to analyze here..."
            className="w-full h-64 px-4 py-3 bg-primary-bg text-neutral-white rounded-lg border-2 border-primary-purple focus:border-accent-lavender focus:outline-none transition-colors duration-200 placeholder-neutral-gray resize-none"
          />

          <div className="flex justify-between items-center mt-4">
            <p className="text-neutral-gray text-sm">
              {text.split(/\s+/).filter((word) => word.length > 0).length} words
            </p>

            <Button onClick={analyzeText} disabled={!text.trim() || analyzing}>
              {analyzing ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Analyzing...
                </>
              ) : (
                'Analyze Text'
              )}
            </Button>
          </div>
        </Card>

        {result && (
          <>
            <Card className={`p-6 mb-6 border-2 ${getStatusConfig(result.label).borderColor} ${getStatusConfig(result.label).bgColor}`}>
              <p className="text-neutral-gray text-sm leading-relaxed">
                <strong>Estimation Notice:</strong> This result is an estimate, not a final judgment. The {result.score}% score represents likelihood based on detected patterns.
              </p>
            </Card>

            <Card className={`p-8 border-2 ${getStatusConfig(result.label).borderColor} ${getStatusConfig(result.label).bgColor}`}>
              <div className="flex items-start gap-4 mb-6">
                {(() => {
                  const StatusIcon = getStatusConfig(result.label).icon;
                  return <StatusIcon className={getStatusConfig(result.label).color} size={32} />;
                })()}

                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-neutral-white mb-2">
                    Estimated AI Assistance: {getStatusConfig(result.label).label}
                  </h2>

                  <div className="flex items-center gap-4 mb-4">
                    <div>
                      <p className="text-neutral-gray text-sm">Confidence Level</p>
                      <p className={`text-3xl font-bold ${getStatusConfig(result.label).color}`}>
                        {result.label}
                      </p>
                    </div>

                    <div>
                      <p className="text-neutral-gray text-sm">Probability Score</p>
                      <p className={`text-2xl font-bold ${getStatusConfig(result.label).color}`}>
                        {result.score}%
                      </p>
                    </div>

                    <div className="flex-1">
                      <p className="text-neutral-gray text-sm mb-2">Score Bar</p>
                      <div className="w-full bg-primary-bg rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            result.label === 'High'
                              ? 'bg-red-400'
                              : result.label === 'Medium'
                              ? 'bg-yellow-400'
                              : 'bg-green-400'
                          }`}
                          style={{ width: `${result.score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-neutral-white mb-3">
                  Analysis Explanation
                </h3>
                <p className="text-neutral-gray leading-relaxed">
                  {result.explanation}
                </p>
              </div>

              <div className="mb-6 border-t border-primary-purple/30 pt-6">
                <h3 className="text-lg font-semibold text-neutral-white mb-4">
                  Indicators of AI Assistance
                </h3>

                <div className="space-y-3">
                  {result.signals.map((signal, index) => {
                    const SignalIcon = getSignalIcon(signal.impact);

                    return (
                      <div key={index} className="bg-primary-bg rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <SignalIcon
                            size={20}
                            className={`flex-shrink-0 mt-0.5 ${
                              signal.impact === 'increased'
                                ? 'text-red-400'
                                : signal.impact === 'decreased'
                                ? 'text-green-400'
                                : 'text-neutral-gray'
                            }`}
                          />

                          <div className="flex-1">
                            <h4 className="text-neutral-white font-medium text-sm mb-1">
                              {signal.name}
                            </h4>
                            <p className="text-neutral-gray text-sm">
                              {signal.value}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-primary-purple/30 pt-6">
                <h3 className="text-lg font-semibold text-neutral-white mb-3">
                  Analysis Limitations
                </h3>
                <ul className="text-neutral-gray text-sm space-y-2 list-disc list-inside">
                  <li>Pattern analysis provides estimates, not definitive proof</li>
                  <li>Formal or technical writing by humans can exhibit similar characteristics</li>
                  <li>Advanced AI models may produce content that evades pattern detection</li>
                  <li>Results should be considered alongside other evaluation methods</li>
                </ul>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};