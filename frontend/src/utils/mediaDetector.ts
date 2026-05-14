interface MediaAnalysisResult {
  score: number;
  label: 'Limited Demo Estimate';
  explanation: string;
  signals: {
    name: string;
    impact: 'neutral';
    value: string;
  }[];
  limitations: string[];
}

export function analyzeVideo(file: File): MediaAnalysisResult {
  const signals: { name: string; impact: 'neutral'; value: string }[] = [];
  const limitations: string[] = [
    'Browser-only video analysis is extremely limited',
    'Advanced deepfake detection requires backend processing',
    'Frame-by-frame forensic analysis not available in browser',
    'Temporal inconsistency detection requires specialized models',
    'This is a metadata-only estimate'
  ];

  signals.push({
    name: 'File Name',
    impact: 'neutral',
    value: file.name
  });

  signals.push({
    name: 'File Size',
    impact: 'neutral',
    value: `${(file.size / 1024 / 1024).toFixed(2)} MB`
  });

  signals.push({
    name: 'File Type',
    impact: 'neutral',
    value: file.type
  });

  const suspiciousPatterns = ['generated', 'synthetic', 'deepfake', 'fake', 'ai-'];
  const hasSuspiciousName = suspiciousPatterns.some(pattern =>
    file.name.toLowerCase().includes(pattern)
  );

  if (hasSuspiciousName) {
    signals.push({
      name: 'Filename Analysis',
      impact: 'neutral',
      value: 'Filename contains AI-related keywords'
    });
  }

  const explanation = 'This is a limited demonstration estimate based solely on file metadata. Authentic video deepfake detection requires advanced backend processing including frame-by-frame analysis, temporal consistency checking, facial landmark tracking, and audio-visual synchronization analysis. These capabilities are not available in browser-only implementations. Do not rely on this result for any serious verification purposes.';

  return {
    score: 50,
    label: 'Limited Demo Estimate',
    explanation,
    signals,
    limitations
  };
}

export function analyzeAudio(file: File): MediaAnalysisResult {
  const signals: { name: string; impact: 'neutral'; value: string }[] = [];
  const limitations: string[] = [
    'Browser-only audio analysis is extremely limited',
    'Voice cloning detection requires backend processing',
    'Spectral analysis and frequency forensics not available',
    'Prosody and formant analysis requires specialized models',
    'This is a metadata-only estimate'
  ];

  signals.push({
    name: 'File Name',
    impact: 'neutral',
    value: file.name
  });

  signals.push({
    name: 'File Size',
    impact: 'neutral',
    value: `${(file.size / 1024).toFixed(2)} KB`
  });

  signals.push({
    name: 'File Type',
    impact: 'neutral',
    value: file.type
  });

  const suspiciousPatterns = ['generated', 'synthetic', 'tts', 'ai-voice', 'cloned'];
  const hasSuspiciousName = suspiciousPatterns.some(pattern =>
    file.name.toLowerCase().includes(pattern)
  );

  if (hasSuspiciousName) {
    signals.push({
      name: 'Filename Analysis',
      impact: 'neutral',
      value: 'Filename contains AI-related keywords'
    });
  }

  const explanation = 'This is a limited demonstration estimate based solely on file metadata. Authentic voice cloning and synthetic speech detection requires advanced backend processing including spectral analysis, formant tracking, prosody analysis, and neural vocoder artifact detection. These capabilities are not available in browser-only implementations. Do not rely on this result for any serious verification purposes.';

  return {
    score: 50,
    label: 'Limited Demo Estimate',
    explanation,
    signals,
    limitations
  };
}
