interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-12 text-center">
      {icon && (
        <div className="flex items-center justify-center mb-4 text-[#333]">
          {icon}
        </div>
      )}
      <h3 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[18px] mb-2">
        {title}
      </h3>
      {description && (
        <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[14px] mb-6">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="bg-[#14E9BC] text-[#000] px-6 py-3 rounded-lg font-['Inter:Semi_Bold',sans-serif] font-semibold text-[14px] hover:bg-[#12d4a8] transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
