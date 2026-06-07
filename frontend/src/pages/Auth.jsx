import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
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

        const response = await fetch("http://127.0.0.1:8000/aws-status", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const awsData = await response.json();
        navigate(awsData.aws_connected ? "/dashboard" : "/connect-aws", { replace: true });
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
          alert("Registration successful! Check your email to confirm the account.");
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
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center px-4">
      <div className="w-full max-w-5xl bg-[#111827] rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-2">
        <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-cyan-500 to-blue-700 p-10 text-white">
          <h1 className="text-5xl font-bold mb-6">AstraOps</h1>
          <p className="text-lg text-center text-gray-100">
            AI-powered Cloud Infrastructure Monitoring Platform
          </p>
          <div className="mt-10 space-y-4 text-sm">
            <p>✅ AWS EC2 Monitoring</p>
            <p>✅ Kubernetes Observability</p>
            <p>✅ Docker Metrics</p>
            <p>✅ Realtime AI Insights</p>
          </div>
        </div>

        <div className="p-10 flex flex-col justify-center">
          <div className="flex mb-8 bg-[#1F2937] rounded-xl p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`w-1/2 py-3 rounded-xl transition ${isLogin ? "bg-cyan-500 text-white" : "text-gray-400"}`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`w-1/2 py-3 rounded-xl transition ${!isLogin ? "bg-cyan-500 text-white" : "text-gray-400"}`}
            >
              Register
            </button>
          </div>

          <motion.div
            key={isLogin ? "login" : "register"}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-3xl font-bold text-white mb-2">
              {isLogin ? "Welcome Back 👋" : "Create Account 🚀"}
            </h2>
            <p className="text-gray-400 mb-8">
              {isLogin
                ? "Login to continue monitoring infrastructure."
                : "Create your AstraOps account."}
            </p>

            <form onSubmit={handleAuth} className="space-y-5">
              <input
                type="email"
                placeholder="Email Address"
                className="w-full bg-[#1F2937] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Password"
                className="w-full bg-[#1F2937] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:opacity-60 text-white py-3 rounded-xl font-semibold transition"
              >
                {loading ? "Please wait..." : isLogin ? "Login" : "Create Account"}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
