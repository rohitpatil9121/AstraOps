import {
  LayoutDashboard,
  Cloud,
  Boxes,
  Server,
  Shield,
  Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";

function SidebarItem({ icon, text, to }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
          isActive
            ? "bg-slate-800 text-white"
            : "text-slate-400 hover:text-white hover:bg-slate-800/60"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-cyan-400" />
          )}

          <span className="ml-2">{icon}</span>
          <span className="font-medium text-sm">{text}</span>
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar() {
  return (
    <aside className="w-72 min-h-screen bg-[#0B1220] border-r border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-8 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          AstraOps
        </h1>

        <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">
          Cloud Operations Platform
        </p>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-6">
        <p className="text-[11px] uppercase tracking-widest text-slate-500 mb-4 px-2">
          Workspace
        </p>

        <nav className="space-y-2">
          <SidebarItem
            icon={<LayoutDashboard size={18} />}
            text="Dashboard"
            to="/dashboard"
          />

          <SidebarItem
            icon={<Cloud size={18} />}
            text="AWS Infrastructure"
            to="/aws"
          />

          <SidebarItem
            icon={<Boxes size={18} />}
            text="Kubernetes"
            to="/kubernetes"
          />

          <SidebarItem
            icon={<Server size={18} />}
            text="Docker"
            to="/docker"
          />

          <SidebarItem
            icon={<Shield size={18} />}
            text="Security"
            to="/security"
          />

          <SidebarItem
            icon={<Settings size={18} />}
            text="Settings"
            to="/settings"
          />
        </nav>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 p-5">
        <div className="bg-slate-900 rounded-xl p-4">
          <p className="text-sm text-white font-medium">
            Infrastructure Status
          </p>

          <div className="flex items-center gap-2 mt-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-xs text-slate-400">
              Monitoring Active
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}