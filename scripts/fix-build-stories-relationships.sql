-- Fix the build_stories table relationships
-- First, let's make sure the user_id column exists and has proper constraints

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
    -- Check if foreign key constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'build_stories_user_id_fkey' 
        AND table_name = 'build_stories'
    ) THEN
        -- Add the foreign key constraint
        ALTER TABLE build_stories 
        ADD CONSTRAINT build_stories_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES mugshots(user_id);
        
        RAISE NOTICE 'Added foreign key constraint build_stories_user_id_fkey';
    ELSE
        RAISE NOTICE 'Foreign key constraint build_stories_user_id_fkey already exists';
    END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_build_stories_user_id ON build_stories(user_id);
CREATE INDEX IF NOT EXISTS idx_build_stories_slug ON build_stories(slug);
CREATE INDEX IF NOT EXISTS idx_build_stories_created_at ON build_stories(created_at);

-- Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'build_stories' 
ORDER BY ordinal_position;
