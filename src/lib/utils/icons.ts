import {
  Utensils,
  Car,
  ShoppingBag,
  Film,
  Receipt,
  Heart,
  Plane,
  Book,
  Home,
  User,
  Banknote,
  Briefcase,
  TrendingUp,
  Building,
  PlusCircle,
  Wallet,
  CreditCard,
  Gift,
  Coffee,
  Gamepad2,
  Music,
  Dumbbell,
  Fuel,
  ShoppingCart,
  Shirt,
  Smartphone,
  Laptop,
  Camera,
  Headphones,
  DollarSign,
  PiggyBank,
  Coins,
  type LucideIcon,
} from 'lucide-react'

// Map of icon names to Lucide components (kebab-case keys)
export const iconMap: Record<string, LucideIcon> = {
  // Expense categories
  utensils: Utensils,
  car: Car,
  'shopping-bag': ShoppingBag,
  film: Film,
  receipt: Receipt,
  heart: Heart,
  plane: Plane,
  book: Book,
  home: Home,
  user: User,
  wallet: Wallet,
  'credit-card': CreditCard,
  gift: Gift,
  coffee: Coffee,
  gamepad2: Gamepad2,
  music: Music,
  dumbbell: Dumbbell,
  fuel: Fuel,
  'shopping-cart': ShoppingCart,
  shirt: Shirt,
  smartphone: Smartphone,
  laptop: Laptop,
  camera: Camera,
  headphones: Headphones,
  
  // Income categories
  banknote: Banknote,
  briefcase: Briefcase,
  'trending-up': TrendingUp,
  building: Building,
  'plus-circle': PlusCircle,
  'dollar-sign': DollarSign,
  'piggy-bank': PiggyBank,
  coins: Coins,
}

// Map of PascalCase icon names to Lucide components (for component-based usage)
export const iconComponentMap: Record<string, LucideIcon> = {
  // Expense categories
  Utensils,
  Car,
  ShoppingBag,
  Film,
  Receipt,
  Heart,
  Plane,
  Book,
  Home,
  User,
  Wallet,
  CreditCard,
  Gift,
  Coffee,
  Gamepad2,
  Music,
  Dumbbell,
  Fuel,
  ShoppingCart,
  Shirt,
  Smartphone,
  Laptop,
  Camera,
  Headphones,
  
  // Income categories
  Banknote,
  Briefcase,
  TrendingUp,
  Building,
  PlusCircle,
  DollarSign,
  PiggyBank,
  Coins,
}

export function getIcon(iconName: string | null): LucideIcon {
  if (!iconName) return ShoppingCart // Default icon
  
  // Try PascalCase first (component format)
  if (iconComponentMap[iconName]) {
    return iconComponentMap[iconName]
  }
  
  // Try kebab-case (legacy format)
  if (iconMap[iconName]) {
    return iconMap[iconName]
  }
  
  return ShoppingCart // Default fallback
}

// Predefined category icons for selection (kebab-case format)
export const categoryIcons = [
  { name: 'utensils', label: 'Food & Dining' },
  { name: 'car', label: 'Transportation' },
  { name: 'shopping-bag', label: 'Shopping' },
  { name: 'film', label: 'Entertainment' },
  { name: 'receipt', label: 'Bills & Utilities' },
  { name: 'heart', label: 'Health & Fitness' },
  { name: 'plane', label: 'Travel' },
  { name: 'book', label: 'Education' },
  { name: 'home', label: 'Home & Garden' },
  { name: 'user', label: 'Personal Care' },
  { name: 'coffee', label: 'Coffee & Tea' },
  { name: 'gamepad2', label: 'Gaming' },
  { name: 'music', label: 'Music & Audio' },
  { name: 'dumbbell', label: 'Fitness' },
  { name: 'fuel', label: 'Fuel & Gas' },
  { name: 'shirt', label: 'Clothing' },
  { name: 'smartphone', label: 'Technology' },
  { name: 'banknote', label: 'Salary' },
  { name: 'briefcase', label: 'Freelance' },
  { name: 'trending-up', label: 'Investment' },
  { name: 'building', label: 'Business' },
  { name: 'dollar-sign', label: 'Income' },
  { name: 'piggy-bank', label: 'Savings' },
  { name: 'coins', label: 'Cash' },
  { name: 'plus-circle', label: 'Other' },
]

// Available icons for CategoryForm (PascalCase format with components)
export const AVAILABLE_ICONS = [
  // Expense categories
  { name: 'Utensils', label: 'Food & Dining', component: Utensils },
  { name: 'Car', label: 'Transportation', component: Car },
  { name: 'ShoppingBag', label: 'Shopping', component: ShoppingBag },
  { name: 'ShoppingCart', label: 'Grocery', component: ShoppingCart },
  { name: 'Film', label: 'Entertainment', component: Film },
  { name: 'Receipt', label: 'Bills & Utilities', component: Receipt },
  { name: 'Heart', label: 'Health & Fitness', component: Heart },
  { name: 'Plane', label: 'Travel', component: Plane },
  { name: 'Book', label: 'Education', component: Book },
  { name: 'Home', label: 'Home & Garden', component: Home },
  { name: 'User', label: 'Personal Care', component: User },
  { name: 'Coffee', label: 'Coffee & Tea', component: Coffee },
  { name: 'Gamepad2', label: 'Gaming', component: Gamepad2 },
  { name: 'Music', label: 'Music & Audio', component: Music },
  { name: 'Dumbbell', label: 'Fitness', component: Dumbbell },
  { name: 'Fuel', label: 'Fuel & Gas', component: Fuel },
  { name: 'Shirt', label: 'Clothing', component: Shirt },
  { name: 'Smartphone', label: 'Technology', component: Smartphone },
  { name: 'Laptop', label: 'Electronics', component: Laptop },
  { name: 'Camera', label: 'Photography', component: Camera },
  { name: 'Headphones', label: 'Audio', component: Headphones },
  { name: 'Wallet', label: 'Personal Finance', component: Wallet },
  { name: 'CreditCard', label: 'Credit Card', component: CreditCard },
  { name: 'Gift', label: 'Gifts', component: Gift },
  
  // Income categories
  { name: 'DollarSign', label: 'Income', component: DollarSign },
  { name: 'Banknote', label: 'Salary', component: Banknote },
  { name: 'Briefcase', label: 'Freelance', component: Briefcase },
  { name: 'TrendingUp', label: 'Investment', component: TrendingUp },
  { name: 'Building', label: 'Business', component: Building },
  { name: 'PiggyBank', label: 'Savings', component: PiggyBank },
  { name: 'Coins', label: 'Cash', component: Coins },
  { name: 'PlusCircle', label: 'Other', component: PlusCircle },
]