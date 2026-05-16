import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

interface Item {
  id: string;
  chipId: string;
  nftTokenId: string | null;
  ipfsHash: string;
  createdAt: string;
  metadata: { name?: string };
}

export default function InventoryPage() {
  const { data: brand } = useQuery({
    queryKey: ["brand", "me"],
    queryFn: () => api.get("/brands/me").then((r) => r.data).catch(() => null),
  });

  const { data: items, isLoading } = useQuery<Item[]>({
    queryKey: ["items", brand?.id],
    queryFn: () => api.get(`/brands/${brand!.id}`).then((r) => r.data.items),
    enabled: !!brand?.id,
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Inventory</h1>
          <p className="text-gray-400 text-sm">{items?.length ?? 0} items registered</p>
        </div>
        <Link to="/inventory/register" className="btn-primary">
          + Register Item
        </Link>
      </div>

      {isLoading && <div className="text-gold-400 animate-pulse">Loading inventory...</div>}

      {items?.length === 0 && (
        <div className="card text-center py-12 text-gray-400">
          No items registered yet.{" "}
          <Link to="/inventory/register" className="text-gold-400 hover:underline">
            Register your first item
          </Link>
        </div>
      )}

      <div className="grid gap-3">
        {items?.map((item) => (
          <div key={item.id} className="card flex items-center justify-between">
            <div>
              <div className="font-medium text-white">
                {(item.metadata as { name?: string }).name ?? item.chipId}
              </div>
              <div className="text-xs text-gray-500 font-mono mt-0.5">Chip: {item.chipId}</div>
              {item.nftTokenId && (
                <div className="text-xs text-gold-400 mt-0.5">NFT #{item.nftTokenId}</div>
              )}
            </div>
            <div className="text-right text-xs text-gray-500">
              {new Date(item.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
