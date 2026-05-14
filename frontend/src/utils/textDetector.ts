interface TextAnalysisResult {
  score: number;
  label: 'Low' | 'Medium' | 'High';
  explanation: string;
  signals: {
    name: string;
    impact: 'increased' | 'decreased' | 'neutral';
    value: string;
  }[];
}

export function analyzeText(text: string): TextAnalysisResult {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  if (wordCount < 10) {
    return {
      score: 0,
      label: 'Low',
      explanation: 'Text is too short for reliable analysis. A minimum of 10 words is recommended for meaningful pattern detection.',
      signals: [
        { name: 'Word Count', impact: 'neutral', value: `${wordCount} words (insufficient)` }
      ]
    };
  }

  let score = 50;
  const signals: { name: string; impact: 'increased' | 'decreased' | 'neutral'; value: string }[] = [];

  const sentenceLengths = sentences.map(s => s.trim().split(/\s+/).length);
  const avgSentenceLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
  const sentenceLengthVariance = sentenceLengths.reduce((sum, len) => {
    return sum + Math.pow(len - avgSentenceLength, 2);
  }, 0) / sentenceLengths.length;
  const sentenceLengthStdDev = Math.sqrt(sentenceLengthVariance);

  if (sentenceLengthStdDev < 3 && sentences.length >= 5) {
    score += 15;
    signals.push({
      name: 'Sentence Length Variation',
      impact: 'increased',
      value: `Low variation (σ=${sentenceLengthStdDev.toFixed(1)}) suggests uniform structure`
    });
  } else if (sentenceLengthStdDev > 8) {
    score -= 10;
    signals.push({
      name: 'Sentence Length Variation',
      impact: 'decreased',
      value: `High variation (σ=${sentenceLengthStdDev.toFixed(1)}) suggests natural writing`
    });
  } else {
    signals.push({
      name: 'Sentence Length Variation',
      impact: 'neutral',
      value: `Moderate variation (σ=${sentenceLengthStdDev.toFixed(1)})`
    });
  }

  const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
  const lexicalDiversity = uniqueWords / wordCount;

  if (lexicalDiversity < 0.4) {
    score += 12;
    signals.push({
      name: 'Lexical Diversity',
      impact: 'increased',
      value: `Low diversity (${(lexicalDiversity * 100).toFixed(1)}%) indicates repetitive vocabulary`
    });
  } else if (lexicalDiversity > 0.7) {
    score -= 8;
    signals.push({
      name: 'Lexical Diversity',
      impact: 'decreased',
      value: `High diversity (${(lexicalDiversity * 100).toFixed(1)}%) suggests rich vocabulary`
    });
  } else {
    signals.push({
      name: 'Lexical Diversity',
      impact: 'neutral',
      value: `Moderate diversity (${(lexicalDiversity * 100).toFixed(1)}%)`
    });
  }

  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / wordCount;

  if (avgWordLength > 6.5) {
    score += 8;
    signals.push({
      name: 'Average Word Length',
      impact: 'increased',
      value: `Long words (${avgWordLength.toFixed(1)} chars) suggest formal style`
    });
  } else if (avgWordLength < 4.5) {
    score -= 5;
    signals.push({
      name: 'Average Word Length',
      impact: 'decreased',
      value: `Short words (${avgWordLength.toFixed(1)} chars) suggest casual style`
    });
  } else {
    signals.push({
      name: 'Average Word Length',
      impact: 'neutral',
      value: `Typical length (${avgWordLength.toFixed(1)} chars)`
    });
  }

  const punctuationMarks = text.match(/[,;:—–-]/g) || [];
  const punctuationDensity = punctuationMarks.length / sentences.length;

  if (punctuationDensity > 3) {
    score += 5;
    signals.push({
      name: 'Punctuation Density',
      impact: 'increased',
      value: `High density (${punctuationDensity.toFixed(1)} per sentence) suggests complex structure`
    });
  } else if (punctuationDensity < 0.5) {
    score -= 3;
    signals.push({
      name: 'Punctuation Density',
      impact: 'decreased',
      value: `Low density (${punctuationDensity.toFixed(1)} per sentence) suggests simple structure`
    });
  } else {
    signals.push({
      name: 'Punctuation Density',
      impact: 'neutral',
      value: `Normal density (${punctuationDensity.toFixed(1)} per sentence)`
    });
  }

  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
  if (paragraphs.length >= 3) {
    const paragraphLengths = paragraphs.map(p => p.split(/\s+/).length);
    const avgParagraphLength = paragraphLengths.reduce((a, b) => a + b, 0) / paragraphLengths.length;
    const paragraphVariance = paragraphLengths.reduce((sum, len) => {
      return sum + Math.pow(len - avgParagraphLength, 2);
    }, 0) / paragraphLengths.length;
    const paragraphStdDev = Math.sqrt(paragraphVariance);

    if (paragraphStdDev < 10) {
      score += 10;
      signals.push({
        name: 'Paragraph Consistency',
        impact: 'increased',
        value: `Highly consistent lengths suggest structured generation`
      });
    } else {
      score -= 5;
      signals.push({
        name: 'Paragraph Consistency',
        impact: 'decreased',
        value: `Variable lengths suggest organic composition`
      });
    }
  }

  const transitionWords = ['however', 'moreover', 'furthermore', 'therefore', 'consequently', 'nevertheless', 'additionally'];
  const transitionCount = transitionWords.filter(word =>
    text.toLowerCase().includes(word)
  ).length;

  if (transitionCount >= 3 && wordCount < 200) {
    score += 8;
    signals.push({
      name: 'Transition Word Density',
      impact: 'increased',
      value: `High use of formal transitions (${transitionCount} found)`
    });
  }
const repeatedPhrases = [
 "important to note",
 "in conclusion",
 "it is worth noting",
 "overall",
 "moreover"
];

let repetitionHits = 0;

repeatedPhrases.forEach(p => {
 if (text.toLowerCase().includes(p)) repetitionHits++;
});

if (repetitionHits >= 2) {
 score += 7;
 signals.push({
   name: 'Repeated Generic Phrases',
   impact: 'increased',
   value: 'Repeated generic AI-like phrasing detected'
 });
}

const personalMarkers = ['i ','my ','we ','our ','me '];

let personalCount = 0;

personalMarkers.forEach(p => {
 if (text.toLowerCase().includes(p)) personalCount++;
});

if (personalCount >= 2) {
 score -= 10;
 signals.push({
   name:'Personal Authorship Signals',
   impact:'decreased',
   value:'Personal expressions suggest human writing'
 });
}

if (sentenceLengthStdDev < 2.2 && wordCount > 80) {
 score += 10;
 signals.push({
   name:'Low Burstiness',
   impact:'increased',
   value:'Uniform sentence rhythm resembles generated text'
 });
}
  score = Math.max(0, Math.min(100, score));

  let label: 'Low' | 'Medium' | 'High';
  let explanation: string;

  if (score >= 72) {
    label = 'High';
    explanation = 'High estimated AI involvement. The text exhibits patterns commonly associated with AI-generated content, including consistent sentence structure, formal vocabulary patterns, and uniform stylistic features. These characteristics suggest algorithmic generation, though formal writing by humans can sometimes produce similar patterns.';
  } else if (score >= 48) {
    label = 'Medium';
    explanation = 'Medium estimated AI involvement. The text shows mixed characteristics with some patterns suggesting automated generation alongside elements of human writing style. The analysis indicates possible AI assistance or editing, but definitive determination is not possible without additional context.';
  } else {
    label = 'Low';
    explanation = 'Low estimated AI involvement. The text demonstrates natural variation in vocabulary, sentence structure, and stylistic choices more consistent with human authorship. The patterns suggest organic composition with typical human writing irregularities and personal style markers.';
  }

  return {
    score,
    label,
    explanation,
    signals
  };
}
