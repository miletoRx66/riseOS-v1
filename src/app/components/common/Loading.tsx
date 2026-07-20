interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export function Loading({ size = "md", text }: LoadingProps) {
  const sizeClasses = {
    sm: "w-6 h-6 border-2",
    md: "w-10 h-10 border-3",
    lg: "w-16 h-16 border-4",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <div
        className={`${sizeClasses[size]} border-rise-line border-t-[#14E9BC] rounded-full animate-spin`}
      />
      {text && (
        <p className="font-['Inter:Regular',sans-serif] text-rise-fg-2 text-[14px]">
          {text}
        </p>
      )}
    </div>
  );
}
