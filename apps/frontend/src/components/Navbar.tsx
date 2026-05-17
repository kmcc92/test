import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { brands } from "../data/brands";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [brandsOpen, setBrandsOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="bg-white border-b border-stone-200 sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-stone-900 text-white text-center py-2 text-xs tracking-widest">
        FREE SHIPPING ON ORDERS OVER $500 &nbsp;·&nbsp; AUTHENTICATED ON-CHAIN
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="font-serif text-2xl text-stone-900 tracking-widest uppercase hover:text-gold-700 transition-colors"
          >
            TESTF
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8 text-xs tracking-widest uppercase font-medium">
            <Link
              to="/shop"
              className={`transition-colors hover:text-gold-700 ${location.pathname === "/shop" ? "text-gold-700" : "text-stone-600"}`}
            >
              Shop All
            </Link>

            {/* Brands dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setBrandsOpen(true)}
              onMouseLeave={() => setBrandsOpen(false)}
            >
              <button className="transition-colors hover:text-gold-700 text-stone-600 flex items-center gap-1">
                Designers
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {brandsOpen && (
                <div className="absolute top-full left-0 mt-0 w-56 bg-white border border-stone-100 shadow-lg py-2 z-50">
                  {brands.map((brand) => (
                    <Link
                      key={brand.id}
                      to={`/brands/${brand.id}`}
                      className="block px-4 py-2.5 text-xs tracking-widest text-stone-600 hover:bg-gold-50 hover:text-gold-700 transition-colors"
                    >
                      {brand.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/auctions"
              className={`transition-colors hover:text-gold-700 ${location.pathname === "/auctions" ? "text-gold-700" : "text-stone-600"}`}
            >
              Live Auctions
            </Link>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            <Link
              to="/shop"
              className="hidden md:flex items-center gap-1.5 text-stone-500 hover:text-gold-700 transition-colors"
              aria-label="Search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35m0 0A7 7 0 1116.65 16.65z" />
              </svg>
            </Link>

            <Link
              to="/login"
              className="hidden md:flex items-center gap-1.5 text-stone-500 hover:text-gold-700 transition-colors"
              aria-label="Account"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>

            <button
              className="flex items-center gap-1.5 text-stone-500 hover:text-gold-700 transition-colors"
              aria-label="Cart"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="text-xs font-medium">0</span>
            </button>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-stone-600 hover:text-stone-900"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-stone-100 px-4 py-4 space-y-1">
          <Link to="/shop" onClick={() => setMenuOpen(false)} className="block py-2.5 text-xs tracking-widest uppercase text-stone-700 hover:text-gold-700">
            Shop All
          </Link>
          <div className="py-1">
            <p className="text-xs tracking-widest uppercase text-stone-400 py-1.5">Designers</p>
            {brands.map((brand) => (
              <Link
                key={brand.id}
                to={`/brands/${brand.id}`}
                onClick={() => setMenuOpen(false)}
                className="block py-2 pl-3 text-xs tracking-widest text-stone-600 hover:text-gold-700"
              >
                {brand.name}
              </Link>
            ))}
          </div>
          <Link to="/auctions" onClick={() => setMenuOpen(false)} className="block py-2.5 text-xs tracking-widest uppercase text-stone-700 hover:text-gold-700">
            Live Auctions
          </Link>
          <Link to="/login" onClick={() => setMenuOpen(false)} className="block py-2.5 text-xs tracking-widest uppercase text-stone-700 hover:text-gold-700">
            Sign In
          </Link>
        </div>
      )}
    </nav>
  );
}
