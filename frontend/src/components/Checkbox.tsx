import { InputHTMLAttributes, forwardRef } from 'react';

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = '', ...props }, ref) => {
    return (
      <label className={`flex items-start gap-3 cursor-pointer ${className}`}>
        <input
          ref={ref}
          type="checkbox"
          className="mt-1 w-5 h-5 rounded border-2 border-primary-purple bg-primary-dark text-accent-gold focus:ring-2 focus:ring-accent-lavender cursor-pointer"
          {...props}
        />
        <span className="text-neutral-gray text-sm">{label}</span>
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
