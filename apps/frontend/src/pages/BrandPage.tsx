import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getBrandById, getProductsByBrand, categories } from "../data/brands";
import ProductCard from "../components/ProductCard";

const brandHeroImages: Record<string, string> = {
  "maison-aurel": "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&q=80",
  "vael": "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1200&q=80",
  "lumiere": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=80",
  "solene": "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=1200&q=80",
  "arcen": "https://images.unsplash.com/photo-1571513722275-4b41940f54b8?w=1200&q=80",
};

export default function BrandPage() {
  const { brandId } = useParams<{ brandId: string }>();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const brand = getBrandById(brandId!);
  const allProducts = getProductsByBrand(brandId!);

  if (!brand) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-400 mb-4">Designer not found.</p>
          <Link to="/shop" className="btn-primary">Back to Shop</Link>
        </div>
      </div>
    );
  }

  const productCategories = ["All", ...Array.from(new Set(allProducts.map((p) => p.category)))];
  const filtered = selectedCategory === "All" ? allProducts : allProducts.filter((p) => p.category === selectedCategory);

  const heroImage = brandHeroImages[brand.id] || brandHeroImages["maison-aurel"];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="relative h-80 md:h-96 overflow-hidden">
        <img
          src={heroImage}
          alt={brand.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/30 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end px-6 md:px-12 pb-10">
          <p className="text-xs tracking-[0.3em] uppercase text-gold-400 mb-2">
            {brand.origin} · Est. {brand.founded}
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-white mb-2">{brand.name}</h1>
          <p className="text-stone-300 text-lg italic">{brand.tagline}</p>
        </div>
      </div>

      {/* Brand description */}
      <div className="bg-stone-50 border-b border-stone-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-stone-600 text-base leading-relaxed">{brand.description}</p>
          <div className="flex justify-center gap-8 mt-8">
            <div>
              <p className="font-serif text-3xl text-gold-700">{allProducts.length}</p>
              <p className="text-xs tracking-widest uppercase text-stone-400 mt-1">Pieces</p>
            </div>
            <div className="border-l border-stone-200" />
            <div>
              <p className="font-serif text-3xl text-gold-700">{brand.founded}</p>
              <p className="text-xs tracking-widest uppercase text-stone-400 mt-1">Founded</p>
            </div>
            <div className="border-l border-stone-200" />
            <div>
              <p className="font-serif text-3xl text-gold-700">{brand.origin.split(",")[1]?.trim() || brand.origin}</p>
              <p className="text-xs tracking-widest uppercase text-stone-400 mt-1">Origin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category tabs */}
        <div className="flex gap-1 overflow-x-auto pb-2 mb-10 border-b border-stone-100">
          {productCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-4 py-2.5 text-xs tracking-widest uppercase transition-colors border-b-2 -mb-px ${
                selectedCategory === cat
                  ? "border-gold-600 text-gold-700 font-medium"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-8">
          <p className="text-stone-400 text-sm">{filtered.length} pieces</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} showBrand={false} />
          ))}
        </div>
      </div>
    </div>
  );
}
