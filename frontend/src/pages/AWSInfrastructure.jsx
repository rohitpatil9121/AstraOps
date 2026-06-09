import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Cloud, Server, Activity, Shield } from "lucide-react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { supabase } from "../supabase";

async function getToken() {
  const { data } = await supabase.auth.getSession();
  return data?.session?.access_token || localStorage.getItem("token") || "";
}

function StatCard({ label, value, icon, tone = "text-white" }) {
  return (
    <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <h2 className={`text-3xl font-semibold mt-3 ${tone}`}>{value}</h2>
        </div>
        <div className="h-12 w-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function AWSInfrastructure() {
  const navigate = useNavigate();

  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const apiUrl = useMemo(() => {
    const base = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
    return base.replace(/\/$/, "");
  }, []);

  const loadInstances = async () => {
    try {
      setRefreshing(true);
      setLoading(true);
      setError("");

      const token = await getToken();

      if (!token) {
        throw new Error("No auth token found. Please login again.");
      }

      const response = await fetch(`${apiUrl}/user-ec2`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log("user-ec2 response:", data);

      if (!response.ok) {
        throw new Error(
          data?.detail || data?.error || "Failed to load EC2 data"
        );
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
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInstances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runningCount = instances.filter((i) => i.state === "running").length;
  const stoppedCount = instances.filter((i) => i.state === "stopped").length;
  const totalCount = instances.length;

  return (
    <div className="flex bg-[#0B1220] min-h-screen">
      <Sidebar />

      <div className="flex-1 min-w-0">
        <Navbar />

        <main className="p-6 md:p-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition"
              >
                <ArrowLeft size={16} />
                Back to Dashboard
              </button>

              <div>
                <h1 className="text-3xl font-semibold text-white">
                  AWS Infrastructure
                </h1>
                <p className="text-slate-400 mt-2 max-w-2xl">
                  View EC2 inventory, instance state, and AWS connectivity from a clean operations view.
                </p>
              </div>
            </div>

            <button
              onClick={loadInstances}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-800 bg-slate-900/70 text-sm text-white hover:bg-slate-800 transition disabled:opacity-60"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {/* Summary Cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            <StatCard
              label="EC2 Instances"
              value={totalCount}
              icon={<Cloud size={20} />}
            />

            <StatCard
              label="Running Instances"
              value={runningCount}
              icon={<Activity size={20} />}
              tone="text-emerald-400"
            />

            <StatCard
              label="Stopped Instances"
              value={stoppedCount}
              icon={<Server size={20} />}
              tone="text-yellow-400"
            />

            <StatCard
              label="AWS Status"
              value="Connected"
              icon={<Shield size={20} />}
              tone="text-emerald-400"
            />
          </section>

          {/* Inventory */}
          <section className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  EC2 Inventory
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Available compute resources from the connected AWS account.
                </p>
              </div>

              <div className="text-sm text-slate-400">
                Region: <span className="text-white font-medium">us-east-1</span>
              </div>
            </div>

            {loading ? (
              <div className="py-10 text-slate-400">Loading infrastructure...</div>
            ) : error ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 p-4">
                {error}
              </div>
            ) : instances.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 text-slate-400 p-6">
                No EC2 instances found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-left">
                      <th className="py-3 pr-4 text-slate-400 font-medium">Name</th>
                      <th className="py-3 pr-4 text-slate-400 font-medium">Instance ID</th>
                      <th className="py-3 pr-4 text-slate-400 font-medium">State</th>
                      <th className="py-3 pr-4 text-slate-400 font-medium">Type</th>
                      <th className="py-3 pr-4 text-slate-400 font-medium">Public IP</th>
                      <th className="py-3 pr-4 text-slate-400 font-medium">Launch Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {instances.map((instance, index) => {
                      const isRunning = instance.state === "running";
                      const isStopped = instance.state === "stopped";

                      return (
                        <tr
                          key={instance.instance_id || index}
                          className="border-b border-slate-900 hover:bg-slate-900/30 transition"
                        >
                          <td className="py-4 pr-4 text-white font-medium">
                            {instance.name || "Unnamed"}
                          </td>
                          <td className="py-4 pr-4 text-slate-300">
                            {instance.instance_id || "N/A"}
                          </td>
                          <td className="py-4 pr-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                isRunning
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : isStopped
                                  ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                                  : "bg-slate-500/10 text-slate-300 border border-slate-500/20"
                              }`}
                            >
                              {instance.state || "unknown"}
                            </span>
                          </td>
                          <td className="py-4 pr-4 text-slate-300">
                            {instance.instance_type || "N/A"}
                          </td>
                          <td className="py-4 pr-4 text-slate-300">
                            {instance.public_ip || "N/A"}
                          </td>
                          <td className="py-4 pr-4 text-slate-300">
                            {instance.launch_time
                              ? new Date(instance.launch_time).toLocaleString()
                              : "N/A"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}