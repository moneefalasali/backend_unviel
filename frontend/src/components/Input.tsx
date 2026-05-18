import { InputHTMLAttributes, forwardRef, useId } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id ?? useId();

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-neutral-white text-sm font-medium mb-2">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`w-full px-4 py-3 bg-primary-dark text-neutral-white rounded-lg border-2 border-primary-purple focus:border-accent-lavender focus:outline-none transition-colors duration-200 placeholder-neutral-gray ${className}`}
          {...props}
        />
        {error && (
          <p className="text-red-400 text-sm mt-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
