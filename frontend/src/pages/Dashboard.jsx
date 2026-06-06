import { useEffect, useMemo, useState } from "react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import MetricCard from "../components/MetricCard";
import AIInsightsPanel from "../components/AIInsightsPanel";
import LiveChart from "../components/LiveChart";
import AlertsPanel from "../components/AlertsPanel";
import K8sPods from "../components/K8sPods";
import AWSInstances from "../components/AWSInstances";
import { supabase } from "../supabase";

async function getToken() {
  const { data } = await supabase.auth.getSession();
  const sessionToken = data?.session?.access_token;

  if (sessionToken) {
    localStorage.setItem("token", sessionToken);
    return sessionToken;
  }

  const stored = localStorage.getItem("token");
  return stored || "";
}

const initialMetrics = {
  cpu_usage: 0,
  memory_usage: 0,
  containers: 0,
  alerts: 0,
  health_score: 0,
  severity: "stable",
  ai_message: "",
  scaling: "",
  cloud_regions: [],
  traffic_message: "",
  docker_metrics: [],
  k8s_pods: [],
};

export default function Dashboard() {
  const [metrics, setMetrics] = useState(initialMetrics);
  const [ec2Instances, setEc2Instances] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loadingEC2, setLoadingEC2] = useState(true);

  useEffect(() => {
    let ws;
    let alive = true;

    const start = async () => {
      const token = await getToken();
      if (!alive) return;

      ws = new WebSocket(
        token
          ? `ws://127.0.0.1:8000/ws/metrics?token=${encodeURIComponent(token)}`
          : "ws://127.0.0.1:8000/ws/metrics"
      );

      ws.onopen = () => console.log("WebSocket Connected 🚀");

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setMetrics((prev) => ({ ...prev, ...data }));
          setChartData((prev) =>
            [
              ...prev,
              {
                time: new Date().toLocaleTimeString(),
                cpu: Number(data?.cpu_usage ?? 0),
                memory: Number(data?.memory_usage ?? 0),
              },
            ].slice(-12)
          );
        } catch (error) {
          console.error("Invalid websocket payload:", error);
        }
      };

      ws.onerror = (error) => console.log("WebSocket Error:", error);
      ws.onclose = () => console.log("WebSocket Disconnected");
    };

    start();

    return () => {
      alive = false;
      if (ws) ws.close();
    };
  }, []);

  useEffect(() => {
    let alive = true;

    const loadEC2 = async () => {
      try {
        setLoadingEC2(true);
        const token = await getToken();
        if (!token) {
          if (alive) setEc2Instances([]);
          return;
        }

        const response = await fetch("http://127.0.0.1:8000/user-ec2", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (alive) setEc2Instances(Array.isArray(data) ? data : []);
      } catch (error) {
        console.log("EC2 Error:", error);
        if (alive) setEc2Instances([]);
      } finally {
        if (alive) setLoadingEC2(false);
      }
    };

    loadEC2();
    return () => {
      alive = false;
    };
  }, []);

  const healthColor = useMemo(() => {
    if (metrics.severity === "critical") return "text-red-400";
    if (metrics.severity === "warning") return "text-yellow-400";
    return "text-emerald-400";
  }, [metrics.severity]);

  return (
  <div className="flex bg-[#0B1220] min-h-screen">
    <Sidebar />

    <div className="flex-1 min-w-0">
      <Navbar />

      <main className="p-6 md:p-8 space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-white">
            Infrastructure Overview
          </h1>

          <p className="text-slate-400 mt-2">
            Monitor cloud resources, containers, and cluster health.
          </p>
        </div>

        {/* Metrics */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            <MetricCard
              title="CPU Utilization"
              value={`${metrics.cpu_usage}%`}
            />

            <MetricCard
              title="Memory Utilization"
              value={`${metrics.memory_usage}%`}
            />

            <MetricCard
              title="Active Containers"
              value={metrics.containers}
            />

            <MetricCard
              title="EC2 Instances"
              value={ec2Instances.length}
            />

            <MetricCard
              title="Active Alerts"
              value={metrics.alerts}
            />

            <MetricCard
              title="System Health"
              value={`${metrics.health_score}%`}
            />
          </div>
        </section>

        {/* Infrastructure Health */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Infrastructure Health
            </h2>

            <p className="text-sm text-slate-400 mt-1">
              Realtime CPU and memory utilization.
            </p>
          </div>

          <LiveChart chartData={chartData} />
        </section>

        {/* Resources */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Active Resources
            </h2>

            <p className="text-sm text-slate-400 mt-1">
              Infrastructure inventory across cloud and container platforms.
            </p>
          </div>

          <AWSInstances
            instances={Array.isArray(ec2Instances) ? ec2Instances : []}
            loading={loadingEC2}
          />

          <K8sPods
            pods={Array.isArray(metrics.k8s_pods) ? metrics.k8s_pods : []}
          />
        </section>

        {/* Insights */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Operational Insights
            </h2>

            <p className="text-sm text-slate-400 mt-1">
              Infrastructure analysis and operational recommendations.
            </p>
          </div>

          <AIInsightsPanel
            ai_message={metrics.ai_message}
            scaling={metrics.scaling}
            severity={metrics.severity}
            health_score={metrics.health_score}
          />
        </section>

        {/* Alerts */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Alerts & Events
            </h2>

            <p className="text-sm text-slate-400 mt-1">
              Active incidents and infrastructure notifications.
            </p>
          </div>

          <AlertsPanel
            alerts={metrics.alerts}
            severity={metrics.severity}
            traffic_message={metrics.traffic_message}
          />
        </section>

      </main>
    </div>
  </div>
);
}