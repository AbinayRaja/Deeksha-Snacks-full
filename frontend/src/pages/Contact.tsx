import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Send, MessageCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast({
      title: "Message Sent! 🎉",
      description: "We've received your message and will get back to you within 24 hours.",
    });
    setFormData({ name: "", email: "", message: "" });
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background">
      {/* Header */}
      <div className="bg-primary/5 py-12 mb-12 border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-primary font-bold text-sm uppercase tracking-widest">
            We're here to help
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-display font-black text-foreground mt-1 mb-4"
          >
            Get In Touch
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground font-medium text-lg max-w-2xl mx-auto"
          >
            Have questions about your order, our snacks, or anything else? We'd love to hear from you!
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {[
            {
              icon: MapPin,
              title: "Address",
              content: "123 Snack Street, Banjara Hills, Hyderabad - 500034",
              color: "bg-primary/10 text-primary",
              action: null,
            },
            {
              icon: Phone,
              title: "Phone",
              content: "+91 98765 43210",
              color: "bg-secondary/20 text-secondary-foreground",
              action: "tel:+919876543210",
            },
            {
              icon: Mail,
              title: "Email",
              content: "hello@deekshasnacks.com",
              color: "bg-accent/10 text-accent",
              action: "mailto:hello@deekshasnacks.com",
            },
            {
              icon: Clock,
              title: "Working Hours",
              content: "Mon–Sat: 9AM – 9PM\nSunday: 10AM – 7PM",
              color: "bg-green-100 text-green-600",
              action: null,
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              className="bg-card p-6 rounded-3xl border border-border shadow-sm text-center flex flex-col items-center group hover:border-primary/30 hover:shadow-md transition-all"
            >
              <div className={`w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg mb-2">{item.title}</h3>
              {item.action ? (
                <a href={item.action} className="text-muted-foreground font-medium text-sm hover:text-primary transition-colors">
                  {item.content}
                </a>
              ) : (
                <p className="text-muted-foreground font-medium text-sm whitespace-pre-line">{item.content}</p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Form + WhatsApp */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="text-3xl font-display font-black mb-6">Send us a message</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-bold mb-2">Your Name</label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-5 py-4 bg-white border-2 border-border rounded-2xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-bold mb-2">Email Address</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-5 py-4 bg-white border-2 border-border rounded-2xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-bold mb-2">Message</label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-5 py-4 bg-white border-2 border-border rounded-2xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium resize-none"
                  placeholder="How can we help you?"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-70"
              >
                {submitting ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : <Send className="w-5 h-5" />}
                {submitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col gap-6"
          >
            {/* WhatsApp CTA */}
            <div className="bg-green-50 border-2 border-green-200 rounded-3xl p-8 text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-display font-bold mb-2">Chat on WhatsApp</h3>
              <p className="text-muted-foreground font-medium mb-5 text-sm">
                Get instant replies! Message us on WhatsApp for quick order support.
              </p>
              <a
                href="https://wa.me/919876543210?text=Hi! I have a question about Deeksha Snacks"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-all shadow-md"
              >
                <MessageCircle className="w-5 h-5" /> Open WhatsApp
              </a>
            </div>

            {/* Visit store */}
            <div className="bg-card rounded-3xl border border-border p-8 flex flex-col justify-center text-center items-center flex-1">
              <span className="text-5xl mb-4">🏪</span>
              <h3 className="text-xl font-display font-bold mb-3">Visit Our Store</h3>
              <p className="text-muted-foreground font-medium text-sm">
                Come visit us for fresh snacks daily! Experience the aroma of freshly made treats.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {["Mon–Sat", "9AM–9PM", "Free Tasting!"].map((tag) => (
                  <span key={tag} className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}