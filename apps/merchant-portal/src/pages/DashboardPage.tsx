import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuthStore } from "../store/authStore";

interface BrandStats {
  brand: { id: string; name: string; verified: boolean; logo: string | null };
  totalItems: number;
  activeAuctions: number;
  completedSales: number;
}

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: brand } = useQuery({
    queryKey: ["brand", "me"],
    queryFn: () => api.get("/brands/me").then((r) => r.data).catch(() => null),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
      <p className="text-gray-400 text-sm mb-8">Welcome back, {user?.email}</p>

      {brand && !brand.verified && (
        <div className="bg-yellow-950/40 border border-yellow-700 text-yellow-400 rounded-xl p-4 mb-6 text-sm">
          ⏳ Your brand is pending admin approval. You'll be notified once verified.
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Items", value: brand?.totalItems ?? "—", icon: "📦" },
          { label: "Active Auctions", value: brand?.activeAuctions ?? "—", icon: "🏛️" },
          { label: "Completed Sales", value: brand?.completedSales ?? "—", icon: "✅" },
        ].map((stat) => (
          <div key={stat.label} className="card">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {!brand && (
        <div className="card text-center py-12">
          <div className="text-4xl mb-4">🏪</div>
          <h2 className="text-lg font-semibold text-white mb-2">Register your brand</h2>
          <p className="text-gray-400 text-sm mb-4">
            Set up your brand profile to start listing authenticated luxury items.
          </p>
          <a href="/settings" className="btn-primary inline-block">
            Get Started
          </a>
        </div>
      )}
    </div>
  );
}
