import { Link } from "wouter";
import { useProducts } from "@/context/ProductContext";
import { ProductCard } from "@/components/ProductCard";
import { ArrowRight, Star, Clock, ShieldCheck, Flame, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

const REVIEWS = [
  { name: "Priya S.", rating: 5, text: "Best masala chips in the city! So fresh and crunchy 🔥", avatar: "🧕" },
  { name: "Ravi K.", rating: 5, text: "Order every week. The pocket price is unbeatable!", avatar: "👨‍💼" },
  { name: "Ananya M.", rating: 5, text: "The varuki is absolutely divine. Addicted!", avatar: "👩" },
  { name: "Karthik B.", rating: 4, text: "Super quick delivery and snacks are always fresh.", avatar: "🧑" },
];

export default function Home() {
  const { products } = useProducts();
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt="Background"
            className="w-full h-full object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
        </div>

        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 relative z-10 text-center -mt-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm mb-2 border border-primary/20">              <Flame className="w-4 h-4 animate-bounce" /> Sizzling Hot Deals
            </span>
            <h1 className="relative bottom-1 text-5xl md:text-7xl font-display font-black text-foreground leading-tight">
              Tasty Snacks at <br />
              <span className="  text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Pocket Price
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto mb-10">
              Craving something crunchy, spicy, or sweet? Deeksha Snacks brings you the best quality munchies starting at just ₹20!
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link
                href="/products"
                className="px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                Shop Menu Now <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/products"
                className="px-8 py-4 bg-white text-foreground border-2 border-border rounded-2xl font-bold text-lg hover:border-primary hover:text-primary transition-colors w-full sm:w-auto justify-center flex"
              >
                View ₹20 Specials
              </Link>
            </div>

            {/* Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-flex flex-wrap justify-center gap-6 bg-white/80 backdrop-blur-sm border border-border rounded-2xl px-8 py-4 shadow-sm"
            >
              {[
                { value: "500+", label: "Happy Customers" },
                { value: "20+", label: "Snack Varieties" },
                { value: "₹20", label: "Starting Price" },
                { value: "100%", label: "Fresh Daily" },
              ].map((stat) => (
                <div key={stat.label} className="text-center px-4 border-r border-border last:border-0">
                  <p className="text-xl font-black text-primary">{stat.value}</p>
                  <p className="text-xs font-semibold text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
            className="mt-12 flex justify-center"
          >
            <ChevronDown className="w-6 h-6 text-muted-foreground/50" />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Star, title: "Premium Quality", desc: "Made with the finest ingredients for the perfect crunch.", color: "bg-yellow-100 text-yellow-600" },
              { icon: ShieldCheck, title: "Hygienic Prep", desc: "Prepared and packed with strict cleanliness standards.", color: "bg-green-100 text-green-600" },
              { icon: Clock, title: "Always Fresh", desc: "Fresh batches made daily to ensure maximum flavor.", color: "bg-blue-100 text-blue-600" },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center p-6 rounded-3xl bg-background border border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-300"
              >
                <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-4`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold font-display mb-2">{feature.title}</h3>
                <p className="text-muted-foreground font-medium">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <span className="text-primary font-bold text-sm uppercase tracking-widest">Top Picks</span>
              <h2 className="text-3xl md:text-4xl font-display font-black mb-2 mt-1">Customer Favorites</h2>
              <p className="text-muted-foreground font-medium text-lg">Our most loved snacks that fly off the shelves.</p>
            </div>
            <Link href="/products" className="text-primary font-bold hover:underline flex items-center gap-1 flex-shrink-0">
              See all snacks <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 bg-primary/5 border-y border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-primary font-bold text-sm uppercase tracking-widest">Testimonials</span>
            <h2 className="text-3xl md:text-4xl font-display font-black mt-1">What Our Customers Say</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {REVIEWS.map((review, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl p-6 border border-border shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{review.avatar}</span>
                  <div>
                    <p className="font-bold text-foreground">{review.name}</p>
                    <div className="flex gap-0.5">
                      {Array.from({ length: review.rating }).map((_, j) => (
                        <Star key={j} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground font-medium text-sm leading-relaxed">"{review.text}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-primary rounded-3xl p-10 md:p-16 relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10 text-8xl flex flex-wrap gap-4 overflow-hidden select-none pointer-events-none">
              {["🍿", "🥜", "🍪", "🌶️", "🥔", "🍩"].map((e, i) => (
                <span key={i} style={{ transform: `rotate(${i * 15 - 20}deg)` }}>{e}</span>
              ))}
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-display font-black text-white mb-4">
                Hungry? Order Now! 🔥
              </h2>
              <p className="text-white/80 font-medium text-lg mb-8">
                Fresh snacks delivered straight to your door. Starting at just ₹20!
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary rounded-2xl font-bold text-lg hover:bg-white/90 transition-all shadow-xl hover:-translate-y-1"
              >
                Browse Menu <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}