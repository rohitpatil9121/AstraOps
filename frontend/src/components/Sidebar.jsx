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
        `
        relative flex items-center gap-3
        px-4 py-3
        rounded-xl
        transition-all duration-200
        ${
          isActive
            ? "bg-slate-800 border border-slate-700 text-white"
            : "text-slate-400 hover:text-white hover:bg-slate-800/50"
        }
      `
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-cyan-400" />
          )}

          <span className="ml-2">{icon}</span>

          <span className="font-medium text-sm">
            {text}
          </span>
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar() {
  return (
    <aside className="w-72 min-h-screen bg-[#0B1220] border-r border-slate-800 flex flex-col">

      {/* Header */}
      <div className="px-6 py-8 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          AstraOps
        </h1>

        <p className="text-xs text-slate-500 mt-1">
          Cloud Observability Platform
        </p>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-6">
        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 mb-4 px-2">
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
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">

          <p className="text-[11px] uppercase tracking-wider text-slate-500">
            Infrastructure Status
          </p>

          <div className="flex items-center gap-2 mt-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

            <span className="text-sm text-white">
              Monitoring Active
            </span>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800">
            <p className="text-[11px] uppercase tracking-wider text-slate-500">
              Region
            </p>

            <p className="text-sm text-white mt-1">
              us-east-1
            </p>
          </div>

          <div className="mt-4 text-xs text-slate-500">
            AstraOps v1.0
          </div>

        </div>
      </div>

    </aside>
  );
}