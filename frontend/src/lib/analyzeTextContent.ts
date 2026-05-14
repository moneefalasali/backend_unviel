export async function analyzeTextContent(text: string) {
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

  const response = await fetch(`${API_BASE_URL}/analyze-text`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: text,
    }),
  });

  if (!response.ok) {
    throw new Error("Text analysis failed");
  }

  const data = await response.json();
  
  const confidencePercent = Math.round(data.ai_percentage);
  const isAI = data.classification.toLowerCase().includes("ai");

  // Mapping to the Frontend structure expected by TextAnalysis.tsx
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
      ? `This text is likely AI-generated with ${confidencePercent}% confidence.` 
      : `This text appears to be human-written with ${100 - confidencePercent}% AI probability.`),
    signals: [
      {
        name: "Pattern Consistency",
        impact: isAI ? "increased" : "decreased",
        value: isAI ? "High" : "Low"
      },
      {
        name: "Vocabulary Diversity",
        impact: isAI ? "decreased" : "increased",
        value: isAI ? "Limited" : "Natural"
      }
    ],
    limitations: [
      "Short texts may provide less accurate results.",
      "AI detection is probabilistic and should be used as a guide.",
    ],
  };
}
