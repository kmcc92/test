import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProductById, getBrandById, getProductsByBrand } from "../data/brands";
import ProductCard from "../components/ProductCard";

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const [selectedColor, setSelectedColor] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [added, setAdded] = useState(false);

  const product = getProductById(productId!);
  const brand = product ? getBrandById(product.brandId) : undefined;
  const related = product
    ? getProductsByBrand(product.brandId)
        .filter((p) => p.id !== product.id)
        .slice(0, 4)
    : [];

  if (!product || !brand) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-400 mb-4">Product not found.</p>
          <Link to="/shop" className="btn-primary">Back to Shop</Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) return;
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-stone-100 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-stone-400">
          <Link to="/" className="hover:text-gold-700 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-gold-700 transition-colors">Shop</Link>
          <span>/</span>
          <Link to={`/brands/${brand.id}`} className="hover:text-gold-700 transition-colors">{brand.name}</Link>
          <span>/</span>
          <span className="text-stone-600">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20">
          {/* Product image */}
          <div className="relative">
            <div className="aspect-[3/4] overflow-hidden bg-stone-50">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.isNew && (
                <span className="bg-stone-900 text-white text-[10px] tracking-widest uppercase px-3 py-1">New</span>
              )}
              {product.isBestseller && (
                <span className="bg-gold-600 text-white text-[10px] tracking-widest uppercase px-3 py-1">Bestseller</span>
              )}
            </div>
          </div>

          {/* Product info */}
          <div className="flex flex-col">
            {/* Brand */}
            <Link
              to={`/brands/${brand.id}`}
              className="text-xs tracking-[0.3em] uppercase text-gold-600 hover:text-gold-800 font-medium mb-3 transition-colors"
            >
              {brand.name}
            </Link>

            {/* Name & price */}
            <h1 className="font-serif text-3xl md:text-4xl text-stone-900 mb-2">{product.name}</h1>
            <p className="text-2xl font-semibold text-stone-900 mb-1">${product.price.toLocaleString()}</p>
            <p className="text-xs text-stone-400 mb-6">Free shipping on this order · 30-day returns</p>

            <div className="divider-gold mb-6" />

            {/* Colors */}
            <div className="mb-6">
              <p className="text-xs tracking-[0.2em] uppercase text-stone-500 mb-3 font-medium">
                Colour: <span className="text-stone-800 normal-case tracking-normal font-normal">{product.colors[selectedColor]}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color, i) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(i)}
                    className={`px-3 py-1.5 text-xs border transition-colors ${
                      selectedColor === i
                        ? "border-stone-900 text-stone-900 bg-stone-50"
                        : "border-stone-200 text-stone-500 hover:border-stone-400"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs tracking-[0.2em] uppercase text-stone-500 font-medium">Size</p>
                <button className="text-xs text-gold-600 hover:text-gold-800 underline">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[48px] px-3 py-2 text-xs border transition-colors ${
                      selectedSize === size
                        ? "border-stone-900 text-stone-900 bg-stone-50 font-medium"
                        : "border-stone-200 text-stone-500 hover:border-stone-400"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {!selectedSize && (
                <p className="text-xs text-stone-400 mt-2">Please select a size to continue</p>
              )}
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={!selectedSize}
                className={`btn-primary py-4 text-sm ${added ? "bg-green-700 hover:bg-green-700" : ""}`}
              >
                {added ? "Added to Cart ✓" : selectedSize ? "Add to Cart" : "Select a Size"}
              </button>
              <button className="btn-secondary py-4 text-sm">
                Add to Wishlist
              </button>
            </div>

            {/* Auth badge */}
            <div className="flex items-start gap-3 bg-gold-50 border border-gold-100 p-4 mb-8">
              <svg className="w-5 h-5 text-gold-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <p className="text-xs font-semibold text-stone-800 tracking-wide mb-0.5">Blockchain Authenticated</p>
                <p className="text-xs text-stone-500 leading-relaxed">
                  This piece ships with an NFC chip and an NFT minted on Polygon. Ownership is verifiable on-chain.
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <p className="text-xs tracking-[0.2em] uppercase text-stone-500 font-medium mb-3">About this Piece</p>
              <p className="text-sm text-stone-600 leading-relaxed">{product.description}</p>
            </div>

            <div className="divider-gold mb-4" />

            {/* Details accordion style */}
            <div className="space-y-3 text-xs text-stone-500">
              <div className="flex justify-between">
                <span className="tracking-wide uppercase text-stone-400">Category</span>
                <span className="text-stone-700">{product.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="tracking-wide uppercase text-stone-400">Designer</span>
                <Link to={`/brands/${brand.id}`} className="text-gold-700 hover:text-gold-900">{brand.name}</Link>
              </div>
              <div className="flex justify-between">
                <span className="tracking-wide uppercase text-stone-400">Origin</span>
                <span className="text-stone-700">{brand.origin}</span>
              </div>
              <div className="flex justify-between">
                <span className="tracking-wide uppercase text-stone-400">Authentication</span>
                <span className="text-stone-700">NFC + Polygon NFT</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-20">
            <div className="divider-gold mb-12" />
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs tracking-[0.3em] uppercase text-gold-600 mb-1 font-medium">From {brand.name}</p>
                <h2 className="font-serif text-2xl text-stone-900">You May Also Like</h2>
              </div>
              <Link to={`/brands/${brand.id}`} className="btn-ghost text-xs">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} showBrand={false} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
