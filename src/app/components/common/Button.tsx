import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const variantStyles = {
  primary: "bg-[#14E9BC] text-[#000] hover:bg-[#12d4a8]",
  secondary: "bg-[#292929] text-[#eee] hover:bg-[#333] border border-[#595959]",
  outline: "bg-transparent text-[#eee] border border-[#333] hover:bg-[#1a1a1a]",
  ghost: "bg-transparent text-[#bdbdbd] hover:bg-[#1a1a1a] hover:text-[#eee]",
};

const sizeStyles = {
  sm: "px-3 py-2 text-[13px]",
  md: "px-6 py-3 text-[14px]",
  lg: "px-8 py-4 text-[16px]",
};

export function Button({ 
  variant = "primary", 
  size = "md", 
  children, 
  className = "",
  ...props 
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-['Inter:Semi_Bold',sans-serif] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
