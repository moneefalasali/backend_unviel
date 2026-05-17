import { useState, useRef } from 'react';
import {
  ArrowLeft,
  Image as ImageIcon,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { analyzeImageContent } from '../lib/analyzeImageContent';
import { saveAnalysisHistory } from '../lib/api';
import { AnalysisResult } from '../lib/types';


interface ImageAnalysisProps {
  onNavigate: (page: string) => void;
}

export const ImageAnalysis = ({ onNavigate }: ImageAnalysisProps) => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      alert('Please select an image file');
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

  const analyzeImage = async () => {
    if (!file) return;

    setAnalyzing(true);

    try {
      const analysisResult = await analyzeImageContent(file);
      setResult(analysisResult);

      if (user) {
        await saveAnalysisHistory({
          media_type: 'image',
          content: file.name,
          result_status: analysisResult.label.toUpperCase(),
          confidence_score: analysisResult.score,
          explanation: analysisResult.explanation,
          metadata: {
            file_name: file.name,
            file_size: file.size,
            signals: analysisResult.signals.length,
            detection_mode: 'heuristic',
          },
        });
      }
    } catch (error) {
      console.error('Image analysis failed:', error);
      alert('Image analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const clearImage = () => {
    setFile(null);
    setPreview(null);
    setResult(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusConfig = (aiPercentage: number) => {
    if (aiPercentage >= 70) {
      return {
        icon: AlertCircle,
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500',
        label: 'High AI Likelihood',
      };
    }

    if (aiPercentage >= 40) {
      return {
        icon: AlertTriangle,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500',
        label: 'Medium AI Likelihood',
      };
    }

    return {
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500',
      label: 'Low AI Likelihood',
    };
  };

  const effectiveAiPercentage = result?.aiPercentage ?? result?.score ?? 0;

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
              <ImageIcon size={24} className="text-accent-gold" />
              <span className="font-semibold">Image Analysis</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-white mb-3">
            Image Content Analysis
          </h1>

          <p className="text-xl text-neutral-gray">
            Upload an image to analyze visual patterns and confirm AI generation.
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
                Drop your image here
              </h3>

              <p className="text-neutral-gray mb-4">
                or click to browse your files
              </p>

              <p className="text-neutral-gray text-sm">
                Supports: JPG, PNG, WebP, GIF
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) =>
                  e.target.files?.[0] && handleFileSelect(e.target.files[0])
                }
                className="hidden"
              />
            </div>
          ) : (
            <div>
              <div className="relative mb-6">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full max-h-96 object-contain rounded-lg bg-primary-bg"
                />

                <button
                  onClick={clearImage}
                  className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="bg-primary-bg rounded-lg p-4 mb-4">
                <h4 className="text-neutral-white font-semibold mb-3">
                  Image Metadata
                </h4>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-neutral-gray">File Name:</span>
                    <span className="text-neutral-white ml-2">{file?.name}</span>
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

              <div className="flex gap-4">
                <Button onClick={clearImage} variant="secondary" fullWidth>
                  Upload Different Image
                </Button>

                <Button onClick={analyzeImage} disabled={analyzing} fullWidth>
                  {analyzing ? (
                    <div key="analyzing" className="flex items-center justify-center">
                      <Loader2 className="animate-spin mr-2" size={18} />
                      Analyzing...
                    </div>
                  ) : (
                    <span key="analyze">Analyze Image</span>
                  )}
                </Button>
              </div>
            </div>
          )}
        </Card>

        {result && (
          <>
            <Card className="p-6 mb-6 bg-yellow-500/10 border-2 border-yellow-500">
              <div className="flex items-start gap-3">
                <AlertTriangle
                  className="text-yellow-400 flex-shrink-0 mt-1"
                  size={20}
                />

                <div>
                  <p className="text-neutral-gray text-sm leading-relaxed">
                    <strong>Analysis Disclaimer:</strong> This result is a
                    confirmed detection based on pattern evidence and service
                    confidence. It should be used as a strong signal.
                  </p>
                </div>
              </div>
            </Card>

            <Card
              className={`p-8 border-2 ${
                getStatusConfig(effectiveAiPercentage).borderColor
              } ${getStatusConfig(effectiveAiPercentage).bgColor}`}
            >
              <div className="flex items-start gap-4 mb-6">
                {(() => {
                  const StatusIcon = getStatusConfig(effectiveAiPercentage).icon;
                  return (
                    <StatusIcon
                      className={getStatusConfig(effectiveAiPercentage).color}
                      size={32}
                    />
                  );
                })()}

                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-neutral-white mb-2">
                    Confirmed AI Generation: {getStatusConfig(effectiveAiPercentage).label}
                  </h2>

                  <div className="flex items-center gap-4 mb-4">
                    <div>
                      <p className="text-neutral-gray text-sm">Confidence Level</p>
                      <p
                        className={`text-3xl font-bold ${
                          getStatusConfig(effectiveAiPercentage).color
                        }`}
                      >
                        {result.label}
                      </p>
                    </div>

                    <div>
                      <p className="text-neutral-gray text-sm">Confidence Score</p>
                      <p
                        className={`text-2xl font-bold ${
                          getStatusConfig(effectiveAiPercentage).color
                        }`}
                      >
                        {result.score}%
                      </p>
                    </div>

                    <div className="flex-1">
                      <p className="text-neutral-gray text-sm mb-2">Score Bar</p>
                      <div className="w-full bg-primary-bg rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            effectiveAiPercentage >= 70
                              ? 'bg-red-400'
                              : effectiveAiPercentage >= 40
                              ? 'bg-yellow-400'
                              : 'bg-green-400'
                          }`}
                          style={{ width: `${effectiveAiPercentage}%` }}
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

                {result.analysisSource && (
                  <p className="text-neutral-gray text-sm mt-3">
                    <strong>Analysis Source:</strong> {result.analysisSource}
                    {result.primaryService && result.secondaryService && (
                      <span> — Primary: {result.primaryService}, Secondary: {result.secondaryService}</span>
                    )}
                  </p>
                )}
                {result.classification && (
                  <p className="text-neutral-gray text-sm mt-3">
                    <strong>Classification:</strong> {result.classification}
                  </p>
                )}
                {(result.aiPercentage !== undefined || result.humanPercentage !== undefined) && (
                  <div className="flex flex-wrap gap-4 mt-2 text-sm">
                    {result.aiPercentage !== undefined && (
                      <p className={`font-semibold ${result.aiPercentage >= 70 ? 'text-red-400' : result.aiPercentage >= 40 ? 'text-yellow-400' : 'text-green-400'}`}>
                        AI Percentage: {result.aiPercentage}%
                      </p>
                    )}
                    {result.humanPercentage !== undefined && (
                      <p className="text-neutral-gray">
                        Human Percentage: {result.humanPercentage}%
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="mb-6 border-t border-primary-purple/30 pt-6">
                <h3 className="text-lg font-semibold text-neutral-white mb-4">
                  Indicators of AI Generation
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
                  {result.limitations.map((limitation, index) => (
                    <li key={index}>{limitation}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 p-4 bg-primary-bg rounded-lg border-l-4 border-accent-gold">
                <p className="text-neutral-gray text-sm italic">
                  <strong className="text-neutral-white">Disclaimer:</strong>{' '}
                  This result is a confirmed detection based on the evidence shown and the computed confidence score.
                </p>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};