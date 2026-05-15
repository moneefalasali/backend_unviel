import { AnalysisResult } from './types';

export async function analyzeVideoContent(videoFile: File): Promise<AnalysisResult> {
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
  const formData = new FormData();
  formData.append('video', videoFile);

  const response = await fetch(`${API_BASE_URL}/analyze-video`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = response.statusText;
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.error || errorBody.message || JSON.stringify(errorBody);
    } catch {
      // ignore parse errors
    }
    throw new Error(`Video analysis failed: ${response.status} ${errorMessage}`);
  }

  const data = await response.json();

  const confidencePercent = Math.round(data.ai_percentage);
  const isAI = data.classification.toLowerCase().includes("ai");
  const analysisSource = data.analysis_source ?? data.analysisSource;
  const primaryService = data.primary_service ?? data.primaryService;
  const secondaryService = data.secondary_service ?? data.secondaryService;
  const serviceResults = data.service_results ?? data.serviceResults;

  // Mapping to the Frontend structure expected by VideoAnalysis.tsx
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
      ? `This video is confirmed as AI-generated with ${confidencePercent}% confidence.` 
      : `This video appears to be real footage with ${100 - confidencePercent}% confidence.`),
    signals: [
      {
        name: "Video Authenticity",
        impact: isAI ? "decreased" : "increased",
        value: isAI ? "Low" : "High"
      },
      {
        name: "Frame Consistency",
        impact: isAI ? "increased" : "decreased",
        value: isAI ? "Synthetic" : "Natural"
      }
    ],
    limitations: [
      "Video detection provides a confidence score and may not be 100% accurate.",
    ],
    analysisSource,
    primaryService,
    secondaryService,
    serviceResults,
  };
}