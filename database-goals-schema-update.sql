-- ==================================================
-- SAVING GOALS SCHEMA UPDATE
-- Add missing fields to support full goals functionality
-- ==================================================

-- Add missing columns to saving_goals table
ALTER TABLE saving_goals 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id),
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('active', 'paused', 'completed', 'cancelled')) DEFAULT 'active';

-- Create index for category_id foreign key
CREATE INDEX IF NOT EXISTS idx_saving_goals_category_id ON saving_goals(category_id);

-- Add index for status filtering
CREATE INDEX IF NOT EXISTS idx_saving_goals_status ON saving_goals(status);

-- Update existing goals to have 'active' status if null
UPDATE saving_goals SET status = 'active' WHERE status IS NULL;

-- Verify the schema update
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'saving_goals' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ==================================================
-- SCHEMA UPDATE COMPLETE
-- ==================================================

-- This update provides:
-- ✅ Description field for goal details
-- ✅ Category association (optional)
-- ✅ Status management (active, paused, completed, cancelled)
-- ✅ Proper indexes for performance
-- ✅ Backward compatibility with existing data