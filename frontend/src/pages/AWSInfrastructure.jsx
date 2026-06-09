import { useEffect, useState } from "react";
import { supabase } from "../supabase";

async function getToken() {
  const { data } = await supabase.auth.getSession();
  return data?.session?.access_token || localStorage.getItem("token") || "";
}

export default function AWSInfrastructure() {
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadInstances = async () => {
      try {
        setLoading(true);
        setError("");

        const token = await getToken();

        if (!token) {
          setError("No auth token found. Please login again.");
          setInstances([]);
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/user-ec2`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        console.log("user-ec2 response:", data);

        if (!response.ok) {
          throw new Error(data?.detail || "Failed to load EC2 data");
        }

        const normalized =
          Array.isArray(data)
            ? data
            : Array.isArray(data?.instances)
            ? data.instances
            : Array.isArray(data?.data)
            ? data.data
            : [];

        setInstances(normalized);
      } catch (err) {
        console.error("AWSInfrastructure error:", err);
        setError(err.message || "Unable to load EC2 data");
        setInstances([]);
      } finally {
        setLoading(false);
      }
    };

    loadInstances();
  }, []);

  return (
    <div className="p-8 text-white space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">AWS Infrastructure</h1>
        <p className="text-slate-400 mt-2">
          Monitor and manage AWS resources.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">
          <p className="text-sm text-slate-400">EC2 Instances</p>
          <h2 className="text-3xl font-semibold mt-3">{instances.length}</h2>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">
          <p className="text-sm text-slate-400">Running Instances</p>
          <h2 className="text-3xl font-semibold mt-3">
            {instances.filter((i) => i.state === "running").length}
          </h2>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">
          <p className="text-sm text-slate-400">AWS Status</p>
          <h2 className="text-3xl font-semibold mt-3 text-emerald-400">
            Connected
          </h2>
        </div>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">EC2 Inventory</h2>
          <p className="text-slate-400 text-sm mt-1">
            Available compute resources.
          </p>
        </div>

        {loading ? (
          <p className="text-slate-400">Loading infrastructure...</p>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : instances.length === 0 ? (
          <p className="text-slate-400">No EC2 instances found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-3 text-slate-400 font-medium">Name</th>
                <th className="text-left py-3 text-slate-400 font-medium">Instance ID</th>
                <th className="text-left py-3 text-slate-400 font-medium">State</th>
                <th className="text-left py-3 text-slate-400 font-medium">Type</th>
                <th className="text-left py-3 text-slate-400 font-medium">Public IP</th>
              </tr>
            </thead>
            <tbody>
              {instances.map((instance, index) => (
                <tr key={index} className="border-b border-slate-900">
                  <td className="py-4">{instance.name || "Unnamed"}</td>
                  <td className="py-4">{instance.instance_id || "N/A"}</td>
                  <td className="py-4">{instance.state || "unknown"}</td>
                  <td className="py-4">{instance.instance_type || "N/A"}</td>
                  <td className="py-4">{instance.public_ip || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}