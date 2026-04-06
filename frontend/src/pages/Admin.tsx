import { useState, useEffect, useMemo } from "react";
import { useProducts } from "@/context/ProductContext";
import { useOrders, Order, OrderStatus } from "@/context/OrderContext";
import { CATEGORIES, Category } from "@/data/products";
import {
  LayoutDashboard, Package, ShoppingCart, LogOut, Plus, Pencil, Trash2,
  Check, X, Eye, TrendingUp, Users, RefreshCw, Lock, ChevronDown,
  ImageIcon, AlertCircle, Store, Search, Download, BarChart2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ADMIN_PASSWORD = "admin123";
const AUTH_KEY = "deeksha-admin-auth";
type AdminTab = "dashboard" | "products" | "orders";

const STATUS_COLORS: Record<OrderStatus, string> = {
  Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Preparing: "bg-blue-100 text-blue-700 border-blue-200",
  "Out for Delivery": "bg-purple-100 text-purple-700 border-purple-200",
  Delivered: "bg-green-100 text-green-700 border-green-200",
  Cancelled: "bg-red-100 text-red-700 border-red-200",
};

const EMOJI_OPTIONS = ["🍿", "🥜", "🍪", "🍩", "🌶️", "🥔", "🍚", "🫓", "🍘", "🥨", "🔥", "🌿", "🌰", "🧉", "🍯", "🫘", "🥗", "🍱", "🥙", "🧆"];

const CATEGORY_COLORS: Record<Category, { colorClass: string; textColorClass: string }> = {
  "Pocket Snacks": { colorClass: "bg-red-100", textColorClass: "text-red-600" },
  Biscuits: { colorClass: "bg-amber-100", textColorClass: "text-amber-700" },
  Varuki: { colorClass: "bg-orange-100", textColorClass: "text-orange-700" },
  Nuts: { colorClass: "bg-yellow-100", textColorClass: "text-yellow-700" },
};

// ─── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem(AUTH_KEY, "true");
      onLogin();
    } else {
      setError("Incorrect password. Try 'admin123'");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl shadow-primary/10 p-8 w-full max-w-sm border border-border"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary/25">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-foreground">Admin Panel</h1>
          <p className="text-sm text-muted-foreground font-medium mt-1">Deeksha Snacks Management</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-foreground mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="Enter admin password"
                className="w-full pl-10 pr-4 py-3 bg-muted/40 border-2 border-border rounded-xl font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>
            {error && (
              <p className="text-destructive text-sm font-semibold mt-2 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {error}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary text-white rounded-xl font-bold text-base shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : null}
            {loading ? "Verifying..." : "Login"}
          </button>
        </form>
        <p className="text-center text-xs text-muted-foreground mt-6 font-medium">
          Default password: <span className="font-bold text-foreground">admin123</span>
        </p>
      </motion.div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, trend }: { icon: any; label: string; value: string | number; color: string; trend?: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-border shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-black text-foreground mt-1">{value}</p>
      {trend && <p className="text-xs font-semibold text-green-600 mt-1">{trend}</p>}
    </div>
  );
}

// ─── Mini Bar Chart ───────────────────────────────────────────────────────────
function MiniBarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-2 h-20 mt-2">
      {data.map((item, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(item.value / max) * 100}%` }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className={`w-full ${item.color} rounded-t-md min-h-[4px]`}
            style={{ height: `${(item.value / max) * 100}%` }}
          />
          <span className="text-[9px] font-bold text-muted-foreground truncate w-full text-center">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Products Panel ───────────────────────────────────────────────────────────
type ProductFormState = {
  name: string; price: string; category: Category;
  image: string; emoji: string; colorClass: string; textColorClass: string;
};

const defaultForm: ProductFormState = {
  name: "", price: "", category: "Pocket Snacks",
  image: "", emoji: "🍿", colorClass: "bg-orange-100", textColorClass: "text-orange-600",
};

function ProductsPanel() {
  const { products, addProduct, updateProduct, deleteProduct, resetToDefaults } = useProducts();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<ProductFormState>(defaultForm);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [imagePreviewError, setImagePreviewError] = useState(false);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const startEdit = (id: string) => {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    setForm({ name: p.name, price: String(p.price), category: p.category, image: p.image || "", emoji: p.emoji, colorClass: p.colorClass, textColorClass: p.textColorClass });
    setEditingId(id);
    setShowAddForm(false);
    setImagePreviewError(false);
  };

  const handleCategoryChange = (cat: Category) => {
    const colors = CATEGORY_COLORS[cat];
    setForm((f) => ({ ...f, category: cat, ...colors }));
  };

  const saveEdit = () => {
    if (!editingId) return;
    const price = parseFloat(form.price);
    if (!form.name.trim() || isNaN(price) || price <= 0) return;
    updateProduct(editingId, { name: form.name.trim(), price, category: form.category, image: form.image, emoji: form.emoji, colorClass: form.colorClass, textColorClass: form.textColorClass });
    setEditingId(null);
  };

  const handleAdd = () => {
    const price = parseFloat(form.price);
    if (!form.name.trim() || isNaN(price) || price <= 0) return;
    addProduct({ name: form.name.trim(), price, category: form.category, image: form.image, emoji: form.emoji, colorClass: form.colorClass, textColorClass: form.textColorClass });
    setForm(defaultForm);
    setShowAddForm(false);
  };

  const openAddForm = () => { setShowAddForm(true); setEditingId(null); setForm(defaultForm); setImagePreviewError(false); };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-foreground">Products</h2>
          <p className="text-muted-foreground text-sm font-medium">{products.length} total products</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={resetToDefaults} className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-xl font-semibold text-sm border border-border hover:bg-muted/80 transition-all">
            <RefreshCw className="w-4 h-4" /> Reset
          </button>
          <button onClick={openAddForm} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-md shadow-primary/20 hover:bg-primary/90 transition-all">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {(showAddForm || editingId) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mb-6"
          >
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              {showAddForm ? <><Plus className="w-5 h-5 text-primary" /> Add New Product</> : <><Pencil className="w-5 h-5 text-primary" /> Edit Product</>}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1.5">Product Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Masala Chips" className="w-full px-4 py-2.5 bg-white border-2 border-border rounded-xl font-medium focus:outline-none focus:border-primary transition-all text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5">Price (₹) *</label>
                <input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} placeholder="e.g. 20" min="1" className="w-full px-4 py-2.5 bg-white border-2 border-border rounded-xl font-medium focus:outline-none focus:border-primary transition-all text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5">Category *</label>
                <select value={form.category} onChange={(e) => handleCategoryChange(e.target.value as Category)} className="w-full px-4 py-2.5 bg-white border-2 border-border rounded-xl font-medium focus:outline-none focus:border-primary transition-all text-sm">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2 lg:col-span-2">
                <label className="block text-sm font-bold mb-1.5"><ImageIcon className="inline w-3.5 h-3.5 mr-1" />Image URL</label>
                <input type="url" value={form.image} onChange={(e) => { setForm((f) => ({ ...f, image: e.target.value })); setImagePreviewError(false); }} placeholder="https://example.com/snack.jpg" className="w-full px-4 py-2.5 bg-white border-2 border-border rounded-xl font-medium focus:outline-none focus:border-primary transition-all text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5">Emoji (fallback)</label>
                <select value={form.emoji} onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))} className="w-full px-4 py-2.5 bg-white border-2 border-border rounded-xl font-medium focus:outline-none focus:border-primary transition-all text-sm">
                  {EMOJI_OPTIONS.map((e) => <option key={e} value={e}>{e} {e}</option>)}
                </select>
              </div>
            </div>
            {form.image && (
              <div className="mt-4 flex items-center gap-3">
                <span className="text-sm font-semibold text-muted-foreground">Preview:</span>
                {!imagePreviewError ? (
                  <img src={form.image} alt="Preview" className="w-16 h-16 object-cover rounded-xl border-2 border-border" onError={() => setImagePreviewError(true)} />
                ) : (
                  <div className="w-16 h-16 bg-muted rounded-xl border-2 border-border flex items-center justify-center text-2xl">{form.emoji}</div>
                )}
                {imagePreviewError && <span className="text-destructive text-xs font-semibold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Image failed — emoji fallback will be used</span>}
              </div>
            )}
            <div className="flex items-center gap-3 mt-5">
              <button onClick={showAddForm ? handleAdd : saveEdit} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-md shadow-primary/20 hover:bg-primary/90 transition-all">
                <Check className="w-4 h-4" /> {showAddForm ? "Add Product" : "Save Changes"}
              </button>
              <button onClick={() => { setShowAddForm(false); setEditingId(null); }} className="flex items-center gap-2 px-5 py-2.5 bg-muted text-muted-foreground rounded-xl font-semibold text-sm border border-border hover:bg-muted/80 transition-all">
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-white border-2 border-border rounded-xl text-sm font-medium focus:outline-none focus:border-primary transition-all" />
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-5 py-3 font-bold text-muted-foreground">Product</th>
                <th className="text-left px-5 py-3 font-bold text-muted-foreground">Category</th>
                <th className="text-right px-5 py-3 font-bold text-muted-foreground">Price</th>
                <th className="text-center px-5 py-3 font-bold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${p.colorClass}`}>{p.emoji}</div>
                      <span className="font-semibold text-foreground">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3"><span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-lg">{p.category}</span></td>
                  <td className="px-5 py-3 text-right font-bold text-foreground">₹{p.price}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => startEdit(p.id)} className="p-1.5 text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"><Pencil className="w-4 h-4" /></button>
                      {confirmDelete === p.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => { deleteProduct(p.id); setConfirmDelete(null); }} className="p-1.5 text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"><Check className="w-4 h-4" /></button>
                          <button onClick={() => setConfirmDelete(null)} className="p-1.5 text-muted-foreground bg-muted rounded-lg hover:bg-muted/80 transition-colors"><X className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDelete(p.id)} className="p-1.5 text-destructive bg-destructive/10 rounded-lg hover:bg-destructive/20 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── WhatsApp Helper ──────────────────────────────────────────────────────────
