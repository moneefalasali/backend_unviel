import { Brain } from 'lucide-react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

export const Logo = ({ size = 'medium', showText = true }: LogoProps) => {
  const sizes = {
    small: { icon: 24, text: 'text-xl' },
    medium: { icon: 40, text: 'text-3xl' },
    large: { icon: 56, text: 'text-5xl' },
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <Brain size={sizes[size].icon} className="text-accent-gold" strokeWidth={1.5} />
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0.5 h-4 bg-gradient-to-b from-accent-gold to-transparent" />
      </div>
      {showText && (
        <span className={`${sizes[size].text} font-bold text-neutral-white tracking-tight`}>
          Unveil
        </span>
      )}
    </div>
  );
};
