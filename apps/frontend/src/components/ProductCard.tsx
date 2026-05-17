import { Link } from "react-router-dom";
import { Product, getBrandById } from "../data/brands";

interface Props {
  product: Product;
  showBrand?: boolean;
}

export default function ProductCard({ product, showBrand = true }: Props) {
  const brand = getBrandById(product.brandId);

  return (
    <Link to={`/products/${product.id}`} className="group block">
      {/* Image */}
      <div className="relative overflow-hidden bg-stone-50 aspect-[3/4] mb-3">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isNew && (
            <span className="bg-stone-900 text-white text-[10px] tracking-widest uppercase px-2 py-0.5 font-medium">
              New
            </span>
          )}
          {product.isBestseller && !product.isNew && (
            <span className="bg-gold-600 text-white text-[10px] tracking-widest uppercase px-2 py-0.5 font-medium">
              Bestseller
            </span>
          )}
        </div>

        {/* Quick add overlay */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            className="w-full bg-stone-900 text-white text-xs tracking-widest uppercase py-3 hover:bg-gold-700 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            Quick Add
          </button>
        </div>
      </div>

      {/* Info */}
      <div>
        {showBrand && brand && (
          <p className="text-[10px] tracking-[0.2em] uppercase text-stone-400 mb-0.5">{brand.name}</p>
        )}
        <p className="text-sm text-stone-800 font-medium leading-snug mb-1">{product.name}</p>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-stone-900">${product.price.toLocaleString()}</p>
          <p className="text-xs text-stone-400">{product.category}</p>
        </div>
        {/* Color dots */}
        {product.colors.length > 1 && (
          <div className="flex gap-1 mt-1.5">
            {product.colors.slice(0, 4).map((color) => (
              <span
                key={color}
                className="text-[10px] text-stone-400"
                title={color}
              >
                {color}
                {product.colors.indexOf(color) < Math.min(product.colors.length, 4) - 1 ? " /" : ""}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
