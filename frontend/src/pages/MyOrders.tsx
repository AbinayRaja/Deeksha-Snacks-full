import { useOrders, OrderStatus } from "@/context/OrderContext";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Package, CheckCircle2, Truck, Clock, XCircle, ShoppingBag, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const STATUS_CONFIG: Record<OrderStatus, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
  Pending: {
    color: "text-yellow-700",
    bg: "bg-yellow-50 border-yellow-200",
    icon: <Clock className="w-4 h-4" />,
    label: "Order Placed",
  },
  Preparing: {
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
    icon: <Package className="w-4 h-4" />,
    label: "Preparing",
  },
  "Out for Delivery": {
    color: "text-purple-700",
    bg: "bg-purple-50 border-purple-200",
    icon: <Truck className="w-4 h-4" />,
    label: "Out for Delivery",
  },
  Delivered: {
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
    icon: <CheckCircle2 className="w-4 h-4" />,
    label: "Delivered",
  },
  Cancelled: {
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    icon: <XCircle className="w-4 h-4" />,
    label: "Cancelled",
  },
};

const STEPS: OrderStatus[] = ["Pending", "Preparing", "Out for Delivery", "Delivered"];

function OrderCard({ order }: { order: ReturnType<typeof useOrders>["orders"][0] }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[order.status];
  const stepIndex = STEPS.indexOf(order.status);

  const date = new Date(order.createdAt);
  const dateStr = date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const timeStr = date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-border overflow-hidden"
    >
      {/* Card Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-mono text-xs bg-muted px-2 py-1 rounded-lg text-muted-foreground font-bold">
                {order.id}
              </span>
              <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
                {cfg.icon} {cfg.label}
              </span>
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              {dateStr} at {timeStr}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-display font-black text-xl text-primary">₹{order.total}</p>
            <p className="text-xs text-muted-foreground font-medium">{order.items.length} item{order.items.length > 1 ? "s" : ""}</p>
          </div>
        </div>

        {/* Progress Bar (not cancelled) */}
        {order.status !== "Cancelled" && (
          <div className="mt-4">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 right-0 top-3.5 h-0.5 bg-border">
                <div
                  className="h-full bg-primary transition-all duration-700"
                  style={{ width: stepIndex >= 0 ? `${(stepIndex / (STEPS.length - 1)) * 100}%` : "0%" }}
                />
              </div>
              {STEPS.map((s, i) => {
                const sCfg = STATUS_CONFIG[s];
                const active = i <= stepIndex;
                return (
                  <div key={s} className="relative flex flex-col items-center gap-1.5 z-10">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${active ? "bg-primary border-primary text-white" : "bg-white border-border text-muted-foreground"}`}>
                      <span className="scale-75">{sCfg.icon}</span>
                    </div>
                    <span className={`text-[9px] font-bold text-center leading-tight max-w-[48px] ${active ? "text-primary" : "text-muted-foreground"}`}>
                      {s === "Out for Delivery" ? "On Way" : s}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 w-full flex items-center justify-between text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors py-1"
        >
          <span>Delivery to: <span className="text-foreground font-bold">{order.name}</span></span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-border pt-4 space-y-4">
              {/* Address */}
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Delivery Address</p>
                <p className="text-sm font-medium text-foreground">{order.address}</p>
                <p className="text-sm text-muted-foreground font-medium">📱 {order.phone}</p>
              </div>

              {/* Items */}
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Items Ordered</p>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{item.emoji}</span>
                        <span className="text-sm font-semibold text-foreground">{item.name}</span>
                        <span className="text-xs text-muted-foreground font-medium">x{item.quantity}</span>
                      </div>
                      <span className="text-sm font-bold">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="font-bold text-foreground">Total Paid</span>
                <span className="font-display font-black text-xl text-primary">₹{order.total}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function MyOrders() {
  const { orders } = useOrders();
  const { user, isLoggedIn } = useAuth();
  const [, setLocation] = useLocation();
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");

  if (!isLoggedIn) {
    setLocation("/login");
    return null;
  }

  // Filter orders by phone if user is logged in
  const myOrders = user
    ? orders.filter((o) => o.phone === user.phone)
    : orders;

  const filtered = filter === "all" ? myOrders : myOrders.filter((o) => o.status === filter);

  const tabs: Array<{ key: "all" | OrderStatus; label: string }> = [
    { key: "all", label: "All" },
    { key: "Pending", label: "Pending" },
    { key: "Preparing", label: "Preparing" },
    { key: "Out for Delivery", label: "On the Way" },
    { key: "Delivered", label: "Delivered" },
  ];

  return (
    <div className="min-h-screen pt-28 pb-20 bg-gray-50/40">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-black text-foreground">My Orders</h1>
          <p className="text-muted-foreground font-medium mt-1">
            {myOrders.length} order{myOrders.length !== 1 ? "s" : ""} placed
          </p>
        </div>

        {/* Filter Tabs */}
        {myOrders.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl font-bold text-sm transition-all ${filter === tab.key ? "bg-primary text-white shadow-md shadow-primary/25" : "bg-white border border-border text-muted-foreground hover:text-foreground"}`}
              >
                {tab.label}
                {tab.key !== "all" && (
                  <span className={`ml-1.5 text-xs ${filter === tab.key ? "text-white/80" : "text-muted-foreground"}`}>
                    ({myOrders.filter((o) => o.status === tab.key).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Orders */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-border">
            <ShoppingBag className="w-12 h-12 text-primary/40 mx-auto mb-4" />
            <h3 className="font-display font-bold text-lg text-foreground mb-2">
              {myOrders.length === 0 ? "No orders yet" : "No orders in this category"}
            </h3>
            <p className="text-muted-foreground text-sm font-medium mb-6">
              {myOrders.length === 0 ? "Your order history will appear here" : "Try a different filter"}
            </p>
            {myOrders.length === 0 && (
              <button
                onClick={() => setLocation("/products")}
                className="bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-primary/25 hover:bg-primary/90 transition-all"
              >
                Order Now
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filtered.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
