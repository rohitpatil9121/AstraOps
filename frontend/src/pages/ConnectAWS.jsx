import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

export default function ConnectAWS() {
  const [accessKey, setAccessKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [region, setRegion] = useState("us-east-1");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function connectAWS() {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        alert("Please login first");
        navigate("/", { replace: true });
        return;
      }

      const response = await fetch("http://127.0.0.1:8000/connect-aws", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          aws_access_key: accessKey.trim(),
          aws_secret_key: secretKey.trim(),
          aws_region: region.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || data.error || data.message || "AWS connection failed");
        return;
      }

      alert(data.message || "AWS connected successfully 🚀");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error(err);
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-white flex items-center justify-center px-4">
      <div className="bg-[#111827] border border-gray-800 p-10 rounded-3xl w-full max-w-md shadow-2xl">
        <h1 className="text-3xl font-bold text-cyan-400 mb-2">Connect AWS ☁️</h1>
        <p className="text-gray-400 mb-6">Securely connect your AWS account</p>

        <input
          placeholder="AWS Access Key"
          className="w-full p-3 rounded-xl bg-black/30 border border-gray-700 mb-4 outline-none focus:border-cyan-400"
          value={accessKey}
          onChange={(e) => setAccessKey(e.target.value)}
          autoComplete="off"
        />

        <input
          placeholder="AWS Secret Key"
          type="password"
          className="w-full p-3 rounded-xl bg-black/30 border border-gray-700 mb-4 outline-none focus:border-cyan-400"
          value={secretKey}
          onChange={(e) => setSecretKey(e.target.value)}
          autoComplete="off"
        />

        <input
          placeholder="AWS Region"
          className="w-full p-3 rounded-xl bg-black/30 border border-gray-700 mb-6 outline-none focus:border-cyan-400"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        />

        <button
          onClick={connectAWS}
          disabled={loading}
          className="w-full bg-cyan-500 hover:bg-cyan-600 transition py-3 rounded-xl font-bold disabled:opacity-60"
        >
          {loading ? "Connecting..." : "Connect AWS"}
        </button>
      </div>
    </div>
  );
}
