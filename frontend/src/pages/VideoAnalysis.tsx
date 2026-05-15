import { useState, useRef } from 'react';
import { ArrowLeft, Video as VideoIcon, Upload, Loader2, AlertCircle, AlertTriangle, CheckCircle, X, Minus } from 'lucide-react';
import { Logo } from '../components/Logo';
import { AnalysisResult } from '../lib/types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { analyzeVideoContent } from '../lib/analyzeVideoContent';
import { saveAnalysisHistory } from '../lib/api';

interface VideoAnalysisProps {
  onNavigate: (page: string) => void;
}

export const VideoAnalysis = ({ onNavigate }: VideoAnalysisProps) => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('video/')) {
      alert('Please select a video file');
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

  const analyzeVideo = async () => {
    if (!file) return;

    setAnalyzing(true);

    try {
      const analysisResult = await analyzeVideoContent(file);

      setResult(analysisResult);

      if (user) {
        await saveAnalysisHistory({
          media_type: 'video',
          content: file.name,
          result_status: analysisResult.label.toUpperCase(),
          confidence_score: analysisResult.score,
          explanation: analysisResult.explanation,
          metadata: {
            file_name: file.name,
            file_size: file.size,
          },
        });
      }
    } catch (error) {
      console.error('Video analysis failed:', error);
      alert('Video analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const clearVideo = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusConfig = () => {
    if (!result) return {
      icon: AlertCircle,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500',
      label: 'Unknown',
    };

    switch (result.label) {
      case 'High':
        return {
          icon: AlertCircle,
          color: 'text-red-400',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500',
          label: 'High AI Confidence',
        };
      case 'Medium':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500',
          label: 'Medium AI Confidence',
        };
      case 'Low':
        return {
          icon: CheckCircle,
          color: 'text-green-400',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500',
          label: 'Low AI Confidence',
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500',
          label: 'Unknown',
        };
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
              <VideoIcon size={24} className="text-accent-gold" />
              <span className="font-semibold">Video Analysis</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-white mb-3">
            Video Content Analysis
          </h1>
          <p className="text-xl text-neutral-gray">
            Upload a video to analyze temporal patterns and confirm manipulation.
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
                Drop your video here
              </h3>
              <p className="text-neutral-gray mb-4">
                or click to browse your files
              </p>
              <p className="text-neutral-gray text-sm">
                Supports: MP4, WebM, MOV (Max 100MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />
            </div>
          ) : (
            <div>
              <div className="relative mb-6 bg-black rounded-lg overflow-hidden">
                <video
                  src={preview}
                  controls
                  className="w-full max-h-96 object-contain"
                />
                <button
                  onClick={clearVideo}
                  className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="bg-primary-bg rounded-lg p-4 mb-4">
                <h4 className="text-neutral-white font-semibold mb-3">Video Metadata</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-neutral-gray">File Name:</span>
                    <span className="text-neutral-white ml-2 text-xs break-all">{file?.name}</span>
                  </div>
                  <div>
                    <span className="text-neutral-gray">File Size:</span>
                    <span className="text-neutral-white ml-2">
                      {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
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
                  <div className="flex items-center justify-center">
                    <Loader2 className="animate-spin mr-3" size={24} />
                    <span className="text-neutral-white text-sm font-medium">
                      Analyzing video content...
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Button onClick={clearVideo} variant="secondary" fullWidth disabled={analyzing}>
                  Upload Different Video
                </Button>
                <Button onClick={analyzeVideo} disabled={analyzing} fullWidth>
                  {analyzing ? (
                    <div key="analyzing" className="flex items-center justify-center">
                      <Loader2 className="animate-spin mr-2" size={18} />
                      Analyzing Video...
                    </div>
                  ) : (
                    <span key="analyze">Analyze Video</span>
                  )}
                </Button>
              </div>
            </div>
          )}
        </Card>

        {result && (
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
                {result.analysisSource && (
                  <p className="text-neutral-gray text-sm mt-3">
                    <strong>Analysis Source:</strong> {result.analysisSource}
                    {result.primaryService && result.secondaryService && (
                      <span> — Primary: {result.primaryService}, Secondary: {result.secondaryService}</span>
                    )}
                  </p>
                )}
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
        )}
      </div>
    </div>
  );
};
