import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useWallet } from "../hooks/useWallet";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { walletAddress, connect, connecting } = useWallet();

  return (
    <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="font-serif text-xl text-gold-400 tracking-widest uppercase">
            TESTF
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm">
            <Link to="/auctions" className="text-gray-300 hover:text-gold-400 transition-colors">
              Live Auctions
            </Link>
            <Link to="/verify/demo" className="text-gray-300 hover:text-gold-400 transition-colors">
              Verify Item
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {walletAddress ? (
              <span className="text-xs text-gold-400 font-mono bg-gold-500/10 px-3 py-1.5 rounded-full">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            ) : (
              <button onClick={connect} disabled={connecting} className="btn-secondary text-sm py-1.5">
                {connecting ? "Connecting..." : "Connect Wallet"}
              </button>
            )}

            {user ? (
              <button onClick={logout} className="text-sm text-gray-400 hover:text-gray-200 transition-colors">
                Sign out
              </button>
            ) : (
              <Link to="/login" className="btn-primary text-sm py-1.5">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
