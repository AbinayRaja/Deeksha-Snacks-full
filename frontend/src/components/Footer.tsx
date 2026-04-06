import { Store, Heart, Instagram, MessageCircle, ArrowUp } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="bg-card border-t border-border/50 pt-12 pb-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary/10 text-primary p-2 rounded-xl">
                <Store className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-display font-black text-foreground">
                Deeksha <span className="text-primary">Snacks</span>
              </h2>
            </div>
            <p className="text-muted-foreground font-medium text-sm max-w-xs leading-relaxed">
              Serving the freshest, crunchiest, and most delicious pocket-friendly snacks to satisfy your cravings.
            </p>
            {/* Social */}
            <div className="flex gap-3 mt-5">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                aria-label="Instagram"
              >
                {/* <Instagram className="w-4 h-4" /> */}
              </a>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 bg-green-100 text-green-600 rounded-xl flex items-center justify-center hover:bg-green-500 hover:text-white transition-all"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-display font-bold text-foreground mb-4 text-sm uppercase tracking-widest">Quick Links</h3>
            <nav className="flex flex-col gap-2">
              {[
                { href: "/", label: "Home" },
                { href: "/products", label: "Our Menu" },
                { href: "/cart", label: "Cart" },
                { href: "/contact", label: "Contact Us" },
              ].map((link) => (
                <Link key={link.href} href={link.href} className="text-muted-foreground font-semibold text-sm hover:text-primary transition-colors w-fit">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Hours */}
          <div>
            <h3 className="font-display font-bold text-foreground mb-4 text-sm uppercase tracking-widest">Business Hours</h3>
            <div className="space-y-2 text-sm">
              {[
                { day: "Mon – Fri", time: "9:00 AM – 9:00 PM" },
                { day: "Saturday", time: "9:00 AM – 9:00 PM" },
                { day: "Sunday", time: "10:00 AM – 7:00 PM" },
              ].map((row) => (
                <div key={row.day} className="flex justify-between gap-4">
                  <span className="font-semibold text-foreground">{row.day}</span>
                  <span className="text-muted-foreground">{row.time}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 px-3 py-2 rounded-xl w-fit">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Open Now
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p className="font-semibold flex items-center gap-1.5">
            © {new Date().getFullYear()} Deeksha Snacks · Made with{" "}
            <Heart className="w-4 h-4 text-accent fill-accent animate-pulse" /> for snack lovers
          </p>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 font-bold hover:text-primary transition-colors group"
          >
            Back to top <ArrowUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>
      </div>
    </footer>
  );
}