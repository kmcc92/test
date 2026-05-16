import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { formatEther } from "ethers";
import { api } from "../lib/api";
import { useAuthStore } from "../store/authStore";

interface Bid {
  id: string;
  amount: string;
  createdAt: string;
  bidder: { walletAddress: string | null };
}

interface Auction {
  id: string;
  highestBid: string | null;
  reservePrice: string;
  endTime: string;
  status: string;
  item: { chipId: string; brand: { name: string } };
  bids: Bid[];
}

export default function AuctionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuthStore();
  const [bidAmount, setBidAmount] = useState("");
  const [bidding, setBidding] = useState(false);
  const [liveActivity, setLiveActivity] = useState<string[]>([]);

  const { data: auction, refetch } = useQuery<Auction>({
    queryKey: ["auction", id],
    queryFn: () => api.get(`/auctions/${id}`).then((r) => r.data),
  });

  useEffect(() => {
    if (!id) return;
    const socket: Socket = io(import.meta.env.VITE_API_URL || "http://localhost:3001");
    socket.emit("auction:join", id);

    socket.on("bid:new", (data: { bidderId: string; amount: string }) => {
      setLiveActivity((prev) => [
        `New bid: ${formatEther(data.amount)} MATIC`,
        ...prev.slice(0, 9),
      ]);
      refetch();
    });

    return () => { socket.emit("auction:leave", id); socket.disconnect(); };
  }, [id, refetch]);

  const handleBid = async () => {
    if (!token) return alert("Please sign in to bid");
    if (!bidAmount) return;

    setBidding(true);
    try {
      const weiAmount = (parseFloat(bidAmount) * 1e18).toFixed(0);
      await api.post(`/auctions/${id}/bid`, { amount: weiAmount });
      setBidAmount("");
      refetch();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string; minimumBid?: string } } };
      const msg = e.response?.data?.error ?? "Bid failed";
      alert(msg);
    } finally {
      setBidding(false);
    }
  };

  if (!auction) {
    return <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gold-400">Loading...</div>;
  }

  const currentBid = auction.highestBid
    ? parseFloat(formatEther(auction.highestBid))
    : parseFloat(formatEther(auction.reservePrice));
  const minNext = (currentBid * 1.05).toFixed(4);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="aspect-square bg-gray-900 rounded-xl flex items-center justify-center text-8xl mb-4">
            👜
          </div>
          <div className="card">
            <div className="text-xs text-gold-400 uppercase tracking-wider mb-1">
              {auction.item.brand.name}
            </div>
            <h2 className="text-2xl font-serif text-white">#{auction.item.chipId}</h2>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card">
            <div className="text-sm text-gray-400 mb-1">
              {auction.highestBid ? "Current bid" : "Reserve price"}
            </div>
            <div className="text-3xl font-mono text-white">
              {auction.highestBid
                ? formatEther(auction.highestBid)
                : formatEther(auction.reservePrice)}{" "}
              MATIC
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Ends: {new Date(auction.endTime).toLocaleString()}
            </div>
          </div>

          {auction.status === "ACTIVE" && (
            <div className="card">
              <label className="block text-sm text-gray-400 mb-2">
                Your bid (min {minNext} MATIC)
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  step="0.0001"
                  min={minNext}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={minNext}
                  className="input"
                />
                <button onClick={handleBid} disabled={bidding} className="btn-primary whitespace-nowrap">
                  {bidding ? "Placing..." : "Place Bid"}
                </button>
              </div>
            </div>
          )}

          {liveActivity.length > 0 && (
            <div className="card">
              <div className="text-sm font-semibold text-gold-400 mb-2">Live Activity</div>
              {liveActivity.map((msg, i) => (
                <div key={i} className="text-sm text-gray-300 py-1 border-b border-gray-800 last:border-0">
                  {msg}
                </div>
              ))}
            </div>
          )}

          <div className="card">
            <div className="text-sm font-semibold text-gray-300 mb-3">Bid History</div>
            {auction.bids.length === 0 ? (
              <div className="text-gray-500 text-sm">No bids yet</div>
            ) : (
              auction.bids.map((bid) => (
                <div key={bid.id} className="flex justify-between text-sm py-2 border-b border-gray-800 last:border-0">
                  <span className="text-gray-400 font-mono">
                    {bid.bidder.walletAddress?.slice(0, 8) ?? "Anonymous"}...
                  </span>
                  <span className="text-white font-mono">{formatEther(bid.amount)} MATIC</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
