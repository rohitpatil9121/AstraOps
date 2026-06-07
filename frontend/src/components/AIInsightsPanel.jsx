export default function AIInsightsPanel({
  ai_message,
  scaling,
  severity,
  health_score,
}) {
  const score = Math.max(
    0,
    Math.min(100, Number(health_score) || 0)
  );

  const severityColor =
    severity === "critical"
      ? "text-red-400"
      : severity === "warning"
      ? "text-yellow-400"
      : "text-emerald-400";

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-6">

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">
          Operational Insights
        </h2>

        <p className="text-sm text-slate-400 mt-1">
          Current infrastructure assessment and recommendations.
        </p>
      </div>

      <div className="space-y-4">

        <div className="border border-slate-800 rounded-lg p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
            Infrastructure Status
          </p>

          <p className="text-white">
            {ai_message || "Awaiting infrastructure metrics."}
          </p>
        </div>

        <div className="border border-slate-800 rounded-lg p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
            Capacity Recommendation
          </p>

          <p className="text-white">
            {scaling || "No action required."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">

          <div className="border border-slate-800 rounded-lg p-4">
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
              Severity
            </p>

            <p className={`font-medium capitalize ${severityColor}`}>
              {severity || "stable"}
            </p>
          </div>

          <div className="border border-slate-800 rounded-lg p-4">
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
              System Health
            </p>

            <p className="text-white font-medium">
              {score}%
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}