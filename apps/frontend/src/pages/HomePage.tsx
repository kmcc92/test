import { Link } from "react-router-dom";
import { brands, getFeaturedProducts, getNewArrivals } from "../data/brands";
import ProductCard from "../components/ProductCard";

export default function HomePage() {
  const featured = getFeaturedProducts();
  const newArrivals = getNewArrivals();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-stone-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-0 min-h-[600px]">
            {/* Text */}
            <div className="flex flex-col justify-center py-20 lg:pr-16">
              <p className="text-xs tracking-[0.3em] uppercase text-gold-600 mb-4 font-medium">
                New Season Arrivals
              </p>
              <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-stone-900 leading-[1.05] mb-6">
                Where Luxury<br />
                <span className="text-gold-600">Meets Legacy</span>
              </h1>
              <p className="text-stone-500 text-lg leading-relaxed mb-10 max-w-md">
                Discover authenticated pieces from the world's most coveted designers.
                Every item verified on-chain. Every purchase a statement.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/shop" className="btn-primary">
                  Shop New Arrivals
                </Link>
                <Link to="/shop" className="btn-secondary">
                  Browse All Designers
                </Link>
              </div>
            </div>

            {/* Feature image grid */}
            <div className="hidden lg:grid grid-cols-2 gap-2 py-8">
              <div className="space-y-2">
                <div className="h-72 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=500&q=80"
                    alt=""
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="h-48 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=500&q=80"
                    alt=""
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>
              <div className="space-y-2 pt-8">
                <div className="h-48 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80"
                    alt=""
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="h-72 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&q=80"
                    alt=""
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brands strip */}
      <section className="border-y border-stone-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs tracking-[0.3em] uppercase text-stone-400 mb-8">Our Designers</p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                to={`/brands/${brand.id}`}
                className="font-serif text-lg text-stone-400 hover:text-gold-600 transition-colors tracking-wider"
              >
                {brand.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-gold-600 mb-2 font-medium">Just Landed</p>
              <h2 className="section-title">New Arrivals</h2>
            </div>
            <Link to="/shop?filter=new" className="btn-ghost hidden md:block">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Link to="/shop?filter=new" className="btn-secondary inline-block">View All New Arrivals</Link>
          </div>
        </div>
      </section>

      {/* Brand Showcase */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs tracking-[0.3em] uppercase text-gold-600 mb-2 font-medium">Curated Houses</p>
            <h2 className="section-title">Shop by Designer</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Featured large brand */}
            <div className="md:col-span-2 relative overflow-hidden group cursor-pointer h-96">
              <Link to={`/brands/${brands[0].id}`}>
                <img
                  src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=900&q=80"
                  alt={brands[0].name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-stone-900/20 to-transparent" />
                <div className="absolute bottom-8 left-8 text-white">
                  <p className="text-xs tracking-[0.3em] uppercase mb-1 text-gold-300">Paris, France · Est. 1987</p>
                  <h3 className="font-serif text-3xl">{brands[0].name}</h3>
                  <p className="text-sm text-stone-300 mt-1">{brands[0].tagline}</p>
                </div>
              </Link>
            </div>

            {/* Side brands */}
            <div className="grid grid-rows-2 gap-6">
              {brands.slice(1, 3).map((brand) => (
                <Link
                  key={brand.id}
                  to={`/brands/${brand.id}`}
                  className="relative overflow-hidden group h-44"
                >
                  <img
                    src={`https://images.unsplash.com/photo-${brand.id === "vael" ? "1539109136881-3be0616acf4b" : "1515886657613-9f3515b0c78f"}?w=600&q=80`}
                    alt={brand.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="font-serif text-xl">{brand.name}</h3>
                    <p className="text-xs text-stone-300">{brand.origin}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Remaining brands */}
          <div className="grid grid-cols-2 gap-6 mt-6">
            {brands.slice(3).map((brand) => (
              <Link
                key={brand.id}
                to={`/brands/${brand.id}`}
                className="relative overflow-hidden group h-52"
              >
                <img
                  src={`https://images.unsplash.com/photo-${brand.id === "solene" ? "1572804013309-59a88b7e92f1" : "1571513722275-4b41940f54b8"}?w=700&q=80`}
                  alt={brand.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent" />
                <div className="absolute bottom-5 left-5 text-white">
                  <h3 className="font-serif text-2xl">{brand.name}</h3>
                  <p className="text-xs text-stone-300">{brand.tagline}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/shop" className="btn-secondary inline-block">
              View All Designers
            </Link>
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-gold-600 mb-2 font-medium">Most Loved</p>
              <h2 className="section-title">Bestsellers</h2>
            </div>
            <Link to="/shop?filter=bestseller" className="btn-ghost hidden md:block">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Brand promise */}
      <section className="py-20 bg-stone-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            {[
              {
                icon: (
                  <svg className="w-8 h-8 mx-auto mb-4 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "Blockchain Authenticated",
                desc: "Every piece is minted as an NFT on Polygon. Ownership is immutable and verifiable by anyone, anywhere.",
              },
              {
                icon: (
                  <svg className="w-8 h-8 mx-auto mb-4 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                ),
                title: "White Glove Shipping",
                desc: "Every order ships in archival tissue and a TESTF branded box. Delivered by hand to your door.",
              },
              {
                icon: (
                  <svg className="w-8 h-8 mx-auto mb-4 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ),
                title: "Returns & Resale",
                desc: "30-day returns, no questions. Or list your authenticated pieces on our secondary market for instant liquidity.",
              },
            ].map((f) => (
              <div key={f.title}>
                {f.icon}
                <h3 className="font-serif text-xl text-white mb-3">{f.title}</h3>
                <p className="text-stone-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gold-50 border-t border-gold-100">
        <div className="max-w-xl mx-auto px-4 text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-gold-600 mb-2 font-medium">Stay in the know</p>
          <h2 className="font-serif text-3xl text-stone-900 mb-3">Private Access</h2>
          <p className="text-stone-500 text-sm mb-7">
            First access to new drops, exclusive designer previews, and members-only auction invitations.
          </p>
          <form className="flex gap-3" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Your email address"
              className="input flex-1 text-sm"
            />
            <button type="submit" className="btn-primary whitespace-nowrap">
              Join
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <p className="font-serif text-xl text-stone-900 tracking-widest mb-3">TESTF</p>
              <p className="text-stone-400 text-xs leading-relaxed">
                The authenticated luxury marketplace. Every piece verified. Every purchase protected.
              </p>
            </div>
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-stone-500 mb-4 font-medium">Shop</p>
              <ul className="space-y-2.5">
                {["New Arrivals", "Bestsellers", "Designers", "Live Auctions"].map((l) => (
                  <li key={l}>
                    <Link to="/shop" className="text-xs text-stone-400 hover:text-gold-700 transition-colors">{l}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-stone-500 mb-4 font-medium">Designers</p>
              <ul className="space-y-2.5">
                {brands.map((b) => (
                  <li key={b.id}>
                    <Link to={`/brands/${b.id}`} className="text-xs text-stone-400 hover:text-gold-700 transition-colors">{b.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-stone-500 mb-4 font-medium">Help</p>
              <ul className="space-y-2.5">
                {["Shipping & Returns", "Size Guides", "Authentication", "Contact"].map((l) => (
                  <li key={l}>
                    <Link to="/" className="text-xs text-stone-400 hover:text-gold-700 transition-colors">{l}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-stone-100 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-xs text-stone-400">© 2025 TESTF. All rights reserved.</p>
            <p className="text-xs text-stone-300">Powered by blockchain authentication</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
