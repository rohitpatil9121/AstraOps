export default function AlertsPanel({
  alerts,
  severity,
  traffic_message,
}) {
  const alertList = Array.isArray(alerts) ? alerts : [];
  const alertCount = alertList.length;

  const severityColor =
    severity === "critical"
      ? "text-red-400"
      : severity === "warning"
      ? "text-yellow-400"
      : "text-emerald-400";

  const badgeBg =
    severity === "critical"
      ? "bg-red-500/10"
      : severity === "warning"
      ? "bg-yellow-500/10"
      : "bg-emerald-500/10";

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">Alerts & Events</h2>
        <p className="text-sm text-slate-400 mt-1">
          Active incidents and infrastructure notifications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-slate-800 rounded-lg p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
            Active Alerts
          </p>
          <p className="text-white text-3xl font-semibold">{alertCount}</p>
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
            {traffic_message || "Traffic telemetry not available."}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {alertCount === 0 ? (
          <div className="border border-slate-800 rounded-lg p-4">
            <p className="text-slate-400">
              No active alerts. System is operating normally.
            </p>
          </div>
        ) : (
          alertList.map((alert, index) => (
            <div
              key={`${alert.title || "alert"}-${index}`}
              className="border border-slate-800 rounded-lg p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-white font-medium">
                    {alert.title || "Untitled alert"}
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    {alert.description || ""}
                  </p>
                  <p className="text-sm text-slate-300 mt-2">
                    Recommendation: {alert.recommendation || "Review this alert."}
                  </p>
                </div>

                <span
                  className={`shrink-0 px-3 py-1 rounded-full text-xs uppercase tracking-wider ${badgeBg} ${severityColor}`}
                >
                  {alert.severity || "info"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}