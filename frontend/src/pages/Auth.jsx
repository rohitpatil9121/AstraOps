import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Cloud,
  Activity,
  Lock,
  Eye,
  EyeOff,
  Server,
  Database,
  Radio,
  Sparkles,
} from "lucide-react";
import { supabase } from "../supabase";

function MetricChip({ label, value, tone = "text-white" }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <p className={`mt-1 text-xl font-semibold ${tone}`}>{value}</p>
    </div>
  );
}

function FeatureRow({ icon, label }) {
  return (
    <div className="flex items-center gap-3 text-slate-200">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5">
        {icon}
      </div>
      <span className="text-sm">{label}</span>
    </div>
  );
}

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    localStorage.removeItem("token");

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        const token = data?.session?.access_token;
        if (!token) {
          throw new Error("Login succeeded but session token is missing.");
        }

        localStorage.setItem("token", token);

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/aws-status`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const awsData = await response.json();
        navigate(awsData.aws_connected ? "/dashboard" : "/connect-aws", {
          replace: true,
        });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        const token = data?.session?.access_token;

        if (token) {
          localStorage.setItem("token", token);
          navigate("/connect-aws", { replace: true });
        } else {
          alert(
            "Registration successful! Check your email to verify your account."
          );
          setIsLogin(true);
        }
      }
    } catch (err) {
      alert(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B1220]">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.14),transparent_30%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(11,18,32,0.2),rgba(11,18,32,0.95))]" />

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side */}
        <div className="hidden lg:flex flex-1 flex-col justify-between px-12 py-10">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">
              <Sparkles size={16} />
              Cloud Operations Command Center
            </div>

            <h1 className="mt-8 text-6xl font-semibold tracking-tight text-white">
              AstraOps
            </h1>

            <p className="mt-6 max-w-xl text-xl leading-8 text-slate-400">
              Monitor AWS infrastructure, track CloudWatch metrics, inspect
              security posture, and act on live operational signals from one
              clean interface.
            </p>

            <div className="mt-10 grid max-w-xl grid-cols-2 gap-4">
              <MetricChip label="AWS Health" value="92%" tone="text-emerald-400" />
              <MetricChip label="EC2 Running" value="1" tone="text-cyan-400" />
              <MetricChip label="Alerts" value="0" tone="text-yellow-400" />
              <MetricChip label="Region" value="us-east-1" tone="text-white" />
            </div>

            <div className="mt-12 space-y-4">
              <FeatureRow
                icon={<Cloud size={16} className="text-cyan-400" />}
                label="Real-time AWS infrastructure monitoring"
              />
              <FeatureRow
                icon={<Activity size={16} className="text-emerald-400" />}
                label="CloudWatch CPU and memory observability"
              />
              <FeatureRow
                icon={<Shield size={16} className="text-yellow-400" />}
                label="Security center and alert engine"
              />
              <FeatureRow
                icon={<Lock size={16} className="text-purple-400" />}
                label="Secure Supabase authentication"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid max-w-2xl grid-cols-3 gap-4"
          >
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <div className="flex items-center gap-3 text-slate-300">
                <Server size={18} className="text-cyan-400" />
                <span className="text-sm">Infrastructure</span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-white">Live</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <div className="flex items-center gap-3 text-slate-300">
                <Database size={18} className="text-emerald-400" />
                <span className="text-sm">CloudWatch</span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-white">Active</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <div className="flex items-center gap-3 text-slate-300">
                <Radio size={18} className="text-yellow-400" />
                <span className="text-sm">Security</span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-white">Ready</p>
            </div>
          </motion.div>
        </div>

        {/* Right Side */}
        <div className="flex w-full max-w-xl items-center justify-center px-4 py-8 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45 }}
            className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/6 p-8 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-8">
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">
                AstraOps Access
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-white">
                {isLogin ? "Welcome back" : "Create your account"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {isLogin
                  ? "Sign in to continue monitoring your cloud environment."
                  : "Create your AstraOps account and connect AWS next."}
              </p>
            </div>

            <div className="mb-6 grid grid-cols-2 rounded-2xl border border-white/10 bg-black/20 p-1">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`rounded-xl py-3 text-sm font-medium transition ${
                  isLogin
                    ? "bg-cyan-500 text-black"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`rounded-xl py-3 text-sm font-medium transition ${
                  !isLogin
                    ? "bg-cyan-500 text-black"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500/60"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3.5 pr-12 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-cyan-500 py-3.5 font-semibold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Please wait..."
                  : isLogin
                  ? "Sign In"
                  : "Create Account"}
              </button>
            </form>

            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="text-center text-xs text-slate-500">
                AstraOps • Cloud Monitoring Platform
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}