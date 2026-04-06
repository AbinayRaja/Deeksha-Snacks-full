import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Address {
  id: string;
  label: string; // "Home", "Work", "Other"
  name: string;
  phone: string;
  addressLine: string;
  pincode: string;
  isDefault: boolean;
}

export interface User {
  name: string;
  phone: string;
  addresses: Address[];
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isOtpVerified: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  addAddress: (address: Omit<Address, "id">) => string;
  updateAddress: (id: string, address: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  getDefaultAddress: () => Address | null;
  markOtpVerified: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_KEY = "deeksha-auth";
const OTP_KEY = "deeksha-otp-session";

function loadAuth(): User | null {
  try {
    const saved = localStorage.getItem(AUTH_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return null;
}

function loadOtpVerified(): boolean {
  try {
    const saved = sessionStorage.getItem(OTP_KEY);
    return saved === "true";
  } catch (e) {}
  return false;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadAuth);
  const [isOtpVerified, setIsOtpVerified] = useState<boolean>(loadOtpVerified);

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  }, [user]);

  const login = (newUser: User) => {
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
    setIsOtpVerified(false);
    sessionStorage.removeItem(OTP_KEY);
  };

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const markOtpVerified = () => {
    setIsOtpVerified(true);
    sessionStorage.setItem(OTP_KEY, "true");
  };

  const addAddress = (address: Omit<Address, "id">): string => {
    const id = `addr-${Date.now()}`;
    setUser((prev) => {
      if (!prev) return prev;
      const newAddr: Address = { ...address, id };
      const addresses =
        address.isDefault
          ? [...prev.addresses.map((a) => ({ ...a, isDefault: false })), newAddr]
          : [...prev.addresses, newAddr];
      return { ...prev, addresses };
    });
    return id;
  };

  const updateAddress = (id: string, updates: Partial<Address>) => {
    setUser((prev) => {
      if (!prev) return prev;
      let addresses = prev.addresses.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      );
      if (updates.isDefault) {
        addresses = addresses.map((a) =>
          a.id !== id ? { ...a, isDefault: false } : a
        );
      }
      return { ...prev, addresses };
    });
  };

  const deleteAddress = (id: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      return { ...prev, addresses: prev.addresses.filter((a) => a.id !== id) };
    });
  };

  const setDefaultAddress = (id: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      const addresses = prev.addresses.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }));
      return { ...prev, addresses };
    });
  };

  const getDefaultAddress = (): Address | null => {
    if (!user) return null;
    return user.addresses.find((a) => a.isDefault) || user.addresses[0] || null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isOtpVerified,
        login,
        logout,
        updateUser,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        getDefaultAddress,
        markOtpVerified,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
