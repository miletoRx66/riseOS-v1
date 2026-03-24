interface ContentCardProps {
  title?: string;
  imageUrl?: string;
}

export function ContentCard({ title = "Conteúdo Rise", imageUrl }: ContentCardProps) {
  return (
    <div className="bg-[#0f0f0f] border border-[#333] rounded-lg overflow-hidden hover:border-[#555] transition-all group cursor-pointer">
      <div className="aspect-video bg-gradient-to-br from-[#14E9BC]/20 to-[#0a0a0a] flex items-center justify-center relative overflow-hidden">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent opacity-60" />
      </div>
      <div className="p-4">
        <p className="font-['Inter:Medium',sans-serif] text-[#eee] text-[14px] line-clamp-2">
          {title}
        </p>
      </div>
    </div>
  );
}