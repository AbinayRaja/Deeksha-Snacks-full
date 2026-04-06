import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { PRODUCTS, CATEGORIES, Product, Category } from "@/data/products";

export interface ManagedProduct extends Product {}

interface ProductContextType {
  products: ManagedProduct[];
  categories: Category[];
  addProduct: (product: Omit<ManagedProduct, "id">) => void;
  updateProduct: (id: string, updates: Partial<ManagedProduct>) => void;
  deleteProduct: (id: string) => void;
  resetToDefaults: () => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const STORAGE_KEY = "deeksha-products";

function loadProducts(): ManagedProduct[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return PRODUCTS;
}

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<ManagedProduct[]>(loadProducts);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  const addProduct = (product: Omit<ManagedProduct, "id">) => {
    const newProduct: ManagedProduct = {
      ...product,
      id: `custom-${Date.now()}`,
    };
    setProducts((prev) => [...prev, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<ManagedProduct>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const resetToDefaults = () => {
    setProducts(PRODUCTS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(PRODUCTS));
  };

  return (
    <ProductContext.Provider
      value={{ products, categories: CATEGORIES, addProduct, updateProduct, deleteProduct, resetToDefaults }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProducts must be used within ProductProvider");
  return ctx;
}
