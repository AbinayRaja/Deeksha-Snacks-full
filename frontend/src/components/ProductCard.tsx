import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
  index: number;
}

// Optional: products can have a "badge" field like "Best Seller" | "New" | "Hot"
// Falls back gracefully if not present.

export function ProductCard({ product, index }: ProductCardProps) {
  const { items, addToCart, updateQuantity } = useCart();

  const cartItem = items.find((item) => item.id === product.id);
  const quantity = cartItem?.quantity || 0;

  const badge = (product as any).badge as string | undefined;

  const BADGE_STYLES: Record<string, string> = {
    "Best Seller": "bg-amber-500 text-white",
    "New": "bg-green-500 text-white",
    "Hot": "bg-red-500 text-white",
    "Popular": "bg-purple-500 text-white",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="bg-card rounded-3xl p-4 shadow-lg shadow-black/5 border border-border/50 hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 flex flex-col group h-full"
    >
      {/* Image */}
      <div className="relative h-44 w-full overflow-hidden rounded-2xl mb-4 bg-muted">
        {/* Badge */}
        {badge && (
          <span className={`absolute top-2 left-2 z-10 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-sm ${BADGE_STYLES[badge] || "bg-primary text-white"}`}>
            {badge}
          </span>
        )}

        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) fallback.classList.remove("hidden");
          }}
        />
        <div className={`hidden absolute inset-0 flex items-center justify-center text-6xl ${product.colorClass}`}>
          {product.emoji}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Category */}
        <span className="text-[10px] uppercase font-black tracking-widest px-2 py-1 rounded-md bg-primary/10 text-primary w-fit mb-2">
          {product.category}
        </span>

        {/* Name */}
        <h3 className="font-display font-bold text-lg text-foreground leading-tight mb-1">
          {product.name}
        </h3>

        {/* Description (optional field) */}
        {(product as any).description && (
          <p className="text-xs text-muted-foreground font-medium mb-2 line-clamp-2">
            {(product as any).description}
          </p>
        )}

        {/* Price + Cart */}
        <div className="mt-auto flex items-center justify-between pt-4">
          <div>
            <span className="font-display font-black text-2xl text-primary">₹{product.price}</span>
            {(product as any).originalPrice && (
              <span className="text-xs text-muted-foreground line-through ml-2">
                ₹{(product as any).originalPrice}
              </span>
            )}
          </div>

          {quantity > 0 ? (
            <div className="flex items-center gap-2 bg-primary/5 px-2 py-1.5 rounded-xl border border-primary/20">
              <button
                onClick={() => updateQuantity(product.id, quantity - 1)}
                className="w-7 h-7 flex items-center justify-center bg-white rounded-lg text-foreground shadow-sm hover:bg-primary hover:text-white transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-bold w-5 text-center text-sm">{quantity}</span>
              <button
                onClick={() => updateQuantity(product.id, quantity + 1)}
                className="w-7 h-7 flex items-center justify-center bg-white rounded-lg text-foreground shadow-sm hover:bg-primary hover:text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => addToCart(product)}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md shadow-primary/25 hover:bg-primary/90 transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              Add
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}