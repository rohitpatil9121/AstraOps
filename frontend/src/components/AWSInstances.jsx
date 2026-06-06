export default function AWSInstances({
  instances = [],
  loading = false,
}) {
  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-6">

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">
            EC2 Instances
          </h2>

          <p className="text-sm text-slate-400 mt-1">
            Active compute resources in AWS.
          </p>
        </div>

        <span className="text-sm text-slate-400">
          {instances.length} resources
        </span>
      </div>

      {loading ? (
        <div className="text-slate-400 text-sm">
          Loading infrastructure data...
        </div>
      ) : instances.length === 0 ? (
        <div className="text-slate-400 text-sm">
          No EC2 instances available.
        </div>
      ) : (
        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-3 text-slate-500 font-medium">
                  Name
                </th>

                <th className="text-left py-3 text-slate-500 font-medium">
                  Instance ID
                </th>

                <th className="text-left py-3 text-slate-500 font-medium">
                  State
                </th>

                <th className="text-left py-3 text-slate-500 font-medium">
                  Type
                </th>

                <th className="text-left py-3 text-slate-500 font-medium">
                  Public IP
                </th>

                <th className="text-left py-3 text-slate-500 font-medium">
                  CPU
                </th>
              </tr>
            </thead>

            <tbody>

              {instances.map((instance, index) => (
                <tr
                  key={`${instance.instance_id}-${index}`}
                  className="border-b border-slate-900 hover:bg-slate-900/40"
                >
                  <td className="py-4 text-white">
                    {instance.name || "Unnamed"}
                  </td>

                  <td className="py-4 text-slate-300">
                    {instance.instance_id || "N/A"}
                  </td>

                  <td className="py-4">

                    <span
                      className={
                        instance.state === "running"
                          ? "text-emerald-400"
                          : "text-slate-400"
                      }
                    >
                      {instance.state || "unknown"}
                    </span>

                  </td>

                  <td className="py-4 text-slate-300">
                    {instance.instance_type || "N/A"}
                  </td>

                  <td className="py-4 text-slate-300">
                    {instance.public_ip || "N/A"}
                  </td>

                  <td className="py-4 text-white">
                    {instance.cpu ?? 0}%
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