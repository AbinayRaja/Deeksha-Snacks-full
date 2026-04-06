import { Link, useRoute, useLocation } from "wouter";
import { ShoppingBag, Menu, X, Store, Search, MapPin, ClipboardList, LogOut, User, ChevronDown } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProducts } from "@/context/ProductContext";

const PAGE_THEMES: Record<string, { glass: string; solid: string; linkActive: string }> = {
  "/": { glass: "bg-white/80 backdrop-blur-xl border-b border-white/20", solid: "bg-transparent", linkActive: "text-primary" },
  "/products": { glass: "bg-orange-50/90 backdrop-blur-xl border-b border-orange-100", solid: "bg-orange-50/60 backdrop-blur-sm", linkActive: "text-orange-600" },
  "/cart": { glass: "bg-amber-50/90 backdrop-blur-xl border-b border-amber-100", solid: "bg-amber-50/60 backdrop-blur-sm", linkActive: "text-amber-600" },
  "/order": { glass: "bg-green-50/90 backdrop-blur-xl border-b border-green-100", solid: "bg-green-50/60 backdrop-blur-sm", linkActive: "text-green-600" },
  "/contact": { glass: "bg-blue-50/90 backdrop-blur-xl border-b border-blue-100", solid: "bg-blue-50/60 backdrop-blur-sm", linkActive: "text-blue-600" },
  "/address": { glass: "bg-purple-50/90 backdrop-blur-xl border-b border-purple-100", solid: "bg-purple-50/60 backdrop-blur-sm", linkActive: "text-purple-600" },
  "/my-orders": { glass: "bg-rose-50/90 backdrop-blur-xl border-b border-rose-100", solid: "bg-rose-50/60 backdrop-blur-sm", linkActive: "text-rose-600" },
};

