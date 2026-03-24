interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md" | "lg";
}

const variantStyles = {
  default: "bg-[#1a1a1a] text-[#bdbdbd]",
  success: "bg-[#28d939]/20 text-[#28d939]",
  warning: "bg-[#f59e0b]/20 text-[#f59e0b]",
  error: "bg-[#ec5d5e]/20 text-[#ec5d5e]",
  info: "bg-[#14E9BC]/20 text-[#14E9BC]",
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-[11px]",
  md: "px-2 py-1 text-[12px]",
  lg: "px-3 py-1.5 text-[14px]",
};

export function Badge({ children, variant = "default", size = "md" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded font-['Inter:Medium',sans-serif] ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {children}
    </span>
  );
}
