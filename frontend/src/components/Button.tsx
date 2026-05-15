import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}: ButtonProps) => {
  const baseStyles = 'px-6 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-accent-gold text-primary-dark hover:bg-yellow-500 shadow-lg hover:shadow-xl',
    secondary: 'bg-primary-purple text-neutral-white hover:bg-accent-lavender',
    outline: 'border-2 border-accent-gold text-accent-gold hover:bg-accent-gold hover:text-primary-dark',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const sizeClass =
    size === 'sm'
      ? 'px-4 py-2 text-sm'
      : size === 'lg'
      ? 'px-8 py-4 text-base'
      : 'px-6 py-3 text-base';

  return (
    <button
      className={`${baseStyles} ${sizeClass} ${variants[variant]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
