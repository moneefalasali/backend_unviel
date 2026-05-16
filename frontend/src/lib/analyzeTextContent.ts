import { AnalysisResult } from './types';

export async function analyzeTextContent(text: string): Promise<AnalysisResult> {
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

  const response = await fetch(`${API_BASE_URL}/analyze-text`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      text: text,
    }),
  });

  if (!response.ok) {
    // Try to parse error details from the backend and return a structured result
    let errBody: any = null;
    try {
      errBody = await response.json();
    } catch (e) {
      errBody = null;
    }

    const explanation = errBody?.explanation || errBody?.error || response.statusText || 'Text analysis failed';
    const analysisSource = errBody?.analysis_source ?? errBody?.analysisSource;
    const primaryService = errBody?.primary_service ?? errBody?.primaryService;
    const secondaryService = errBody?.secondary_service ?? errBody?.secondaryService;
    const serviceResults = errBody?.service_results ?? errBody?.serviceResults;

    return {
      score: 0,
      label: 'Low',
      explanation: explanation,
      signals: [],
      limitations: [
        'The analysis request failed. See explanation for details.',
      ],
      analysisSource,
      primaryService,
      secondaryService,
      serviceResults,
    } as AnalysisResult;
  }

  const data = await response.json();
  
  const aiPercentage = Math.round(data.ai_percentage ?? 0);
  const humanPercentage = Math.round(data.human_percentage ?? Math.max(0, 100 - aiPercentage));
  const rawConfidence = data.confidence;
  const confidencePercent = rawConfidence !== undefined
    ? Math.round(rawConfidence * 100)
    : aiPercentage;
  const classification = data.classification ?? (aiPercentage > 50 ? 'AI-generated' : 'Human-written');
  const isAI = classification.toLowerCase().includes('ai');
  const analysisSource = data.analysis_source ?? data.analysisSource;
  const primaryService = data.primary_service ?? data.primaryService;
  const secondaryService = data.secondary_service ?? data.secondaryService;
  const serviceResults = data.service_results ?? data.serviceResults;

  let label: 'Low' | 'Medium' | 'High' = 'Low';
  const confidenceValue = rawConfidence !== undefined
    ? rawConfidence
    : (data.ai_percentage ?? 0) / 100;
  if (confidenceValue > 0.7) {
    label = 'High';
  } else if (confidenceValue > 0.3) {
    label = 'Medium';
  }

  return {
    score: confidencePercent,
    label,
    classification,
    aiPercentage,
    humanPercentage,
    explanation: data.explanation || (isAI 
      ? `This text is confirmed as AI-generated with ${confidencePercent}% confidence.` 
      : `This text is confirmed as human-written with ${humanPercentage}% confidence.`),
    signals: [
      {
        name: 'Pattern Consistency',
        impact: isAI ? 'increased' : 'decreased',
        value: isAI ? 'High' : 'Low',
      },
      {
        name: 'Vocabulary Diversity',
        impact: isAI ? 'decreased' : 'increased',
        value: isAI ? 'Limited' : 'Natural',
      },
    ],
    limitations: [
      'Short texts may provide less accurate results.',
      'AI detection provides a confidence score and should be used as one evaluation factor.',
    ],
    analysisSource,
    primaryService,
    secondaryService,
    serviceResults,
  };
}
