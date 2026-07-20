import svgPaths from "../../../imports/svg-xl2a669z0b";

interface MetricCardProps {
  title: string;
  value: string | number;
  variation: string;
  isPositive?: boolean;
  gradient?: boolean;
}

export function MetricCard({ title, value, variation, isPositive = true, gradient = false }: MetricCardProps) {
  const bgClass = gradient
    ? "h-[125px] relative rounded-[8px] shrink-0"
    : "bg-rise-surface h-[125px] relative rounded-[8px] shrink-0";

  const gradientStyle = gradient
    ? { backgroundImage: "var(--rise-gradient-card)" }
    : {};

  const borderClass = gradient
    ? "absolute border-[1.5px] border-solid inset-0 pointer-events-none rounded-[8px]"
    : "absolute border-rise-line border-[1.5px] border-solid inset-0 pointer-events-none rounded-[8px]";

  const borderStyle = gradient ? { borderColor: "var(--rise-gradient-card-border)" } : {};

  return (
    <div className={bgClass} style={gradientStyle}>
      <div className="content-stretch flex flex-col gap-[20px] items-start justify-end overflow-clip p-[16px] relative rounded-[inherit] size-full">
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-h-px min-w-px relative">
          <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.3] not-italic relative shrink-0 text-rise-fg-2 text-[14px]">
            {title}
          </p>
          <div className="content-stretch flex items-center relative shrink-0 w-full">
            <p className="font-['Inter:Bold',sans-serif] font-bold leading-[1.1] not-italic relative shrink-0 text-rise-fg text-[20px]">
              {value}
            </p>
          </div>
        </div>

        <div className="content-stretch flex items-center justify-between pt-[12px] relative shrink-0 w-full">
          <div aria-hidden="true" className="absolute border-rise-line border-solid border-t inset-0 pointer-events-none" />
          <div className="content-stretch flex flex-[1_0_0] gap-[2px] items-center leading-[1.3] min-h-px min-w-px not-italic relative text-[14px] overflow-hidden">
            <p className={`font-['Inter:Medium',sans-serif] font-medium relative shrink-0 truncate text-[12px] ${isPositive ? 'text-[#28d939]' : 'text-[#ec5d5e]'}`}>
              {variation}
            </p>
          </div>
          <div className="relative shrink-0 size-[20px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
              <g>
                <path clipRule="evenodd" d={svgPaths.p1ede8100} fill="var(--fill-0, #BDBDBD)" fillRule="evenodd" />
              </g>
            </svg>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className={borderClass} style={borderStyle} />
    </div>
  );
}
