import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { products, brands, categories } from "../data/brands";
import ProductCard from "../components/ProductCard";

const sortOptions = [
  { label: "Featured", value: "featured" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
];

export default function ShopPage() {
  const [searchParams] = useSearchParams();
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [priceMax, setPriceMax] = useState<number>(10000);
  const [sort, setSort] = useState("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filterParam = searchParams.get("filter");

  const filtered = useMemo(() => {
    let list = [...products];

    if (filterParam === "new") list = list.filter((p) => p.isNew);
    if (filterParam === "bestseller") list = list.filter((p) => p.isBestseller);

    if (selectedBrand !== "all") list = list.filter((p) => p.brandId === selectedBrand);
    if (selectedCategory !== "All") list = list.filter((p) => p.category === selectedCategory);
    list = list.filter((p) => p.price <= priceMax);

    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    else if (sort === "newest") list = list.filter((_, i) => i < 999); // all, newest first by isNew
    else if (sort === "featured") list.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));

    return list;
  }, [selectedBrand, selectedCategory, priceMax, sort, filterParam]);

  const title = filterParam === "new"
    ? "New Arrivals"
    : filterParam === "bestseller"
    ? "Bestsellers"
    : "Shop All";

  return (
    <div className="min-h-screen bg-white">
      {/* Page header */}
      <div className="bg-stone-50 border-b border-stone-100 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs tracking-[0.3em] uppercase text-gold-600 mb-1 font-medium">Explore</p>
          <h1 className="font-serif text-4xl text-stone-900">{title}</h1>
          <p className="text-stone-400 text-sm mt-1">{filtered.length} pieces</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar filters — desktop */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-24 space-y-8">
              {/* Designer filter */}
              <div>
                <p className="text-xs tracking-[0.2em] uppercase text-stone-500 mb-4 font-medium">Designer</p>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => setSelectedBrand("all")}
                      className={`text-sm transition-colors ${selectedBrand === "all" ? "text-gold-700 font-medium" : "text-stone-500 hover:text-stone-800"}`}
                    >
                      All Designers
                    </button>
                  </li>
                  {brands.map((brand) => (
                    <li key={brand.id}>
                      <button
                        onClick={() => setSelectedBrand(brand.id)}
                        className={`text-sm transition-colors ${selectedBrand === brand.id ? "text-gold-700 font-medium" : "text-stone-500 hover:text-stone-800"}`}
                      >
                        {brand.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Category filter */}
              <div>
                <p className="text-xs tracking-[0.2em] uppercase text-stone-500 mb-4 font-medium">Category</p>
                <ul className="space-y-2">
                  {categories.map((cat) => (
                    <li key={cat}>
                      <button
                        onClick={() => setSelectedCategory(cat)}
                        className={`text-sm transition-colors ${selectedCategory === cat ? "text-gold-700 font-medium" : "text-stone-500 hover:text-stone-800"}`}
                      >
                        {cat}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price filter */}
              <div>
                <p className="text-xs tracking-[0.2em] uppercase text-stone-500 mb-4 font-medium">
                  Max Price: ${priceMax.toLocaleString()}
                </p>
                <input
                  type="range"
                  min={200}
                  max={10000}
                  step={100}
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="w-full accent-gold-600"
                />
                <div className="flex justify-between text-xs text-stone-400 mt-1">
                  <span>$200</span>
                  <span>$10,000</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <button
                className="lg:hidden btn-ghost flex items-center gap-2 text-xs tracking-widest uppercase"
                onClick={() => setFiltersOpen(!filtersOpen)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                </svg>
                Filters
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <label className="text-xs text-stone-400 tracking-widest uppercase">Sort</label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="text-xs border border-stone-200 text-stone-700 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-gold-500"
                >
                  {sortOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mobile filters */}
            {filtersOpen && (
              <div className="lg:hidden border border-stone-100 p-4 mb-6 grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs tracking-[0.2em] uppercase text-stone-500 mb-3 font-medium">Designer</p>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="text-sm border border-stone-200 text-stone-700 px-3 py-2 w-full focus:outline-none"
                  >
                    <option value="all">All Designers</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className="text-xs tracking-[0.2em] uppercase text-stone-500 mb-3 font-medium">Category</p>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="text-sm border border-stone-200 text-stone-700 px-3 py-2 w-full focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Active filters */}
            {(selectedBrand !== "all" || selectedCategory !== "All") && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedBrand !== "all" && (
                  <span className="flex items-center gap-1 bg-gold-50 text-gold-700 text-xs px-3 py-1 tracking-wide">
                    {brands.find((b) => b.id === selectedBrand)?.name}
                    <button onClick={() => setSelectedBrand("all")} className="hover:text-gold-900">×</button>
                  </span>
                )}
                {selectedCategory !== "All" && (
                  <span className="flex items-center gap-1 bg-gold-50 text-gold-700 text-xs px-3 py-1 tracking-wide">
                    {selectedCategory}
                    <button onClick={() => setSelectedCategory("All")} className="hover:text-gold-900">×</button>
                  </span>
                )}
              </div>
            )}

            {/* Products grid */}
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-stone-400 text-sm">No pieces match your filters.</p>
                <button
                  onClick={() => { setSelectedBrand("all"); setSelectedCategory("All"); setPriceMax(10000); }}
                  className="btn-secondary mt-4 inline-block"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
