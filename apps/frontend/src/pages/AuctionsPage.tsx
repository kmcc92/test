import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { formatEther } from "ethers";

interface Auction {
  id: string;
  highestBid: string | null;
  reservePrice: string;
  endTime: string;
  item: { chipId: string; ipfsHash: string; brand: { name: string; logo: string | null } };
}

export default function AuctionsPage() {
  const { data: auctions, isLoading, error } = useQuery<Auction[]>({
    queryKey: ["auctions", "live"],
    queryFn: () => api.get("/auctions/live").then((r) => r.data),
    refetchInterval: 15_000,
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-pulse text-gold-400 text-lg">Loading auctions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-red-400">
        Failed to load auctions.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-serif text-white mb-2">Live Auctions</h1>
      <p className="text-gray-400 mb-10">Verified luxury items available now</p>

      {auctions?.length === 0 ? (
        <div className="card text-center text-gray-400 py-20">No active auctions at this time.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions?.map((auction) => (
            <Link key={auction.id} to={`/auctions/${auction.id}`}>
              <div className="card hover:border-gold-500/50 transition-all group cursor-pointer">
                <div className="aspect-square bg-gray-800 rounded-lg mb-4 flex items-center justify-center text-5xl">
                  👜
                </div>
                <div className="text-xs text-gold-400 uppercase tracking-wider mb-1">
                  {auction.item.brand.name}
                </div>
                <h3 className="text-white font-semibold mb-3 group-hover:text-gold-400 transition-colors">
                  #{auction.item.chipId}
                </h3>
                <div className="flex justify-between text-sm">
                  <div>
                    <div className="text-gray-500">Current bid</div>
                    <div className="text-white font-mono">
                      {auction.highestBid
                        ? `${formatEther(auction.highestBid)} MATIC`
                        : `Reserve: ${formatEther(auction.reservePrice)} MATIC`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-500">Ends</div>
                    <div className="text-white">
                      {new Date(auction.endTime).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
