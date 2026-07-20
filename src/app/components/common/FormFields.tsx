import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label className="font-['Inter:Medium',sans-serif] text-rise-fg text-[14px]">
            {label}
            {props.required && <span className="text-[#ec5d5e] ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={`bg-rise-raised border rounded-lg px-4 py-3 text-rise-fg font-['Inter:Regular',sans-serif] text-[14px] transition-colors focus:outline-none ${
            error
              ? "border-[#ec5d5e] focus:border-[#ec5d5e]"
              : "border-rise-line focus:border-[#14E9BC]"
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="font-['Inter:Regular',sans-serif] text-[#ec5d5e] text-[12px]">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="font-['Inter:Regular',sans-serif] text-rise-fg-2 text-[12px]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

interface TextAreaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  rows?: number;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, helperText, rows = 4, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label className="font-['Inter:Medium',sans-serif] text-rise-fg text-[14px]">
            {label}
            {props.required && <span className="text-[#ec5d5e] ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={`bg-rise-raised border rounded-lg px-4 py-3 text-rise-fg font-['Inter:Regular',sans-serif] text-[14px] transition-colors focus:outline-none resize-none ${
            error
              ? "border-[#ec5d5e] focus:border-[#ec5d5e]"
              : "border-rise-line focus:border-[#14E9BC]"
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="font-['Inter:Regular',sans-serif] text-[#ec5d5e] text-[12px]">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="font-['Inter:Regular',sans-serif] text-rise-fg-2 text-[12px]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

TextArea.displayName = "TextArea";

interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label className="font-['Inter:Medium',sans-serif] text-rise-fg text-[14px]">
            {label}
            {props.required && <span className="text-[#ec5d5e] ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={`bg-rise-raised border rounded-lg px-4 py-3 text-rise-fg font-['Inter:Regular',sans-serif] text-[14px] transition-colors focus:outline-none ${
            error
              ? "border-[#ec5d5e] focus:border-[#ec5d5e]"
              : "border-rise-line focus:border-[#14E9BC]"
          } ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="font-['Inter:Regular',sans-serif] text-[#ec5d5e] text-[12px]">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="font-['Inter:Regular',sans-serif] text-rise-fg-2 text-[12px]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
