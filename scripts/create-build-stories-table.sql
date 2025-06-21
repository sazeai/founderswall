CREATE TABLE build_stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('win', 'fail', 'hack')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  upvotes INT DEFAULT 0,
  emoji_reactions JSONB DEFAULT '{}' -- Store emoji reactions as JSON
);

-- Enable Row Level Security (RLS)
ALTER TABLE build_stories ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to insert their own stories
CREATE POLICY "Enable insert for authenticated users only" ON public.build_stories
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create policy for authenticated users to select stories
CREATE POLICY "Enable select for everyone" ON public.build_stories
AS PERMISSIVE FOR SELECT
TO public
USING (TRUE);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the update_updated_at function on update
CREATE TRIGGER update_build_stories_updated_at
BEFORE UPDATE ON build_stories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
