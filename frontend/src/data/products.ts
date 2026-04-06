export type Category = "Pocket Snacks" | "Biscuits" | "Varuki" | "Nuts";

export interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;
  emoji: string;
  image: string;
  colorClass: string;
  textColorClass: string;
}

export const PRODUCTS: Product[] = [
  {
    id: "ps-1",
    name: "Masala Pocket Snack",
    price: 20,
    category: "Pocket Snacks",
    emoji: "🌶️",
    image: "https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400&h=300&fit=crop",
    colorClass: "bg-red-100",
    textColorClass: "text-red-600",
  },
  {
    id: "ps-2",
    name: "Spicy Chips Pocket Pack",
    price: 20,
    category: "Pocket Snacks",
    emoji: "🥔",
    image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=300&fit=crop",
    colorClass: "bg-yellow-100",
    textColorClass: "text-yellow-600",
  },
  {
    id: "ps-3",
    name: "Tangy Puffed Rice Pack",
    price: 20,
    category: "Pocket Snacks",
    emoji: "🍚",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop",
    colorClass: "bg-orange-100",
    textColorClass: "text-orange-600",
  },
  {
    id: "b-1",
    name: "Parle-G Biscuits",
    price: 10,
    category: "Biscuits",
    emoji: "🍪",
    image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop",
    colorClass: "bg-amber-100",
    textColorClass: "text-amber-600",
  },
  {
    id: "b-2",
    name: "Britannia Marie Gold",
    price: 25,
    category: "Biscuits",
    emoji: "🫓",
    image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=300&fit=crop",
    colorClass: "bg-yellow-50",
    textColorClass: "text-yellow-500",
  },
  {
    id: "b-3",
    name: "Cream Cracker Biscuits",
    price: 30,
    category: "Biscuits",
    emoji: "🍘",
    image: "https://images.unsplash.com/photo-1506459225024-1428097a7e18?w=400&h=300&fit=crop",
    colorClass: "bg-stone-100",
    textColorClass: "text-stone-600",
  },
  {
    id: "b-4",
    name: "Oreo Biscuits",
    price: 30,
    category: "Biscuits",
    emoji: "🍩",
    image: "https://images.unsplash.com/photo-1571506165871-ee72a35bc9d4?w=400&h=300&fit=crop",
    colorClass: "bg-zinc-200",
    textColorClass: "text-zinc-700",
  },
  {
    id: "v-1",
    name: "Classic Varuki",
    price: 40,
    category: "Varuki",
    emoji: "🥨",
    image: "https://images.unsplash.com/photo-1570197571499-166b36435e9f?w=400&h=300&fit=crop",
    colorClass: "bg-orange-100",
    textColorClass: "text-orange-700",
  },
  {
    id: "v-2",
    name: "Spicy Varuki Mix",
    price: 50,
    category: "Varuki",
    emoji: "🔥",
    image: "https://images.unsplash.com/photo-1606914501449-5a96b6ce24ca?w=400&h=300&fit=crop",
    colorClass: "bg-red-100",
    textColorClass: "text-red-500",
  },
  {
    id: "v-3",
    name: "Masala Varuki",
    price: 45,
    category: "Varuki",
    emoji: "🌿",
    image: "https://images.unsplash.com/photo-1567360425852-ad9ee6572087?w=400&h=300&fit=crop",
    colorClass: "bg-green-100",
    textColorClass: "text-green-600",
  },
  {
    id: "n-1",
    name: "Salted Peanuts",
    price: 30,
    category: "Nuts",
    emoji: "🥜",
    image: "https://images.unsplash.com/photo-1567892737950-30c4db37cd89?w=400&h=300&fit=crop",
    colorClass: "bg-amber-100",
    textColorClass: "text-amber-700",
  },
  {
    id: "n-2",
    name: "Cashew Mix",
    price: 80,
    category: "Nuts",
    emoji: "🌰",
    image: "https://images.unsplash.com/photo-1604397549594-f36cf4cd94df?w=400&h=300&fit=crop",
    colorClass: "bg-stone-200",
    textColorClass: "text-stone-600",
  },
  {
    id: "n-3",
    name: "Roasted Almonds",
    price: 120,
    category: "Nuts",
    emoji: "🧉",
    image: "https://images.unsplash.com/photo-1574570173583-e0872e0651e2?w=400&h=300&fit=crop",
    colorClass: "bg-orange-200",
    textColorClass: "text-orange-800",
  },
  {
    id: "n-4",
    name: "Mixed Dry Fruits",
    price: 150,
    category: "Nuts",
    emoji: "🍯",
    image: "https://images.unsplash.com/photo-1546548970-71785318a17b?w=400&h=300&fit=crop",
    colorClass: "bg-yellow-200",
    textColorClass: "text-yellow-800",
  },
];

export const CATEGORIES: Category[] = ["Pocket Snacks", "Biscuits", "Varuki", "Nuts"];
