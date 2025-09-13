-- ==================================================
-- FINTECH APP - COMPLETE DATABASE SCHEMA
-- Final consolidated version with all fixes applied
-- ==================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================================================
-- TABLES
-- ==================================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY,  -- References auth.users(id) but no FK constraint to avoid trigger issues
  full_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories for income and expenses
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  color TEXT DEFAULT '#6366f1',
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financial transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  amount DECIMAL(12,2) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budget management
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  amount DECIMAL(12,2) NOT NULL,
  period TEXT CHECK (period IN ('monthly', 'weekly', 'yearly')) DEFAULT 'monthly',
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saving goals tracking
CREATE TABLE IF NOT EXISTS saving_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount DECIMAL(12,2) NOT NULL,
  current_amount DECIMAL(12,2) DEFAULT 0,
  target_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================================================
-- ROW LEVEL SECURITY (RLS)
-- ==================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE saving_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only access their own data
CREATE POLICY "Users can manage own profile" ON user_profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage own categories" ON categories
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own transactions" ON transactions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own budgets" ON budgets
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own goals" ON saving_goals
  FOR ALL USING (auth.uid() = user_id);

-- ==================================================
-- PERFORMANCE INDEXES
-- ==================================================

-- Transaction indexes (most queried table)
CREATE INDEX IF NOT EXISTS idx_transactions_user_id_date ON transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type_date ON transactions(user_id, type, date DESC);

-- Category indexes
CREATE INDEX IF NOT EXISTS idx_categories_user_id_type ON categories(user_id, type);

-- Budget indexes
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id_period ON budgets(user_id, period);

-- Saving goals indexes
CREATE INDEX IF NOT EXISTS idx_saving_goals_user_id ON saving_goals(user_id);

-- ==================================================
-- UTILITY FUNCTIONS
-- ==================================================

-- Function for auto-updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to create default categories for new users
CREATE OR REPLACE FUNCTION create_default_categories_for_user(user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Default expense categories with modern icons and colors
  INSERT INTO categories (user_id, name, type, color, icon) VALUES
    (user_id, 'Food & Dining', 'expense', '#ef4444', 'utensils'),
    (user_id, 'Transportation', 'expense', '#3b82f6', 'car'),
    (user_id, 'Shopping', 'expense', '#f59e0b', 'shopping-bag'),
    (user_id, 'Entertainment', 'expense', '#8b5cf6', 'film'),
    (user_id, 'Bills & Utilities', 'expense', '#10b981', 'receipt'),
    (user_id, 'Health & Fitness', 'expense', '#06b6d4', 'heart'),
    (user_id, 'Travel', 'expense', '#f97316', 'plane'),
    (user_id, 'Education', 'expense', '#6366f1', 'book'),
    (user_id, 'Home & Garden', 'expense', '#84cc16', 'home'),
    (user_id, 'Personal Care', 'expense', '#ec4899', 'user');
  
  -- Default income categories
  INSERT INTO categories (user_id, name, type, color, icon) VALUES
    (user_id, 'Salary', 'income', '#22c55e', 'banknote'),
    (user_id, 'Freelance', 'income', '#84cc16', 'briefcase'),
    (user_id, 'Investment', 'income', '#14b8a6', 'trending-up'),
    (user_id, 'Business', 'income', '#f59e0b', 'building'),
    (user_id, 'Other Income', 'income', '#a855f7', 'plus-circle');
    
EXCEPTION
  WHEN others THEN
    -- If categories already exist for user, ignore the error
    RAISE LOG 'Categories already exist for user %: %', user_id, SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================================================
-- AUTO-UPDATE TRIGGERS
-- ==================================================

-- Triggers for auto-updating updated_at columns
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at 
  BEFORE UPDATE ON transactions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at 
  BEFORE UPDATE ON budgets 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saving_goals_updated_at 
  BEFORE UPDATE ON saving_goals 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================================================
-- USER REGISTRATION AUTOMATION
-- ==================================================

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Insert user profile with robust error handling
  BEGIN
    INSERT INTO public.user_profiles (id, full_name, created_at, updated_at)
    VALUES (
      NEW.id, 
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'New User'),
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;
    
    RAISE LOG 'User profile created successfully for: %', NEW.id;
  EXCEPTION
    WHEN others THEN
      RAISE LOG 'Error creating user profile for %: %', NEW.id, SQLERRM;
      -- Continue anyway, don't block user creation
  END;
  
  -- Create default categories for new user
  BEGIN
    PERFORM create_default_categories_for_user(NEW.id);
    RAISE LOG 'Default categories created for user: %', NEW.id;
  EXCEPTION
    WHEN others THEN
      RAISE LOG 'Error creating categories for %: %', NEW.id, SQLERRM;
      -- Continue anyway
  END;
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Final safety net - log error but don't fail user creation
    RAISE WARNING 'Critical error in handle_new_user for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the user registration trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==================================================
-- DATA MIGRATION & CLEANUP
-- ==================================================

-- Create user profiles for existing users (if any)
INSERT INTO public.user_profiles (id, full_name, created_at, updated_at)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'full_name', email, 'Existing User') as full_name,
  created_at,
  created_at
FROM auth.users 
WHERE id NOT IN (SELECT id FROM public.user_profiles)
ON CONFLICT (id) DO NOTHING;

-- Create default categories for existing users who don't have them
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT up.id 
    FROM public.user_profiles up
    LEFT JOIN public.categories c ON up.id = c.user_id
    WHERE c.user_id IS NULL
  LOOP
    PERFORM create_default_categories_for_user(user_record.id);
  END LOOP;
END $$;

-- ==================================================
-- VERIFICATION QUERIES
-- ==================================================

-- Verify triggers are active
SELECT 
  tgname as trigger_name,
  tgenabled as enabled,
  tgrelid::regclass as table_name
FROM pg_trigger 
WHERE tgname IN ('on_auth_user_created', 'update_user_profiles_updated_at', 'update_transactions_updated_at')
ORDER BY tgname;

-- Verify RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ==================================================
-- SCHEMA COMPLETE
-- ==================================================

-- This schema provides:
-- ✅ Complete table structure for fintech app
-- ✅ Row Level Security for data protection  
-- ✅ Performance indexes for fast queries
-- ✅ Automatic user profile and category creation
-- ✅ Robust error handling in all triggers
-- ✅ Updated timestamp automation
-- ✅ Data migration for existing users
-- ✅ Verification queries for troubleshooting

-- Ready for Phase 2 development!