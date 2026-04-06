import { Link, useLocation } from "wouter";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/context/ProductContext";
import { Plus, Minus, Trash2, ArrowRight, ShoppingBag, Tag, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ProductCard } from "@/components/ProductCard";

const COUPONS: Record<string, number> = {
  SNACK10: 10,
  DEEKSHA20: 20,
  FIRSTORDER: 15,
};

export default function Cart() {
  const { items, updateQuantity, removeFromCart, totalPrice, totalCount } = useCart();
  const { products } = useProducts();
  const [, setLocation] = useLocation();
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState("");

  const finalPrice = appliedCoupon ? Math.max(0, totalPrice - appliedCoupon.discount) : totalPrice;

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (COUPONS[code]) {
      setAppliedCoupon({ code, discount: COUPONS[code] });
      setCouponError("");
      setCouponInput("");
    } else {
      setCouponError("Invalid coupon code. Try SNACK10 or DEEKSHA20!");
    }
  };

  const suggestions = products
    .filter((p) => !items.find((i) => i.id === p.id))
    .slice(0, 4);

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 flex flex-col items-center justify-center bg-gray-50/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto">
            <ShoppingBag className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-3xl font-display font-black text-foreground mb-4">Your cart is empty</h2>
          <p className="text-muted-foreground font-medium mb-8 text-center max-w-md">
            Looks like you haven't added any snacks yet. Let's fix that!
          </p>
          <Link
            href="/products"
            className="px-8 py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 inline-flex items-center gap-2"
          >
            Start Shopping <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>

        {/* Suggestions even when empty */}
        {suggestions.length > 0 && (
          <div className="mt-20 max-w-4xl w-full">
            <h3 className="text-2xl font-display font-black mb-6 text-center">Popular Snacks</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {suggestions.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-display font-black text-foreground">Your Cart</h1>
          <span className="bg-primary/10 text-primary font-bold px-4 py-1.5 rounded-full">
            {totalCount} Items
          </span>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-border overflow-hidden">
          {/* Items */}
          <div className="p-6 sm:p-8">
            <div className="space-y-6">
              <AnimatePresence>
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 sm:gap-6 pb-6 border-b border-border last:border-0 last:pb-0"
                  >
                    <div className={`w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-2xl overflow-hidden border border-border bg-muted`}>
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className={`w-full h-full ${item.colorClass} flex items-center justify-center text-4xl`}>
                          {item.emoji}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold font-display text-foreground truncate mb-1">
                        {item.name}
                      </h3>
                      <p className="text-primary font-black text-lg">₹{item.price}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                      <div className="flex items-center gap-2 bg-muted/50 px-2 py-1.5 rounded-xl border border-border">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm hover:bg-primary hover:text-white transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm hover:bg-primary hover:text-white transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm font-bold text-foreground">₹{item.price * item.quantity}</p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Coupon + Summary */}
          <div className="bg-gray-50/80 p-6 sm:p-8 border-t border-border">
            {/* Coupon */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" /> Coupon Code
              </label>
              {appliedCoupon ? (
                <div className="flex items-center gap-3 bg-green-50 border-2 border-green-200 rounded-xl px-4 py-3">
                  <span className="text-green-700 font-bold flex-1">
                    🎉 "{appliedCoupon.code}" applied — ₹{appliedCoupon.discount} off!
                  </span>
                  <button
                    onClick={() => setAppliedCoupon(null)}
                    className="text-green-700 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => { setCouponInput(e.target.value); setCouponError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                    placeholder="Enter code (e.g. SNACK10)"
                    className="flex-1 px-4 py-3 bg-white border-2 border-border rounded-xl font-medium focus:outline-none focus:border-primary transition-all uppercase"
                  />
                  <button
                    onClick={applyCoupon}
                    className="px-5 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all"
                  >
                    Apply
                  </button>
                </div>
              )}
              {couponError && (
                <p className="text-destructive text-sm font-semibold mt-2">{couponError}</p>
              )}
            </div>

            {/* Price breakdown */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between items-center text-muted-foreground font-semibold">
                <span>Subtotal</span>
                <span>₹{totalPrice}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between items-center text-green-600 font-semibold">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>- ₹{appliedCoupon.discount}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-muted-foreground font-semibold">
                <span>Delivery</span>
                <span className="text-green-600">Free</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-border mb-8">
              <span className="text-2xl font-display font-black">Total</span>
              <span className="text-3xl font-display font-black text-primary">₹{finalPrice}</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setLocation("/order")}
                className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary/25 hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0 transition-all flex justify-center items-center gap-2"
              >
                Proceed to Checkout <ArrowRight className="w-5 h-5" />
              </button>
              <Link
                href="/products"
                className="flex-1 py-4 bg-white text-foreground border-2 border-border rounded-2xl font-bold text-lg hover:border-foreground/30 transition-colors flex justify-center items-center"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>

        {/* You might also like */}
        {suggestions.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-display font-black mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {suggestions.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}