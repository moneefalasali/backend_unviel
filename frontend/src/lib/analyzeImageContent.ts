import { AnalysisResult } from './types';

export async function analyzeImageContent(file: File): Promise<AnalysisResult> {
  const base64 = await toBase64(file);
  
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

  const response = await fetch(`${API_BASE_URL}/analyze-image`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image: base64,
    }),
  });

  if (!response.ok) {
    throw new Error("Image analysis failed");
  }

  const data = await response.json();

  console.log("API RESPONSE FROM BACKEND:", data);

  const classification = data.classification ?? 'Unknown';
  const aiPercentage = Math.round(data.ai_percentage ?? 0);
  const humanPercentage = Math.round(data.human_percentage ?? Math.max(0, 100 - aiPercentage));
  const rawConfidence = data.confidence;
  const score = rawConfidence !== undefined
    ? Math.round(rawConfidence * 100)
    : aiPercentage;
  const confidenceValue = rawConfidence !== undefined
    ? rawConfidence
    : (data.ai_percentage ?? 0) / 100;
  const isAI = classification.toLowerCase().includes('ai');
  const analysisSource = data.analysis_source ?? data.analysisSource;
  const primaryService = data.primary_service ?? data.primaryService;
  const secondaryService = data.secondary_service ?? data.secondaryService;
  const serviceResults = data.service_results ?? data.serviceResults;
  
  // Mapping to the Frontend structure expected by ImageAnalysis.tsx
  let label: 'Low' | 'Medium' | 'High' = 'Low';
  if (confidenceValue > 0.7) {
    label = 'High';
  } else if (confidenceValue > 0.3) {
    label = 'Medium';
  }

  return {
    score,
    label,
    classification,
    aiPercentage,
    humanPercentage,
    explanation: data.explanation || (isAI 
      ? `This image is confirmed as AI-generated with ${aiPercentage}% confidence.` 
      : `This image appears to be a real photo with ${humanPercentage}% confidence.`),
    signals: [
      {
        name: "AI Confidence",
        impact: isAI ? "increased" : "decreased",
        value: `${aiPercentage}%`
      },
      {
        name: "Content Authenticity",
        impact: isAI ? "decreased" : "increased",
        value: isAI ? "Low" : "High"
      }
    ],
    limitations: [
      "AI detection provides a confidence score and may not be 100% accurate.",
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
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
  });
}
