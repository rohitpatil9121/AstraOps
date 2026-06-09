import { useEffect, useState } from "react";
import {
  Shield,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { supabase } from "../supabase";

async function getToken() {
  const { data } = await supabase.auth.getSession();
  return data?.session?.access_token || localStorage.getItem("token") || "";
}

function SecurityCard({ title, value, icon, color = "text-white" }) {
  return (
    <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>

          <h2 className={`text-3xl font-semibold mt-3 ${color}`}>
            {value}
          </h2>
        </div>

        <div className="h-12 w-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function Security() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSecurity = async () => {
      try {
        const token = await getToken();

        const response = await fetch(
          "http://127.0.0.1:8000/aws-metrics",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        setMetrics(data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    loadSecurity();
  }, []);

  const summary = metrics?.summary || {};
  const instances = metrics?.instances || [];
  const alerts = metrics?.alerts || [];

  const failedChecks = instances.filter(
    (i) => i.status_check_failed === 1
  ).length;

  const securityScore = summary.health_score || 0;

  return (
    <div className="flex bg-[#0B1220] min-h-screen">
      <Sidebar />

      <div className="flex-1 min-w-0">
        <Navbar />

        <main className="p-6 md:p-8 space-y-8">

          {/* Header */}
          <div>
            <h1 className="text-3xl font-semibold text-white">
              Security Center
            </h1>

            <p className="text-slate-400 mt-2">
              Infrastructure security monitoring and risk analysis.
            </p>
          </div>

          {/* Top Cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

            <SecurityCard
              title="Security Score"
              value={`${securityScore}%`}
              color="text-emerald-400"
              icon={<Shield size={22} className="text-emerald-400" />}
            />

            <SecurityCard
              title="Infrastructure Alerts"
              value={summary.alerts || 0}
              color="text-yellow-400"
              icon={<AlertTriangle size={22} className="text-yellow-400" />}
            />

            <SecurityCard
              title="Failed Status Checks"
              value={failedChecks}
              color="text-red-400"
              icon={<ShieldAlert size={22} className="text-red-400" />}
            />

            <SecurityCard
              title="Protected Instances"
              value={summary.running_instances || 0}
              color="text-cyan-400"
              icon={<CheckCircle2 size={22} className="text-cyan-400" />}
            />

          </section>

          {/* Findings */}
          <section className="bg-[#111827] border border-slate-800 rounded-2xl p-6">

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white">
                Security Findings
              </h2>

              <p className="text-sm text-slate-400 mt-1">
                Current infrastructure security observations.
              </p>
            </div>

            {loading ? (
              <p className="text-slate-400">
                Loading security findings...
              </p>
            ) : (
              <div className="space-y-4">

                {alerts.length === 0 ? (
                  <div className="border border-emerald-500/20 bg-emerald-500/10 rounded-xl p-4">
                    <p className="text-emerald-400">
                      No active security alerts detected.
                    </p>
                  </div>
                ) : (
                  alerts.map((alert, index) => (
                    <div
                      key={index}
                      className="border border-yellow-500/20 bg-yellow-500/10 rounded-xl p-4"
                    >
                      <p className="text-yellow-400">
                        {alert}
                      </p>
                    </div>
                  ))
                )}

              </div>
            )}
          </section>

          {/* Recommendations */}
          <section className="bg-[#111827] border border-slate-800 rounded-2xl p-6">

            <h2 className="text-xl font-semibold text-white mb-4">
              Recommendations
            </h2>

            <div className="space-y-3 text-slate-300">

              <p>
                • Monitor EC2 status checks continuously.
              </p>

              <p>
                • Review CloudWatch alerts regularly.
              </p>

              <p>
                • Enable least-privilege IAM permissions.
              </p>

              <p>
                • Audit public-facing infrastructure periodically.
              </p>

            </div>

          </section>

        </main>
      </div>
    </div>
  );
}