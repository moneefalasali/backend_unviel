import { AnalysisResult } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export async function analyzeVideoContent(videoFile: File): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append('video', videoFile);

  const response = await fetch(`${API_BASE_URL}/analyze-video`, {
    method: "POST",
    body: formData,
    headers: {
      'Accept': 'application/json'
    }
  });

  const result = await response.json();
  const data = result?.success ? result.data ?? {} : result;

  if (!response.ok) {
    throw new Error(data.message || data.error || `Error ${response.status}`);
  }

  const aiPercentage = Math.round(data.ai_percentage ?? 0);
  const humanPercentage = Math.round(data.human_percentage ?? (100 - aiPercentage));
  const confidence = data.confidence ?? Math.max(aiPercentage, humanPercentage);
  const classification = data.classification ?? (aiPercentage > 50 ? 'AI-generated' : 'Human-written');

  return {
    score: confidence,
    label: confidence > 70 ? 'High' : confidence > 30 ? 'Medium' : 'Low',
    classification,
    aiPercentage,
    humanPercentage,
    explanation: data.explanation || `Analysis completed with ${confidence}% confidence.`,
    signals: [
      { name: "Authenticity", impact: aiPercentage > 50 ? "decreased" : "increased", value: aiPercentage > 50 ? "Low" : "High" }
    ],
    limitations: ["Detection accuracy may vary based on video quality."]
  };
}
