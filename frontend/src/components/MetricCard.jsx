export default function MetricCard({
  title,
  value,
  trend,
}) {
  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">
      
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          {title}
        </p>

        {trend && (
          <span className="text-xs text-slate-500">
            {trend}
          </span>
        )}
      </div>

      <div className="mt-4">
        <h2 className="text-3xl font-semibold text-white">
          {value}
        </h2>
      </div>

    </div>
  );
}