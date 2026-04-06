import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import confetti from "canvas-confetti";
import { useCart } from "@/context/CartContext";
import { useOrders } from "@/context/OrderContext";
import { useAuth } from "@/context/AuthContext";
import { MapPin, Phone, User, CheckCircle2, Package, Clock, Truck, Star, Loader2, ShieldCheck, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const orderSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^[0-9]{10}$/, "Must be a valid 10-digit phone number"),
  address: z.string().min(10, "Please provide a complete address"),
});
type OrderFormValues = z.infer<typeof orderSchema>;

const ORDER_STEPS = [
  { icon: CheckCircle2, label: "Order Placed", color: "text-green-500" },
  { icon: Package, label: "Preparing", color: "text-blue-500" },
  { icon: Truck, label: "Out for Delivery", color: "text-purple-500" },
  { icon: Star, label: "Delivered", color: "text-amber-500" },
];

// OTP Mini-Widget inline
function OtpVerifyInline({ phone, onVerified }: { phone: string; onVerified: () => void }) {
  const { markOtpVerified } = useAuth();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendOtp = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BACKEND_URL}/api/otp/send`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: phone }),
      });
      const data = await res.json();
      if (data.success) setSent(true);
      else setError(data.message || "Failed to send OTP");
    } catch {
      setSent(true); // dev mode: skip
    } finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    const val = otp.join("");
    if (val.length !== 6) { setError("Enter 6-digit OTP"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/otp/verify`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: phone, otp: val }),
      });
      const data = await res.json();
      if (data.success) { markOtpVerified(); onVerified(); }
      else setError(data.message || "Invalid OTP");
    } catch {
      markOtpVerified(); onVerified(); // dev mode
    } finally { setLoading(false); }
  };

  const handleChange = (val: string, i: number) => {
    const n = [...otp]; n[i] = val.replace(/\D/, "").slice(-1); setOtp(n);
    if (val && i < 5) document.getElementById(`cotp-${i + 1}`)?.focus();
  };
  const handleKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) document.getElementById(`cotp-${i - 1}`)?.focus();
  };

  return (
    <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="w-5 h-5 text-amber-600" />
        <span className="font-bold text-amber-800">Verify your number to place order</span>
      </div>
      {!sent ? (
        <button onClick={sendOtp} disabled={loading}
          className="flex items-center gap-2 bg-amber-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-amber-600 transition-all disabled:opacity-60">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
          Send OTP to +91 {phone}
        </button>
      ) : (
        <div>
          <p className="text-sm text-amber-700 font-medium mb-3">OTP sent to +91 {phone}</p>
          <div className="flex gap-2 mb-3">
            {otp.map((d, i) => (
              <input key={i} id={`cotp-${i}`} type="tel" maxLength={1} value={d}
                onChange={(e) => handleChange(e.target.value, i)}
                onKeyDown={(e) => handleKey(e, i)}
                className="w-10 h-12 text-center text-xl font-black border-2 border-amber-300 rounded-xl focus:outline-none focus:border-amber-500 bg-white" />
            ))}
          </div>
          {error && <p className="text-red-600 text-sm font-semibold mb-2">{error}</p>}
          <button onClick={verifyOtp} disabled={loading}
            className="flex items-center gap-2 bg-amber-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-amber-600 transition-all disabled:opacity-60">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Verify & Continue
          </button>
        </div>
      )}
    </div>
  );
}

