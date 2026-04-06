import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Plus, Pencil, Trash2, Check, Home, Briefcase, MoreHorizontal, X, Hash, User, Phone as PhoneIcon } from "lucide-react";
import { useAuth, Address } from "@/context/AuthContext";

const LABEL_ICONS: Record<string, React.ReactNode> = {
  Home: <Home className="w-4 h-4" />,
  Work: <Briefcase className="w-4 h-4" />,
  Other: <MoreHorizontal className="w-4 h-4" />,
};

const LABEL_COLORS: Record<string, string> = {
  Home: "bg-blue-100 text-blue-700 border-blue-200",
  Work: "bg-purple-100 text-purple-700 border-purple-200",
  Other: "bg-gray-100 text-gray-700 border-gray-200",
};

type FormData = {
  label: string;
  name: string;
  phone: string;
  addressLine: string;
  pincode: string;
  isDefault: boolean;
};

const emptyForm: FormData = {
  label: "Home",
  name: "",
  phone: "",
  addressLine: "",
  pincode: "",
  isDefault: false,
};

export default function AddressPage() {
  const { user, isLoggedIn, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAuth();
  const [, setLocation] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!isLoggedIn) {
    setLocation("/login");
    return null;
  }

  const addresses = user?.addresses || [];

  const openAdd = () => {
    setForm({ ...emptyForm, name: user?.name || "", phone: user?.phone || "" });
    setEditId(null);
    setError("");
    setShowForm(true);
  };

  const openEdit = (addr: Address) => {
    setForm({
      label: addr.label,
      name: addr.name,
      phone: addr.phone,
      addressLine: addr.addressLine,
      pincode: addr.pincode,
      isDefault: addr.isDefault,
    });
    setEditId(addr.id);
    setError("");
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) { setError("Name is required"); return; }
    if (!/^\d{10}$/.test(form.phone)) { setError("Enter valid 10-digit phone"); return; }
    if (!form.addressLine.trim()) { setError("Address is required"); return; }
    if (!/^\d{6}$/.test(form.pincode)) { setError("Enter valid 6-digit pincode"); return; }

    if (editId) {
      updateAddress(editId, { ...form });
    } else {
      addAddress({ ...form });
    }
    setShowForm(false);
    setEditId(null);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setTimeout(() => {
      deleteAddress(id);
      setDeletingId(null);
    }, 400);
  };

  return (
    <div className="min-h-screen pt-28 pb-20 bg-gray-50/40">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-black text-foreground">My Addresses</h1>
            <p className="text-muted-foreground font-medium mt-1">Manage your delivery locations</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-primary/25 hover:bg-primary/90 transition-all text-sm"
          >
            <Plus className="w-4 h-4" /> Add New
          </button>
        </div>

        {/* Address Cards */}
        <div className="space-y-4">
          <AnimatePresence>
            {addresses.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-white rounded-3xl border border-border"
              >
                <MapPin className="w-12 h-12 text-primary/40 mx-auto mb-4" />
                <h3 className="font-display font-bold text-lg text-foreground mb-2">No addresses yet</h3>
                <p className="text-muted-foreground text-sm font-medium mb-6">Add your first delivery address</p>
                <button
                  onClick={openAdd}
                  className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-primary/25 mx-auto hover:bg-primary/90 transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Address
                </button>
              </motion.div>
            )}

            {addresses.map((addr) => (
              <motion.div
                key={addr.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: deletingId === addr.id ? 0 : 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`bg-white rounded-2xl border-2 p-5 transition-all ${addr.isDefault ? "border-primary shadow-md shadow-primary/10" : "border-border"}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-xl border text-sm flex items-center gap-1 font-bold ${LABEL_COLORS[addr.label] || LABEL_COLORS.Other}`}>
                      {LABEL_ICONS[addr.label] || LABEL_ICONS.Other}
                      {addr.label}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-foreground">{addr.name}</p>
                        {addr.isDefault && (
                          <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3" /> Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground font-medium mt-0.5">{addr.phone}</p>
                      <p className="text-sm text-foreground font-medium mt-1 leading-relaxed">
                        {addr.addressLine}, {addr.pincode}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!addr.isDefault && (
                      <button
                        onClick={() => setDefaultAddress(addr.id)}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all text-xs font-bold"
                        title="Set as default"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => openEdit(addr)}
                      className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(addr.id)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Add/Edit Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center px-4 pb-0 sm:pb-4"
              onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}
            >
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-display font-bold">{editId ? "Edit Address" : "Add New Address"}</h3>
                    <button onClick={() => setShowForm(false)} className="p-2 hover:bg-muted rounded-xl transition-all">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Label */}
                    <div>
                      <label className="block text-sm font-bold text-foreground mb-2">Address Label</label>
                      <div className="flex gap-2">
                        {["Home", "Work", "Other"].map((lbl) => (
                          <button
                            key={lbl}
                            onClick={() => setForm({ ...form, label: lbl })}
                            className={`flex-1 py-2.5 rounded-xl font-bold text-sm border-2 transition-all flex items-center justify-center gap-1.5 ${form.label === lbl ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}
                          >
                            {LABEL_ICONS[lbl]} {lbl}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Name */}
                    <div>
                      <label className="block text-sm font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                        <User className="w-4 h-4 text-primary" /> Name *
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Receiver's name"
                        className="w-full px-4 py-3 border-2 border-border rounded-xl font-medium focus:outline-none focus:border-primary transition-all"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                        <PhoneIcon className="w-4 h-4 text-primary" /> Phone *
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/, "").slice(0, 10) })}
                        placeholder="10-digit number"
                        className="w-full px-4 py-3 border-2 border-border rounded-xl font-medium focus:outline-none focus:border-primary transition-all"
                      />
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-primary" /> Address *
                      </label>
                      <textarea
                        value={form.addressLine}
                        onChange={(e) => setForm({ ...form, addressLine: e.target.value })}
                        placeholder="House/Flat, Building, Street, Area"
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-border rounded-xl font-medium resize-none focus:outline-none focus:border-primary transition-all"
                      />
                    </div>

                    {/* Pincode + Default */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                          <Hash className="w-4 h-4 text-primary" /> Pincode *
                        </label>
                        <input
                          type="tel"
                          value={form.pincode}
                          onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/, "").slice(0, 6) })}
                          placeholder="6-digit pincode"
                          className="w-full px-4 py-3 border-2 border-border rounded-xl font-medium focus:outline-none focus:border-primary transition-all"
                        />
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer pb-3">
                          <input
                            type="checkbox"
                            checked={form.isDefault}
                            onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                            className="w-5 h-5 accent-primary rounded"
                          />
                          <span className="text-sm font-bold text-foreground">Set Default</span>
                        </label>
                      </div>
                    </div>

                    {error && <p className="text-destructive text-sm font-semibold">{error}</p>}

                    <button
                      onClick={handleSave}
                      className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-base shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all mt-2"
                    >
                      {editId ? "Update Address" : "Save Address"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
