export default function LiveChart({ chartData = [] }) {
  const width = 800;
  const height = 320;
  const padding = 36;

  const series = Array.isArray(chartData) ? chartData : [];
  const points = series.map((point, index) => {
    const x =
      series.length <= 1
        ? padding
        : padding + (index / (series.length - 1)) * (width - padding * 2);

    const cpu = Number(point?.cpu ?? 0);
    const memory = Number(point?.memory ?? 0);

    const cpuY = height - padding - (Math.max(0, Math.min(100, cpu)) / 100) * (height - padding * 2);
    const memoryY =
      height - padding - (Math.max(0, Math.min(100, memory)) / 100) * (height - padding * 2);

    return {
      x,
      cpuY,
      memoryY,
      label: point?.time || "",
      cpu,
      memory,
    };
  });

  const cpuPath = points
    .map((p, index) => `${index === 0 ? "M" : "L"} ${p.x} ${p.cpuY}`)
    .join(" ");

  const memoryPath = points
    .map((p, index) => `${index === 0 ? "M" : "L"} ${p.x} ${p.memoryY}`)
    .join(" ");

  const gridLines = [0, 25, 50, 75, 100];

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 min-w-0">
      <div className="flex items-center justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold text-white">Realtime Infrastructure Metrics 📈</h2>
        <span className="text-cyan-400 text-sm">Live</span>
      </div>

      {points.length === 0 ? (
        <div className="h-80 flex items-center justify-center text-gray-400 text-sm bg-black/10 rounded-2xl border border-white/5">
          Waiting for live metrics...
        </div>
      ) : (
        <div className="h-80 min-w-0">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full block">
            {gridLines.map((line) => {
              const y = height - padding - (line / 100) * (height - padding * 2);
              return (
                <g key={line}>
                  <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#1F2937" strokeWidth="1" />
                  <text x="8" y={y + 4} fill="#9CA3AF" fontSize="12">
                    {line}%
                  </text>
                </g>
              );
            })}

            {cpuPath && (
              <path
                d={cpuPath}
                fill="none"
                stroke="#06B6D4"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {memoryPath && (
              <path
                d={memoryPath}
                fill="none"
                stroke="#22C55E"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {points.map((point, index) => (
              <g key={`${point.label}-${index}`}>
                <circle cx={point.x} cy={point.cpuY} r="4" fill="#06B6D4" />
                <circle cx={point.x} cy={point.memoryY} r="4" fill="#22C55E" />
              </g>
            ))}

            <g>
              <rect x={padding} y={12} width="190" height="52" rx="14" fill="#0F172A" stroke="#334155" />
              <circle cx={52} cy={28} r="5" fill="#06B6D4" />
              <text x="66" y="32" fill="#E5E7EB" fontSize="13">CPU Usage</text>
              <circle cx={52} cy={48} r="5" fill="#22C55E" />
              <text x="66" y="52" fill="#E5E7EB" fontSize="13">Memory Usage</text>
            </g>
          </svg>
        </div>
      )}
    </div>
  );
}