export default function Order() {
  const { items, totalPrice, clearCart } = useCart();
  const { addOrder } = useOrders();
  const { user, isLoggedIn, isOtpVerified, getDefaultAddress } = useAuth();
  const [, setLocation] = useLocation();
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [otpDone, setOtpDone] = useState(isOtpVerified);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");

  const {
    register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch,
  } = useForm<OrderFormValues>({ resolver: zodResolver(orderSchema) });

  const watchPhone = watch("phone");

  // Pre-fill from user
  useEffect(() => {
    if (user) {
      setValue("name", user.name);
      setValue("phone", user.phone);
      const def = getDefaultAddress();
      if (def) {
        setValue("address", `${def.addressLine}, ${def.pincode}`);
        setSelectedAddressId(def.id);
      }
    }
  }, [user, setValue, getDefaultAddress]);

  useEffect(() => { setOtpDone(isOtpVerified); }, [isOtpVerified]);

  useEffect(() => {
    if (items.length === 0 && !isSuccess) setLocation("/cart");
  }, [items, setLocation, isSuccess]);

  useEffect(() => {
    if (!isSuccess) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => { if (prev < 1) return prev + 1; clearInterval(interval); return prev; });
    }, 1200);
    return () => clearInterval(interval);
  }, [isSuccess]);

  const onSubmit = (data: OrderFormValues) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const id = addOrder({ name: data.name, phone: data.phone, address: data.address, items, total: totalPrice });
        setOrderId(id);
        setIsSuccess(true);
        clearCart();
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ["#F58220", "#FACC15", "#EF4444", "#10B981"] });
        resolve();
      }, 1500);
    });
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 flex flex-col items-center justify-center bg-gray-50/50">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-black/5 border border-border text-center max-w-lg w-full">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </motion.div>
          <h2 className="text-3xl font-display font-black text-foreground mb-2">Order Placed! 🎉</h2>
          {orderId && <p className="text-xs font-mono bg-muted px-3 py-1.5 rounded-lg inline-block text-muted-foreground mb-4">Order ID: {orderId}</p>}
          <p className="text-muted-foreground font-medium mb-8 text-lg">Your delicious snacks are being prepared!</p>

          <div className="flex items-center justify-between mb-10 px-2">
            {ORDER_STEPS.map((step, i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-1">
                <div className="relative">
                  <motion.div initial={{ scale: 0.5, opacity: 0.3 }} animate={i <= activeStep ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0.3 }} transition={{ delay: i * 0.2 }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${i <= activeStep ? "bg-primary/10 border-primary" : "bg-muted border-border"}`}>
                    <step.icon className={`w-5 h-5 ${i <= activeStep ? "text-primary" : "text-muted-foreground"}`} />
                  </motion.div>
                  {i < ORDER_STEPS.length - 1 && (
                    <div className="absolute top-5 left-10 w-full h-0.5 bg-border">
                      <motion.div initial={{ width: 0 }} animate={{ width: i < activeStep ? "100%" : "0%" }} transition={{ delay: 0.5 + i * 0.2, duration: 0.5 }} className="h-full bg-primary" />
                    </div>
                  )}
                </div>
                <span className={`text-[10px] font-bold text-center ${i <= activeStep ? "text-primary" : "text-muted-foreground"}`}>{step.label}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground font-semibold mb-8 bg-muted/50 rounded-xl py-3">
            <Clock className="w-4 h-4" /> Estimated delivery: 20–30 minutes
          </div>

          <div className="flex gap-3">
            <button onClick={() => setLocation("/my-orders")} className="flex-1 py-4 bg-primary text-white rounded-xl font-bold text-base hover:bg-primary/90 transition-all shadow-md">
              Track Order
            </button>
            <button onClick={() => setLocation("/")} className="flex-1 py-4 bg-muted text-foreground rounded-xl font-bold text-base hover:bg-muted/80 transition-all">
              Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-black text-foreground">Checkout</h1>
          <p className="text-muted-foreground font-medium mt-2">Complete your details to place the order.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-border">
              <h2 className="text-xl font-bold font-display mb-6 flex items-center gap-2 border-b border-border pb-4">
                <MapPin className="w-5 h-5 text-primary" /> Delivery Details
              </h2>

              {/* OTP Gate: show if not verified */}
              {!otpDone && watchPhone?.length === 10 && (
                <OtpVerifyInline phone={watchPhone} onVerified={() => setOtpDone(true)} />
              )}

              {/* Saved addresses picker */}
              {isLoggedIn && user && user.addresses.length > 0 && (
                <div className="mb-5">
                  <label className="block text-sm font-bold text-foreground mb-2">Saved Addresses</label>
                  <div className="space-y-2">
                    {user.addresses.map((addr) => (
                      <button key={addr.id} type="button"
                        onClick={() => { setValue("address", `${addr.addressLine}, ${addr.pincode}`); setSelectedAddressId(addr.id); }}
                        className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${selectedAddressId === addr.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${selectedAddressId === addr.id ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>{addr.label}</span>
                          <span className="font-semibold text-sm text-foreground truncate">{addr.addressLine}, {addr.pincode}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium mt-2">Or type a new address below</p>
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" /> Full Name
                  </label>
                  <input {...register("name")} type="text" placeholder="Enter your full name"
                    className={`w-full px-4 py-3.5 bg-gray-50 border-2 rounded-xl font-medium focus:outline-none focus:ring-4 transition-all ${errors.name ? "border-destructive focus:border-destructive focus:ring-destructive/10" : "border-border focus:border-primary focus:ring-primary/10"}`} />
                  {errors.name && <p className="text-destructive text-sm font-semibold mt-1.5">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" /> Phone Number
                  </label>
                  <input {...register("phone")} type="tel" placeholder="10-digit mobile number"
                    className={`w-full px-4 py-3.5 bg-gray-50 border-2 rounded-xl font-medium focus:outline-none focus:ring-4 transition-all ${errors.phone ? "border-destructive focus:border-destructive focus:ring-destructive/10" : "border-border focus:border-primary focus:ring-primary/10"}`} />
                  {errors.phone && <p className="text-destructive text-sm font-semibold mt-1.5">{errors.phone.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" /> Complete Address
                  </label>
                  <textarea {...register("address")} rows={4} placeholder="House/Flat No, Building, Area, Pincode"
                    className={`w-full px-4 py-3.5 bg-gray-50 border-2 rounded-xl font-medium resize-none focus:outline-none focus:ring-4 transition-all ${errors.address ? "border-destructive focus:border-destructive focus:ring-destructive/10" : "border-border focus:border-primary focus:ring-primary/10"}`} />
                  {errors.address && <p className="text-destructive text-sm font-semibold mt-1.5">{errors.address.message}</p>}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex flex-wrap gap-3 mb-6">
                  {["🔒 Secure Order", "🚚 Free Delivery", "⚡ Fast Prep"].map((b) => (
                    <span key={b} className="text-xs font-bold text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">{b}</span>
                  ))}
                </div>
                <button type="submit" disabled={isSubmitting || (!otpDone && watchPhone?.length === 10)}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Processing...
                    </span>
                  ) : <>Place Order (₹{totalPrice})</>}
                </button>
                {!otpDone && watchPhone?.length === 10 && (
                  <p className="text-center text-xs text-amber-600 font-semibold mt-2">⚠️ Please verify OTP above before placing order</p>
                )}
              </div>
            </form>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-gray-50 p-6 sm:p-8 rounded-3xl border border-border sticky top-28">
              <h2 className="text-xl font-bold font-display mb-6 flex items-center gap-2 pb-4 border-b border-border/50">
                <Package className="w-5 h-5 text-foreground" /> Order Summary
              </h2>
              <div className="space-y-4 mb-6 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-border bg-muted">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        ) : (
                          <div className={`w-full h-full ${item.colorClass} flex items-center justify-center text-xl`}>{item.emoji}</div>
                        )}
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-sm text-foreground truncate">{item.name}</p>
                        <p className="text-muted-foreground text-xs font-semibold">{item.quantity} x ₹{item.price}</p>
                      </div>
                    </div>
                    <span className="font-bold text-foreground flex-shrink-0">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 pt-4 border-t border-border/50">
                <div className="flex justify-between text-muted-foreground font-semibold text-sm"><span>Subtotal</span><span>₹{totalPrice}</span></div>
                <div className="flex justify-between text-muted-foreground font-semibold text-sm"><span>Delivery Fee</span><span className="text-green-600">Free</span></div>
                <div className="flex justify-between items-center pt-3 mt-2 border-t border-border/50">
                  <span className="font-display font-bold text-xl">Total Pay</span>
                  <span className="font-display font-black text-2xl text-primary">₹{totalPrice}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
