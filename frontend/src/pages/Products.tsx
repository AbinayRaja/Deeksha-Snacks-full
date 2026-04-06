import { useState, useMemo } from "react";
import { Category } from "@/data/products";
import { useProducts } from "@/context/ProductContext";
import { ProductCard } from "@/components/ProductCard";
import { Search, SlidersHorizontal, ArrowDownAZ, ArrowUpZA, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Products() {
  const { products, categories } = useProducts();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "All" || product.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
    if (sortOrder === "asc") result = [...result].sort((a, b) => a.price - b.price);
    else if (sortOrder === "desc") result = [...result].sort((a, b) => b.price - a.price);
    return result;
  }, [searchQuery, activeCategory, sortOrder, products]);

  const hasFilters = searchQuery || activeCategory !== "All" || sortOrder;

  const clearAll = () => {
    setSearchQuery("");
    setActiveCategory("All");
    setSortOrder(null);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background">
      {/* Page Header */}
      <div className="bg-primary/5 py-12 mb-8 border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-primary font-bold text-sm uppercase tracking-widest"
          >
            Fresh & Crunchy
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-display font-black text-foreground mt-1 mb-4"
          >
            Our Menu
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground font-medium text-lg max-w-2xl mx-auto"
          >
            Discover our full range of crispy, crunchy, and flavor-packed snacks.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-3 font-bold text-primary"
          >
            {products.length} snacks available
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8 items-start lg:items-center justify-between">
          {/* Search */}
          <div className="relative w-full lg:w-96 flex-shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for a snack..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3.5 bg-white border-2 border-border rounded-2xl text-foreground font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full justify-end">
            {/* Sort */}
            <div className="relative flex-shrink-0">
              <select
                value={sortOrder || ""}
                onChange={(e) => setSortOrder((e.target.value as any) || null)}
                className="appearance-none px-5 py-3.5 bg-white border-2 border-border rounded-2xl text-foreground font-bold focus:outline-none focus:border-primary transition-all cursor-pointer pr-10"
              >
                <option value="">Sort by Relevance</option>
                <option value="asc">Price: Low to High</option>
                <option value="desc">Price: High to Low</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                {sortOrder === "asc" ? (
                  <ArrowDownAZ className="w-5 h-5 text-muted-foreground" />
                ) : sortOrder === "desc" ? (
                  <ArrowUpZA className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <SlidersHorizontal className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </div>

            {/* Categories */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide max-w-full">
              <button
                onClick={() => setActiveCategory("All")}
                className={`flex-shrink-0 px-5 py-3 rounded-xl font-bold transition-all border-2 ${activeCategory === "All"
                    ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                    : "bg-white text-foreground border-border hover:border-primary/50"
                  }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`flex-shrink-0 px-5 py-3 rounded-xl font-bold transition-all border-2 ${activeCategory === category
                      ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                      : "bg-white text-foreground border-border hover:border-primary/50"
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active filters summary */}
        <AnimatePresence>
          {hasFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 mb-6 overflow-hidden"
            >
              <span className="text-sm text-muted-foreground font-semibold">
                Showing <span className="text-primary font-black">{filteredProducts.length}</span> results
              </span>
              <button
                onClick={clearAll}
                className="text-sm font-bold text-destructive hover:underline flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Clear filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-white rounded-3xl border border-border shadow-sm max-w-2xl mx-auto"
          >
            <span className="text-7xl mb-6 block drop-shadow-md">😔</span>
            <h3 className="text-3xl font-display font-bold text-foreground mb-3">No snacks found</h3>
            <p className="text-muted-foreground font-medium text-lg mb-8 px-6">
              We couldn't find any snacks matching your search. Try a different term or category!
            </p>
            <button
              onClick={clearAll}
              className="px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary/90 hover:-translate-y-1 transition-all shadow-lg shadow-primary/20"
            >
              Clear all filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}