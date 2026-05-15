export type AnalysisResultLabel = 'Low' | 'Medium' | 'High';
export type AnalysisResultSignalImpact = 'increased' | 'decreased' | 'neutral';

export interface AnalysisResultSignal {
  name: string;
  impact: AnalysisResultSignalImpact;
  value: string;
}

export interface AnalysisResult {
  score: number;
  label: AnalysisResultLabel;
  classification?: string;
  aiPercentage?: number;
  humanPercentage?: number;
  explanation: string;
  signals: AnalysisResultSignal[];
  limitations: string[];
  analysisSource?: string;
  primaryService?: string;
  secondaryService?: string;
  serviceResults?: Array<{
    service: string;
    result: any;
  }>;
}
