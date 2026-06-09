import {
  Search,
  Bell,
  LogOut,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
  await supabase.auth.signOut();

  localStorage.removeItem("token");

  navigate("/", {
    replace: true,
  });
};
  return (
  <header className="h-20 border-b border-slate-800 bg-[#0B1220] flex items-center justify-between px-6">

    {/* Left */}
    <div>
      <h1 className="text-lg font-semibold text-white">
        Infrastructure Overview
      </h1>

      <p className="text-sm text-slate-500">
        Real-time cloud observability and monitoring
      </p>
    </div>

    {/* Search */}
    <div className="relative w-[420px]">
      <Search
        size={16}
        className="absolute left-3 top-3 text-slate-500"
      />

      <input
        type="text"
        placeholder="Search instances, pods, containers..."
        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500"
      />
    </div>

    {/* Right */}
    <div className="flex items-center gap-4">

      {/* AWS Status */}
      <div className="hidden xl:flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">
        <div className="h-2 w-2 rounded-full bg-emerald-400" />

        <span className="text-sm text-white">
          AWS Connected
        </span>
      </div>

      {/* Notifications */}
      <button className="relative text-slate-400 hover:text-white transition">
        <Bell size={18} />

        <span className="absolute -top-2 -right-2 text-[10px] bg-red-500 text-white rounded-full px-1.5">
          3
        </span>
      </button>

      {/* User */}
      <div className="flex items-center gap-3 border-l border-slate-800 pl-5">

        <div className="h-10 w-10 rounded-full bg-cyan-600 flex items-center justify-center text-sm font-semibold text-white">
          R
        </div>

        <div>
          <p className="text-sm text-white font-medium">
            Rohit
          </p>

          <p className="text-xs text-slate-500">
            Cloud Administrator
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="text-slate-400 hover:text-red-400 transition"
        >
          <LogOut size={18} />
        </button>

      </div>
    </div>

  </header>
);
}