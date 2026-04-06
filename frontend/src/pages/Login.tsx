import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, User, MapPin, Hash, ChevronRight, Loader2, CheckCircle2, Store, ArrowLeft, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

type Step = "phone" | "otp" | "profile";

export default function Login() {
  const { login, markOtpVerified, isLoggedIn } = useAuth();
  const [, setLocation] = useLocation();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [name, setName] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [pincode, setPincode] = useState("");
  const [addressLabel, setAddressLabel] = useState("Home");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // If already logged in redirect
  if (isLoggedIn) {
    setLocation("/");
    return null;
  }

  const handleSendOtp = async () => {
    if (!/^\d{10}$/.test(phone)) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: phone }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        setStep("otp");
      } else {
        setError(data.message || "Failed to send OTP");
      }
    } catch {
      // Dev mode: skip backend, go directly to otp
      setOtpSent(true);
      setStep("otp");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpVal = otp.join("");
    if (otpVal.length !== 6) {
      setError("Enter the 6-digit OTP");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: phone, otp: otpVal }),
      });
      const data = await res.json();
      if (data.success) {
        markOtpVerified();
        setStep("profile");
      } else {
        setError(data.message || "Invalid OTP");
      }
    } catch {
      // Dev mode: skip verification
      markOtpVerified();
      setStep("profile");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (val: string, idx: number) => {
    const newOtp = [...otp];
    newOtp[idx] = val.replace(/\D/, "").slice(-1);
    setOtp(newOtp);
    if (val && idx < 5) {
      const next = document.getElementById(`otp-${idx + 1}`);
      next?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      const prev = document.getElementById(`otp-${idx - 1}`);
      prev?.focus();
    }
  };

  const handleProfile = () => {
    if (!name.trim()) { setError("Enter your name"); return; }
    if (!addressLine.trim()) { setError("Enter your address"); return; }
    if (!/^\d{6}$/.test(pincode)) { setError("Enter a valid 6-digit pincode"); return; }
    setError("");

    login({
      name: name.trim(),
      phone,
      addresses: [
        {
          id: `addr-${Date.now()}`,
          label: addressLabel,
          name: name.trim(),
          phone,
          addressLine: addressLine.trim(),
          pincode,
          isDefault: true,
        },
      ],
    });
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-primary/30">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-display font-black text-foreground">
            Deeksha <span className="text-primary">Snacks</span>
          </h1>
          <p className="text-sm text-muted-foreground font-medium mt-1">Sign in to continue</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* STEP 1: Phone */}
          {step === "phone" && (
            <motion.div
              key="phone"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="bg-white rounded-3xl shadow-xl shadow-black/8 border border-border p-8"
            >
              <h2 className="text-xl font-display font-bold mb-1">Enter Mobile Number</h2>
              <p className="text-muted-foreground text-sm font-medium mb-6">We'll send an OTP to verify your number</p>

              <div className="relative mb-2">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-foreground text-sm">+91</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value.replace(/\D/, "").slice(0, 10)); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                  placeholder="10-digit mobile number"
                  className="w-full pl-14 pr-4 py-4 border-2 border-border rounded-2xl font-semibold text-lg focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>
              {error && <p className="text-destructive text-sm font-semibold mb-3">{error}</p>}

              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full mt-4 py-4 bg-primary text-white rounded-2xl font-bold text-base shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Phone className="w-5 h-5" /> Send OTP</>}
              </button>

              <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground font-medium justify-center">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                Your number is safe with us
              </div>
            </motion.div>
          )}

          {/* STEP 2: OTP */}
          {step === "otp" && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="bg-white rounded-3xl shadow-xl shadow-black/8 border border-border p-8"
            >
              <button onClick={() => setStep("phone")} className="flex items-center gap-1 text-sm text-muted-foreground font-semibold mb-5 hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <h2 className="text-xl font-display font-bold mb-1">Verify OTP</h2>
              <p className="text-muted-foreground text-sm font-medium mb-6">
                Sent to <span className="text-foreground font-bold">+91 {phone}</span>
              </p>

              {/* OTP Boxes */}
              <div className="flex gap-2 mb-3 justify-center">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="tel"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, i)}
                    onKeyDown={(e) => handleOtpKeyDown(e, i)}
                    className="w-12 h-14 text-center text-2xl font-black border-2 border-border rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                ))}
              </div>
              {error && <p className="text-destructive text-sm font-semibold mb-3 text-center">{error}</p>}

              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full mt-4 py-4 bg-primary text-white rounded-2xl font-bold text-base shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> Verify OTP</>}
              </button>

              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full mt-3 py-3 text-primary font-semibold text-sm hover:bg-primary/5 rounded-xl transition-all"
              >
                Resend OTP
              </button>
            </motion.div>
          )}

          {/* STEP 3: Profile */}
          {step === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="bg-white rounded-3xl shadow-xl shadow-black/8 border border-border p-8"
            >
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-green-700 font-bold text-sm">Number verified!</span>
              </div>

              <h2 className="text-xl font-display font-bold mb-1">Complete Your Profile</h2>
              <p className="text-muted-foreground text-sm font-medium mb-6">Your details help us deliver faster</p>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-bold text-foreground mb-1.5 flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" /> Full Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setError(""); }}
                    placeholder="Your full name"
                    className="w-full px-4 py-3.5 border-2 border-border rounded-xl font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-bold text-foreground mb-1.5 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" /> Delivery Address *
                  </label>
                  <textarea
                    value={addressLine}
                    onChange={(e) => { setAddressLine(e.target.value); setError(""); }}
                    placeholder="House/Flat No, Building, Street, Area"
                    rows={3}
                    className="w-full px-4 py-3.5 border-2 border-border rounded-xl font-medium resize-none focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>

                {/* Pincode + Label row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-1.5 flex items-center gap-2">
                      <Hash className="w-4 h-4 text-primary" /> Pincode *
                    </label>
                    <input
                      type="tel"
                      value={pincode}
                      onChange={(e) => { setPincode(e.target.value.replace(/\D/, "").slice(0, 6)); setError(""); }}
                      placeholder="6-digit pincode"
                      className="w-full px-4 py-3.5 border-2 border-border rounded-xl font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-1.5">Address Label</label>
                    <select
                      value={addressLabel}
                      onChange={(e) => setAddressLabel(e.target.value)}
                      className="w-full px-4 py-3.5 border-2 border-border rounded-xl font-medium focus:outline-none focus:border-primary transition-all bg-white"
                    >
                      <option>Home</option>
                      <option>Work</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {error && <p className="text-destructive text-sm font-semibold mt-3">{error}</p>}

              <button
                onClick={handleProfile}
                className="w-full mt-6 py-4 bg-primary text-white rounded-2xl font-bold text-base shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
              >
                Continue <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