function sendWhatsAppUpdate(order: Order, newStatus: OrderStatus) {
  const STATUS_EMOJI: Record<OrderStatus, string> = {
    Pending: "⏳",
    Preparing: "👨‍🍳",
    "Out for Delivery": "🛵",
    Delivered: "✅",
    Cancelled: "❌",
  };
  const emoji = STATUS_EMOJI[newStatus] || "📦";
  const msg =
    `${emoji} *Deeksha Snacks - Order Update*\n\n` +
    `Hi ${order.name}! Your order *${order.id}* status has been updated.\n\n` +
    `📦 New Status: *${newStatus}*\n` +
    `🛒 Items: ${order.items.map((i) => `${i.name} x${i.quantity}`).join(", ")}\n` +
    `💰 Total: ₹${order.total}\n\n` +
    `Thank you for ordering from Deeksha Snacks! 😋`;

  const phone = order.phone.replace(/\D/g, "");
  const waPhone = phone.startsWith("91") ? phone : `91${phone}`;
  const url = `https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
}

// ─── Orders Panel ─────────────────────────────────────────────────────────────
function OrdersPanel() {
  const { orders, updateOrderStatus, deleteOrder } = useOrders();
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const statuses: OrderStatus[] = ["Pending", "Preparing", "Out for Delivery", "Delivered", "Cancelled"];

  const handleStatusChange = (order: Order, newStatus: OrderStatus) => {
    updateOrderStatus(order.id, newStatus);
    sendWhatsAppUpdate(order, newStatus);
  };

  const filtered = orders.filter((o) => {
    const matchStatus = filterStatus === "All" || o.status === filterStatus;
    const matchSearch = o.name.toLowerCase().includes(searchQuery.toLowerCase()) || o.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const exportCSV = () => {
    const headers = ["Order ID", "Name", "Phone", "Address", "Items", "Total", "Status", "Date"];
    const rows = orders.map((o) => [
      o.id, o.name, o.phone, `"${o.address}"`,
      `"${o.items.map((i) => `${i.name}x${i.quantity}`).join(", ")}"`,
      o.total, o.status,
      new Date(o.createdAt).toLocaleDateString("en-IN"),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "orders.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-foreground">Orders</h2>
          <p className="text-muted-foreground text-sm font-medium">{orders.length} total orders</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-all shadow-md">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search by name or order ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-white border-2 border-border rounded-xl text-sm font-medium focus:outline-none focus:border-primary transition-all" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["All", ...statuses] as const).map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all ${filterStatus === s ? "bg-primary text-white border-primary" : "bg-white border-border text-muted-foreground hover:border-primary/50"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border py-16 text-center">
          <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
          <p className="text-muted-foreground font-medium">No orders found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left px-5 py-3.5 font-bold text-muted-foreground">Order ID</th>
                  <th className="text-left px-5 py-3.5 font-bold text-muted-foreground">Customer</th>
                  <th className="text-left px-5 py-3.5 font-bold text-muted-foreground">Date</th>
                  <th className="text-right px-5 py-3.5 font-bold text-muted-foreground">Total</th>
                  <th className="text-center px-5 py-3.5 font-bold text-muted-foreground">Status</th>
                  <th className="text-center px-5 py-3.5 font-bold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-primary text-xs">{order.id}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-foreground">{order.name}</p>
                      <p className="text-muted-foreground text-xs">{order.phone}</p>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground text-xs">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      <br />
                      {new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-foreground">₹{order.total}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-center">
                        <select value={order.status} onChange={(e) => handleStatusChange(order, e.target.value as OrderStatus)} className={`text-xs font-bold px-3 py-1.5 rounded-lg border-2 focus:outline-none cursor-pointer ${STATUS_COLORS[order.status]}`}>
                          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setViewOrder(order)} className="p-2 text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors" title="View Order"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => sendWhatsAppUpdate(order, order.status)} className="p-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors" title="Send WhatsApp Update">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                        </button>
                        <button onClick={() => deleteOrder(order.id)} className="p-2 text-destructive bg-destructive/10 rounded-lg hover:bg-destructive/20 transition-colors" title="Delete Order"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      <AnimatePresence>
        {viewOrder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 py-6" onClick={() => setViewOrder(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }} className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-border overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="bg-primary p-5 flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-xs font-semibold">Order Details</p>
                  <p className="text-white font-mono font-bold">{viewOrder.id}</p>
                </div>
                <button onClick={() => setViewOrder(null)} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-muted-foreground font-semibold text-xs uppercase">Customer</p><p className="font-bold">{viewOrder.name}</p></div>
                  <div><p className="text-muted-foreground font-semibold text-xs uppercase">Phone</p><p className="font-bold">{viewOrder.phone}</p></div>
                  <div className="col-span-2"><p className="text-muted-foreground font-semibold text-xs uppercase">Address</p><p className="font-semibold">{viewOrder.address}</p></div>
                  <div><p className="text-muted-foreground font-semibold text-xs uppercase">Date</p><p className="font-bold">{new Date(viewOrder.createdAt).toLocaleDateString("en-IN")}</p></div>
                  <div><p className="text-muted-foreground font-semibold text-xs uppercase">Status</p><span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold border ${STATUS_COLORS[viewOrder.status]}`}>{viewOrder.status}</span></div>
                </div>
                <div className="border-t border-border pt-4">
                  <p className="text-muted-foreground font-semibold text-xs uppercase mb-3">Items Ordered</p>
                  <div className="space-y-2">
                    {viewOrder.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <span className="font-semibold">{item.name} × {item.quantity}</span>
                        <span className="font-bold">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-3 pt-3 border-t border-border">
                    <span className="font-black">Total</span>
                    <span className="font-black text-primary text-lg">₹{viewOrder.total}</span>
                  </div>
                  <div className="flex gap-2 mt-4 pt-3 border-t border-border">
                    <button
                      onClick={() => sendWhatsAppUpdate(viewOrder, viewOrder.status)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600 transition-all"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                      WhatsApp
                    </button>
                    <a
                      href="/my-orders"
                      onClick={() => setViewOrder(null)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary/10 text-primary rounded-xl font-bold text-sm hover:bg-primary/20 transition-all"
                    >
                      My Orders ↗
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard() {
  const { products } = useProducts();
  const { orders, totalRevenue } = useOrders();

  const pendingOrders = orders.filter((o) => o.status === "Pending").length;
  const deliveredOrders = orders.filter((o) => o.status === "Delivered").length;
  const recentOrders = orders.slice(0, 5);

  const statusData = [
    { label: "Pending", value: pendingOrders, color: "bg-yellow-400" },
    { label: "Preparing", value: orders.filter((o) => o.status === "Preparing").length, color: "bg-blue-400" },
    { label: "Delivery", value: orders.filter((o) => o.status === "Out for Delivery").length, color: "bg-purple-400" },
    { label: "Done", value: deliveredOrders, color: "bg-green-500" },
    { label: "Cancelled", value: orders.filter((o) => o.status === "Cancelled").length, color: "bg-red-400" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-black text-foreground">Dashboard</h2>
        <p className="text-muted-foreground text-sm font-medium">Welcome back! Here's your store overview.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Package} label="Total Products" value={products.length} color="bg-primary/10 text-primary" />
        <StatCard icon={ShoppingCart} label="Total Orders" value={orders.length} color="bg-blue-100 text-blue-600" />
        <StatCard icon={TrendingUp} label="Revenue" value={`₹${totalRevenue.toLocaleString()}`} color="bg-green-100 text-green-600" trend="All time" />
        <StatCard icon={Users} label="Pending" value={pendingOrders} color="bg-yellow-100 text-yellow-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <h3 className="font-black text-foreground mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" /> Recent Orders
          </h3>
          {recentOrders.length === 0 ? (
            <p className="text-muted-foreground text-sm font-medium text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="font-bold text-foreground text-sm">{order.name}</p>
                    <p className="text-muted-foreground text-xs">{order.items.length} items · ₹{order.total}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${STATUS_COLORS[order.status]}`}>{order.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Status Chart */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <h3 className="font-black text-foreground mb-2 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-primary" /> Order Breakdown
          </h3>
          <MiniBarChart data={statusData} />
          <div className="flex flex-wrap gap-2 mt-4">
            {statusData.map((s) => (
              <span key={s.label} className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />{s.label} ({s.value})
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin ───────────────────────────────────────────────────────────────
export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem(AUTH_KEY) === "true");
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { orders } = useOrders();

  const pendingCount = orders.filter((o) => o.status === "Pending").length;

  const handleLogout = () => { localStorage.removeItem(AUTH_KEY); setIsAuthenticated(false); };

  if (!isAuthenticated) return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;

  const navItems: { id: AdminTab; label: string; icon: any }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingCart },
  ];

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-primary flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:flex`}>
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-black text-lg leading-none">Deeksha</p>
              <p className="text-white/60 text-xs font-semibold">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${activeTab === item.id ? "bg-white/20 text-white shadow-inner" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
              {item.id === "orders" && pendingCount > 0 && (
                <span className="ml-auto bg-accent text-white text-xs font-black px-2 py-0.5 rounded-full animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-1">
          <a href="/" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-white/10 hover:text-white font-semibold text-sm transition-all">
            <Eye className="w-5 h-5" /> View Store
          </a>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-white/10 hover:text-white font-semibold text-sm transition-all">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-muted-foreground hover:text-foreground">
              <ChevronDown className="w-5 h-5 rotate-[-90deg]" />
            </button>
            <h1 className="font-black text-foreground text-lg capitalize">{activeTab}</h1>
          </div>
          <div className="flex items-center gap-3">
            {pendingCount > 0 && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full animate-pulse">
                🔔 {pendingCount} pending order{pendingCount > 1 ? "s" : ""}
              </span>
            )}
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-black">A</div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {activeTab === "dashboard" && <Dashboard />}
              {activeTab === "products" && <ProductsPanel />}
              {activeTab === "orders" && <OrdersPanel />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}