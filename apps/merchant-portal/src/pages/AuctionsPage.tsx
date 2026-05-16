import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { formatEther } from "ethers";

interface Auction {
  id: string;
  onChainId: string | null;
  status: string;
  highestBid: string | null;
  reservePrice: string;
  endTime: string;
  item: { chipId: string; metadata: { name?: string } };
  bids: unknown[];
}

export default function AuctionsPage() {
  const { data: auctions, isLoading } = useQuery<Auction[]>({
    queryKey: ["merchant-auctions"],
    queryFn: () => api.get("/auctions/live").then((r) => r.data),
    refetchInterval: 30_000,
  });

  const statusColor: Record<string, string> = {
    ACTIVE: "text-green-400",
    ENDED: "text-yellow-400",
    SETTLED: "text-blue-400",
    CANCELLED: "text-red-400",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Auctions</h1>
      <p className="text-gray-400 text-sm mb-6">Your active and recent auction listings</p>

      {isLoading && <div className="text-gold-400 animate-pulse">Loading...</div>}

      <div className="grid gap-3">
        {auctions?.map((auction) => (
          <div key={auction.id} className="card flex items-center justify-between">
            <div>
              <div className="font-medium text-white">
                {(auction.item.metadata as { name?: string }).name ?? auction.item.chipId}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {auction.bids instanceof Array ? auction.bids.length : 0} bids · ends{" "}
                {new Date(auction.endTime).toLocaleString()}
              </div>
            </div>
            <div className="text-right">
              <div className={`text-xs font-semibold ${statusColor[auction.status] ?? "text-gray-400"}`}>
                {auction.status}
              </div>
              <div className="text-white text-sm font-mono mt-1">
                {auction.highestBid
                  ? `${formatEther(auction.highestBid)} MATIC`
                  : `Reserve: ${formatEther(auction.reservePrice)} MATIC`}
              </div>
            </div>
          </div>
        ))}
        {auctions?.length === 0 && (
          <div className="card text-center py-12 text-gray-400">No auctions found.</div>
        )}
      </div>
    </div>
  );
}
