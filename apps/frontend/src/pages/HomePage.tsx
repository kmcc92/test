import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-20">
        <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 leading-tight">
          Authenticate.<br />
          <span className="text-gold-400">Own. Trade.</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
          Blockchain-verified luxury fashion. Every item authenticated on-chain, every ownership
          transfer immutable.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/auctions" className="btn-primary text-base px-8 py-3">
            Browse Auctions
          </Link>
          <Link to="/verify/demo" className="btn-secondary text-base px-8 py-3">
            Verify an Item
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-24">
        {[
          {
            icon: "🔐",
            title: "NFC & QR Verification",
            desc: "Scan the physical chip on your item to instantly verify its authenticity on-chain.",
          },
          {
            icon: "⛓️",
            title: "NFT Ownership",
            desc: "Every luxury item is minted as an ERC-721 NFT on Polygon, creating an immutable ownership record.",
          },
          {
            icon: "🏛️",
            title: "Live Auctions",
            desc: "Bid on verified luxury items in real-time. Anti-sniping protection ensures fair outcomes.",
          },
        ].map((f) => (
          <div key={f.title} className="card text-center">
            <div className="text-4xl mb-4">{f.icon}</div>
            <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
