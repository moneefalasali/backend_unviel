import { AnalysisResult } from './types';

export async function analyzeAudioContent(file: File): Promise<AnalysisResult> {
  const base64 = await toBase64(file);
  
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

  const response = await fetch(`${API_BASE_URL}/analyze-audio`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      audio: base64,
    }),
  });

  if (!response.ok) {
    throw new Error("Audio analysis failed");
  }

  const data = await response.json();

  const confidencePercent = Math.round(data.ai_percentage);
  const isAI = data.classification === "AI Generated";
  const analysisSource = data.analysis_source ?? data.analysisSource;
  const primaryService = data.primary_service ?? data.primaryService;
  const secondaryService = data.secondary_service ?? data.secondaryService;
  const serviceResults = data.service_results ?? data.serviceResults;
  
  // Mapping to the Frontend structure expected by AudioAnalysis.tsx
  let label: 'Low' | 'Medium' | 'High' = 'Low';
  if (data.confidence > 0.7) {
    label = 'High';
  } else if (data.confidence > 0.3) {
    label = 'Medium';
  }

  return {
    score: confidencePercent,
    label: label,
    explanation: data.explanation || (isAI 
      ? `This audio is confirmed as AI-generated with ${confidencePercent}% confidence.` 
      : `This audio appears to be a real human voice with ${100 - confidencePercent}% confidence.`),
    signals: [
      {
        name: "Voice Authenticity",
        impact: isAI ? "decreased" : "increased",
        value: isAI ? "Low" : "High"
      },
      {
        name: "Spectral Patterns",
        impact: isAI ? "increased" : "decreased",
        value: isAI ? "Synthetic" : "Natural"
      }
    ],
    limitations: [
      "Audio detection provides a confidence score and may not be 100% accurate.",
    ],
    analysisSource,
    primaryService,
    secondaryService,
    serviceResults,
  };
}

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:audio/mpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
  });
}