export function Navbar() {
  const { totalCount } = useCart();
  const { products } = useProducts();
  const { user, isLoggedIn, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [location] = useLocation();
  const searchRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [isHome] = useRoute("/");
  const [isProducts] = useRoute("/products");
  const [isContact] = useRoute("/contact");
  const [isAddress] = useRoute("/address");
  const [isMyOrders] = useRoute("/my-orders");

  const theme = PAGE_THEMES[location] || PAGE_THEMES["/"];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { if (searchOpen) searchRef.current?.focus(); }, [searchOpen]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const searchResults = searchQuery.trim().length > 1
    ? products.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

  const closeMenu = () => setMobileMenuOpen(false);
  const navBg = isScrolled ? theme.glass : theme.solid;

  return (
    <>
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? `${navBg} py-3 shadow-sm shadow-black/5` : `${navBg} py-5`}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="bg-primary text-white p-2 rounded-xl group-hover:scale-105 transition-transform shadow-md shadow-primary/20">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-display font-black text-foreground leading-none">
                  Deeksha <span className="text-primary">Snacks</span>
                </h1>
                <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground hidden sm:block">Pocket Price 😋</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {[
                { href: "/", label: "Home", active: isHome },
                { href: "/products", label: "Menu", active: isProducts },
                { href: "/contact", label: "Contact", active: isContact },
              ].map((item) => (
                <Link key={item.href} href={item.href}
                  className={`font-semibold transition-colors hover:text-primary relative group ${item.active ? theme.linkActive : "text-foreground/80"}`}>
                  {item.label}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary rounded-full transition-all duration-300 ${item.active ? "w-full" : "w-0 group-hover:w-full"}`} />
                </Link>
              ))}
              {isLoggedIn && (
                <>
                  <Link href="/address"
                    className={`font-semibold transition-colors hover:text-primary relative group flex items-center gap-1.5 ${isAddress ? theme.linkActive : "text-foreground/80"}`}>
                    <MapPin className="w-4 h-4" /> Address
                    <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary rounded-full transition-all duration-300 ${isAddress ? "w-full" : "w-0 group-hover:w-full"}`} />
                  </Link>
                  <Link href="/my-orders"
                    className={`font-semibold transition-colors hover:text-primary relative group flex items-center gap-1.5 ${isMyOrders ? theme.linkActive : "text-foreground/80"}`}>
                    <ClipboardList className="w-4 h-4" /> Orders
                    <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary rounded-full transition-all duration-300 ${isMyOrders ? "w-full" : "w-0 group-hover:w-full"}`} />
                  </Link>
                </>
              )}
            </nav>

            <div className="flex items-center gap-2">
              <div className="relative hidden md:block">
                <AnimatePresence>
                  {searchOpen && (
                    <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 240, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="overflow-hidden">
                      <input ref={searchRef} type="text" value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
                        placeholder="Search snacks..."
                        className="w-full pl-4 pr-4 py-2 bg-white border-2 border-primary/20 rounded-xl font-medium text-sm focus:outline-none focus:border-primary transition-all" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {searchResults.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                      className="absolute top-full mt-2 left-0 w-64 bg-white rounded-2xl shadow-xl border border-border overflow-hidden z-50">
                      {searchResults.map((p) => (
                        <Link key={p.id} href="/products" onClick={() => { setSearchQuery(""); setSearchOpen(false); }}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
                          <span className="text-2xl">{p.emoji}</span>
                          <div>
                            <p className="font-semibold text-sm text-foreground">{p.name}</p>
                            <p className="text-xs text-primary font-bold">₹{p.price}</p>
                          </div>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button onClick={() => setSearchOpen(!searchOpen)} className="hidden md:flex p-2 text-foreground/70 hover:text-primary transition-colors rounded-lg hover:bg-primary/5">
                {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              </button>

              <Link href="/cart" className="relative p-2 text-foreground/80 hover:text-primary transition-colors">
                <ShoppingBag className="w-6 h-6" />
                <AnimatePresence>
                  {totalCount > 0 && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      className="absolute top-0 right-0 bg-accent text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                      {totalCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              {isLoggedIn ? (
                <div className="relative hidden md:block" ref={userMenuRef}>
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 pl-3 pr-2 py-2 bg-primary/10 rounded-xl hover:bg-primary/15 transition-all">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm font-bold text-foreground max-w-[80px] truncate">{user?.name}</span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-border overflow-hidden z-50">
                        <Link href="/address" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors font-semibold text-sm">
                          <MapPin className="w-4 h-4 text-primary" /> My Addresses
                        </Link>
                        <Link href="/my-orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors font-semibold text-sm">
                          <ClipboardList className="w-4 h-4 text-primary" /> My Orders
                        </Link>
                        <hr className="border-border" />
                        <button onClick={() => { logout(); setUserMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors font-semibold text-sm text-red-600">
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link href="/login" className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm shadow-md shadow-primary/25 hover:bg-primary/90 transition-all">
                  <User className="w-4 h-4" /> Login
                </Link>
              )}

              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-foreground/80">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-background/97 backdrop-blur-xl md:hidden pt-24 pb-8 px-6 flex flex-col overflow-y-auto">
            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search snacks..."
                className="w-full pl-11 pr-4 py-3.5 bg-muted/50 border-2 border-border rounded-2xl font-medium focus:outline-none focus:border-primary transition-all" />
            </div>

            {isLoggedIn && (
              <div className="flex items-center gap-3 px-4 py-4 bg-primary/5 rounded-2xl mb-4">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-foreground">{user?.name}</p>
                  <p className="text-sm text-muted-foreground font-medium">+91 {user?.phone}</p>
                </div>
              </div>
            )}

            <nav className="flex flex-col gap-2">
              {[
                { href: "/", label: "🏠 Home" },
                { href: "/products", label: "🍿 Our Menu" },
                { href: "/cart", label: "🛒 Cart" },
                { href: "/contact", label: "📞 Contact" },
                ...(isLoggedIn
                  ? [{ href: "/address", label: "📍 My Addresses" }, { href: "/my-orders", label: "📦 My Orders" }]
                  : [{ href: "/login", label: "👤 Login / Sign Up" }]),
              ].map((item) => (
                <Link key={item.href} href={item.href} onClick={closeMenu}
                  className="text-xl font-display font-bold px-4 py-4 rounded-2xl hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-between">
                  {item.label}
                  {item.href === "/cart" && totalCount > 0 && (
                    <span className="bg-primary text-white text-sm px-3 py-1 rounded-full">{totalCount} items</span>
                  )}
                </Link>
              ))}
              {isLoggedIn && (
                <button onClick={() => { logout(); closeMenu(); }}
                  className="text-xl font-display font-bold px-4 py-4 rounded-2xl hover:bg-red-50 text-red-600 transition-all flex items-center gap-3 mt-2">
                  <LogOut className="w-5 h-5" /> Logout
                </button>
              )}
            </nav>

            <div className="mt-auto pt-8 border-t border-border text-center">
              <p className="text-sm font-semibold text-muted-foreground">Tasty Snacks at Pocket Price 😋</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
