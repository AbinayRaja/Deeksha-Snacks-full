import { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import { Product } from "@/data/products";

export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  totalCount: number;
  totalPrice: number;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Product }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" };

interface CartContextType extends CartState {
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function calculateTotals(items: CartItem[]) {
  return items.reduce(
    (acc, item) => ({
      totalCount: acc.totalCount + item.quantity,
      totalPrice: acc.totalPrice + item.price * item.quantity,
    }),
    { totalCount: 0, totalPrice: 0 }
  );
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItemIndex = state.items.findIndex(
        (item) => item.id === action.payload.id
      );
      
      let newItems;
      if (existingItemIndex > -1) {
        newItems = [...state.items];
        newItems[existingItemIndex].quantity += 1;
      } else {
        newItems = [...state.items, { ...action.payload, quantity: 1 }];
      }
      
      return { ...state, items: newItems, ...calculateTotals(newItems) };
    }
    case "REMOVE_ITEM": {
      const newItems = state.items.filter((item) => item.id !== action.payload);
      return { ...state, items: newItems, ...calculateTotals(newItems) };
    }
    case "UPDATE_QUANTITY": {
      if (action.payload.quantity <= 0) {
        const newItems = state.items.filter((item) => item.id !== action.payload.id);
        return { ...state, items: newItems, ...calculateTotals(newItems) };
      }
      const newItems = state.items.map((item) =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return { ...state, items: newItems, ...calculateTotals(newItems) };
    }
    case "CLEAR_CART":
      return { items: [], totalCount: 0, totalPrice: 0 };
    default:
      return state;
  }
}

const initialState: CartState = {
  items: [],
  totalCount: 0,
  totalPrice: 0,
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState, (initial) => {
    try {
      const saved = localStorage.getItem("deeksha-cart");
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...initial, ...parsed, ...calculateTotals(parsed.items || []) };
      }
    } catch (e) {
      console.error("Failed to load cart from local storage", e);
    }
    return initial;
  });

  useEffect(() => {
    localStorage.setItem("deeksha-cart", JSON.stringify(state));
  }, [state]);

  const addToCart = (product: Product) => dispatch({ type: "ADD_ITEM", payload: product });
  const removeFromCart = (id: string) => dispatch({ type: "REMOVE_ITEM", payload: id });
  const updateQuantity = (id: string, quantity: number) =>
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  const clearCart = () => dispatch({ type: "CLEAR_CART" });

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
