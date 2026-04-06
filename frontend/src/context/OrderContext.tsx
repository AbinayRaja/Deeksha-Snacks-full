import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CartItem } from "@/context/CartContext";

export type OrderStatus = "Pending" | "Preparing" | "Out for Delivery" | "Delivered" | "Cancelled";

export interface Order {
  id: string;
  name: string;
  phone: string;
  address: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
}

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, "id" | "createdAt" | "status">) => string;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  deleteOrder: (id: string) => void;
  totalRevenue: number;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);
const STORAGE_KEY = "deeksha-orders";

function loadOrders(): Order[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return [];
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(loadOrders);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  const addOrder = (order: Omit<Order, "id" | "createdAt" | "status">): string => {
    const id = `ORD-${Date.now()}`;
    const newOrder: Order = {
      ...order,
      id,
      createdAt: new Date().toISOString(),
      status: "Pending",
    };
    setOrders((prev) => [newOrder, ...prev]);
    return id;
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
  };

  const deleteOrder = (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  const totalRevenue = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus, deleteOrder, totalRevenue }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrders must be used within OrderProvider");
  return ctx;
}
