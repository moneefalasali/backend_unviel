import { AnalysisResult } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export async function analyzeAudioContent(audioFile: File): Promise<AnalysisResult> {
  const base64 = await toBase64(audioFile);
  
  const response = await fetch(`${API_BASE_URL}/analyze-audio`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({ audio: base64 }),
  });

  const result = await response.json();
  const data = result?.success ? result.data ?? {} : result;

  if (!response.ok) {
    throw new Error(data.message || data.error || `Error ${response.status}`);
  }

  const aiPercentage = Math.round(data.ai_percentage ?? 0);
  const humanPercentage = Math.round(data.human_percentage ?? (100 - aiPercentage));
  const confidence = data.confidence ?? Math.max(aiPercentage, humanPercentage);

  return {
    score: confidence,
    label: confidence > 70 ? 'High' : confidence > 30 ? 'Medium' : 'Low',
    classification: data.classification || (aiPercentage > 50 ? 'AI-generated' : 'Human-written'),
    aiPercentage,
    humanPercentage,
    explanation: data.explanation || `Analysis completed with ${confidence}% confidence.`,
    signals: [
      { name: "Voice Authenticity", impact: aiPercentage > 50 ? "decreased" : "increased", value: aiPercentage > 50 ? "Low" : "High" }
    ],
    limitations: ["Detection accuracy may vary based on audio quality."]
  };
}

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
  });
}
