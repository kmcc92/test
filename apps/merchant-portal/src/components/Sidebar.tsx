import { NavLink } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const links = [
  { to: "/", label: "Dashboard", icon: "📊" },
  { to: "/inventory", label: "Inventory", icon: "📦" },
  { to: "/auctions", label: "Auctions", icon: "🏛️" },
  { to: "/settings", label: "Brand Settings", icon: "⚙️" },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <div className="text-gold-400 font-bold tracking-widest text-sm uppercase">TESTF</div>
        <div className="text-xs text-gray-500 mt-0.5">Merchant Portal</div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-gold-500/10 text-gold-400"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
              }`
            }
          >
            <span>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="text-xs text-gray-500 mb-1 truncate">{user?.email}</div>
        <button onClick={logout} className="text-xs text-gray-400 hover:text-gray-200 transition-colors">
          Sign out
        </button>
      </div>
    </aside>
  );
}
