import { useState, useRef } from 'react';
import { ArrowLeft, Music, Upload, Loader2, AlertCircle, X, Minus } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { analyzeAudioContent } from '../lib/analyzeAudioContent';

interface AudioAnalysisProps {
  onNavigate: (page: string) => void;
}

export const AudioAnalysis = ({ onNavigate }: AudioAnalysisProps) => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{
    score: number;
    label: 'Limited Demo Estimate';
    explanation: string;
    signals: {
      name: string;
      impact: 'neutral';
      value: string;
    }[];
    limitations: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('audio/')) {
      alert('Please select an audio file');
      return;
    }

    setFile(selectedFile);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const analyzeAudio = async () => {
    if (!file) return;

    setAnalyzing(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 180);

    await new Promise(resolve => setTimeout(resolve, 3500));

    clearInterval(interval);
    setProgress(100);

    try {
      const analysisResult = await analyzeAudioContent(file);
      setResult(analysisResult as any);
    } catch (error) {
      console.error("Audio analysis failed:", error);
      alert("Failed to analyze audio. Please try again.");
    }
    setAnalyzing(false);

    if (user) {
      await supabase.from('analysis_history').insert({
        user_id: user.id,
        media_type: 'audio',
        content: file.name,
        result_status: result?.label || 'DEMO',
        confidence_score: result?.score || 0,
        explanation: result?.explanation || '',
        metadata: {
          file_name: file.name,
          file_size: file.size,
        },
      });
    }
  };

  const clearAudio = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusConfig = () => {
    return {
      icon: AlertCircle,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500',
      label: 'Limited Demo Estimate (Metadata Only)',
    };
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
              <Music size={24} className="text-accent-gold" />
              <span className="font-semibold">Audio Analysis</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-white mb-3">
            Audio Content Analysis
          </h1>
          <p className="text-xl text-neutral-gray">
            Upload audio to analyze speech patterns and estimate synthetic generation likelihood
          </p>
        </div>

        <Card className="p-8 mb-6">
          {!preview ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-primary-purple rounded-xl p-12 text-center hover:border-accent-lavender transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mx-auto text-accent-gold mb-4" size={48} />
              <h3 className="text-xl font-semibold text-neutral-white mb-2">
                Drop your audio file here
              </h3>
              <p className="text-neutral-gray mb-4">
                or click to browse your files
              </p>
              <p className="text-neutral-gray text-sm">
                Supports: MP3, WAV, OGG, M4A (Max 50MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />
            </div>
          ) : (
            <div>
              <div className="relative mb-6">
                <div className="bg-primary-bg rounded-lg p-8">
                  <div className="flex items-center justify-center mb-4">
                    <Music className="text-accent-gold" size={64} />
                  </div>
                  <audio
                    src={preview}
                    controls
                    className="w-full"
                  />
                  <div className="mt-4 h-20 bg-gradient-to-r from-primary-purple via-accent-lavender to-primary-purple opacity-30 rounded"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(138, 114, 212, 0.3) 10px, rgba(138, 114, 212, 0.3) 12px)',
                    }}
                  />
                </div>
                <button
                  onClick={clearAudio}
                  className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="bg-primary-bg rounded-lg p-4 mb-4">
                <h4 className="text-neutral-white font-semibold mb-3">Audio Metadata</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-neutral-gray">File Name:</span>
                    <span className="text-neutral-white ml-2 text-xs break-all">{file?.name}</span>
                  </div>
                  <div>
                    <span className="text-neutral-gray">File Size:</span>
                    <span className="text-neutral-white ml-2">
                      {file ? `${(file.size / 1024).toFixed(2)} KB` : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-gray">File Type:</span>
                    <span className="text-neutral-white ml-2">{file?.type}</span>
                  </div>
                </div>
              </div>

              {analyzing && (
                <div className="bg-primary-bg rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-neutral-white text-sm font-medium">
                      Analyzing frequencies and patterns...
                    </span>
                    <span className="text-accent-gold font-bold">{progress}%</span>
                  </div>
                  <div className="w-full bg-primary-dark rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-accent-gold transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Button onClick={clearAudio} variant="secondary" fullWidth disabled={analyzing}>
                  Upload Different Audio
                </Button>
                <Button onClick={analyzeAudio} disabled={analyzing} fullWidth>
                  {analyzing ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={18} />
                      Analyzing Audio...
                    </>
                  ) : (
                    'Analyze Audio'
                  )}
                </Button>
              </div>
            </div>
          )}
        </Card>

        {result && (
          <>
            <Card className="p-6 mb-6 bg-red-500/10 border-2 border-red-500">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-red-400 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="text-lg font-semibold text-red-400 mb-2">
                    Critical Limitation Notice
                  </h3>
                  <p className="text-neutral-gray text-sm leading-relaxed">
                    This is a metadata-only demo estimate. Authentic voice cloning detection requires backend processing
                    with spectral analysis and frequency forensics. This result should NOT be used for any serious verification.
                  </p>
                </div>
              </div>
            </Card>

            <Card className={`p-8 border-2 ${getStatusConfig().borderColor} ${getStatusConfig().bgColor}`}>
              <div className="flex items-start gap-4 mb-6">
                {(() => {
                  const StatusIcon = getStatusConfig().icon;
                  return <StatusIcon className={getStatusConfig().color} size={32} />;
                })()}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-neutral-white mb-2">
                    {getStatusConfig().label}
                  </h2>
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
                  File Metadata
                </h3>
                <div className="space-y-3">
                  {result.signals.map((signal, index) => (
                    <div key={index} className="bg-primary-bg rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Minus size={20} className="flex-shrink-0 mt-0.5 text-neutral-gray" />
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
                  ))}
                </div>
              </div>

              <div className="border-t border-primary-purple/30 pt-6">
                <h3 className="text-lg font-semibold text-neutral-white mb-3">
                  Limitations
                </h3>
                <ul className="text-neutral-gray text-sm space-y-2 list-disc list-inside">
                  {result.limitations.map((limitation, index) => (
                    <li key={index}>{limitation}</li>
                  ))}
                </ul>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};
