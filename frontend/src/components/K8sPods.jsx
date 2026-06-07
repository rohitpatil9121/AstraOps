const badgeClasses = {
  Running: "bg-emerald-500/15 text-emerald-400",
  Pending: "bg-yellow-500/15 text-yellow-400",
  Failed: "bg-red-500/15 text-red-400",
  Succeeded: "bg-cyan-500/15 text-cyan-400",
};

export default function K8sPods({ pods = [] }) {
  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-6">

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Kubernetes Workloads
          </h2>

          <p className="text-sm text-slate-400 mt-1">
            Active workloads running across the cluster.
          </p>
        </div>

        <span className="text-sm text-slate-400">
          {pods.length} workloads
        </span>
      </div>

      {pods.length === 0 ? (
        <div className="text-slate-400 text-sm">
          No Kubernetes workloads detected.
        </div>
      ) : (
        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-3 text-slate-500 font-medium">
                  Pod
                </th>

                <th className="text-left py-3 text-slate-500 font-medium">
                  Namespace
                </th>

                <th className="text-left py-3 text-slate-500 font-medium">
                  Node
                </th>

                <th className="text-left py-3 text-slate-500 font-medium">
                  Restarts
                </th>

                <th className="text-left py-3 text-slate-500 font-medium">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {pods.map((pod, index) => (
                <tr
                  key={`${pod.name}-${index}`}
                  className="border-b border-slate-900 hover:bg-slate-900/40"
                >
                  <td className="py-4 text-white">
                    {pod.name || "Unknown Pod"}
                  </td>

                  <td className="py-4 text-slate-300">
                    {pod.namespace || "default"}
                  </td>

                  <td className="py-4 text-slate-300">
                    {pod.node || "N/A"}
                  </td>

                  <td className="py-4 text-white">
                    {pod.restarts ?? 0}
                  </td>

                  <td className="py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        badgeClasses[pod.status] ||
                        "bg-slate-700 text-slate-300"
                      }`}
                    >
                      {pod.status || "Unknown"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>

        </div>
      )}
    </div>
  );
}