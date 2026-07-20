interface SimpleChartProps {
  data: { label: string; value: number; color: string }[];
  height?: number;
}

export function SimpleBarChart({ data, height = 200 }: SimpleChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className="space-y-4">
      {data.map((item, index) => {
        const percentage = (item.value / maxValue) * 100;

        return (
          <div key={index}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-['Inter:Regular',sans-serif] text-rise-fg-2 text-[14px]">
                {item.label}
              </span>
              <span className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[14px]">
                {item.value}
              </span>
            </div>
            <div className="w-full bg-rise-raised rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface SimpleLineChartProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}

export function SimpleLineChart({ data, color = "#14E9BC", height = 200 }: SimpleLineChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const range = maxValue - minValue || 1;

  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((item.value - minValue) / range) * 100;
    return `${x},${y}`;
  });

  const pathData = `M ${points.join(" L ")}`;

  return (
    <div className="relative" style={{ height }}>
      <svg
        className="w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="#333"
            strokeWidth="0.5"
            strokeDasharray="2,2"
          />
        ))}

        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />

        {/* Points */}
        {points.map((point, index) => {
          const [x, y] = point.split(",");
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill={color}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>

      {/* Labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-[10px] text-rise-fg-2 font-['Inter:Regular',sans-serif]">
        {data.map((item, index) => (
          <span key={index}>{item.label}</span>
        ))}
      </div>
    </div>
  );
}
