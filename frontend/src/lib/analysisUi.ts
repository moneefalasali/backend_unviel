import { AlertCircle, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react';
import type { AnalysisResultSignalImpact } from './types';

export interface AnalysisStatusConfig {
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
  label: string;
}

export const getAnalysisStatusConfig = (aiPercentage: number): AnalysisStatusConfig => {
  if (aiPercentage >= 70) {
    return {
      icon: AlertCircle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500',
      label: 'High AI Likelihood',
    };
  }

  if (aiPercentage >= 40) {
    return {
      icon: AlertTriangle,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500',
      label: 'Medium AI Likelihood',
    };
  }

  return {
    icon: CheckCircle,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500',
    label: 'Low AI Likelihood',
  };
};

export const getAnalysisPercentageTextColor = (aiPercentage: number) => {
  if (aiPercentage >= 70) return 'text-red-400';
  if (aiPercentage >= 40) return 'text-yellow-400';
  return 'text-green-400';
};

export const getSignalIcon = (impact: AnalysisResultSignalImpact) => {
  switch (impact) {
    case 'increased':
      return TrendingUp;
    case 'decreased':
      return TrendingDown;
    default:
      return Minus;
  }
};

export const getSignalClassName = (impact: AnalysisResultSignalImpact) => {
  switch (impact) {
    case 'increased':
      return 'text-red-400';
    case 'decreased':
      return 'text-green-400';
    default:
      return 'text-neutral-gray';
  }
};
