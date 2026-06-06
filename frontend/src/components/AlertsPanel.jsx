export default function AlertsPanel({
  alerts,
  severity,
  traffic_message,
}) {
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
          Alerts & Events
        </h2>

        <p className="text-sm text-slate-400 mt-1">
          Active incidents and infrastructure notifications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div className="border border-slate-800 rounded-lg p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
            Active Alerts
          </p>

          <p className="text-3xl font-semibold text-white">
            {alerts ?? 0}
          </p>
        </div>

        <div className="border border-slate-800 rounded-lg p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
            Current Severity
          </p>

          <p className={`font-medium capitalize ${severityColor}`}>
            {severity || "stable"}
          </p>
        </div>

        <div className="border border-slate-800 rounded-lg p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
            Traffic Analysis
          </p>

          <p className="text-white">
            {traffic_message ||
              "No traffic anomalies detected."}
          </p>
        </div>

      </div>
    </div>
  );
}