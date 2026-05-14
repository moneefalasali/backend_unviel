import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const Card = ({ children, className = '', hover = false, onClick }: CardProps) => {
  const hoverStyles = hover ? 'hover:shadow-2xl hover:scale-105 cursor-pointer' : '';

  return (
    <div
      onClick={onClick}
      className={`bg-primary-dark rounded-xl shadow-lg transition-all duration-300 ${hoverStyles} ${className}`}
    >
      {children}
    </div>
  );
};
