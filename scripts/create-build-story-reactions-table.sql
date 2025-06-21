-- Create build_story_reactions table for emoji reactions
CREATE TABLE build_story_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES build_stories(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  emoji VARCHAR(10) NOT NULL, -- Store emoji character
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one reaction per user per story per emoji
  UNIQUE(story_id, user_id, emoji)
);

-- Enable Row Level Security (RLS)
ALTER TABLE build_story_reactions ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to insert their own reactions
CREATE POLICY "Enable insert for authenticated users only" ON public.build_story_reactions
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create policy for everyone to select reactions
CREATE POLICY "Enable select for everyone" ON public.build_story_reactions
AS PERMISSIVE FOR SELECT
TO public
USING (TRUE);

-- Create policy for users to delete their own reactions
CREATE POLICY "Enable delete for own reactions" ON public.build_story_reactions
AS PERMISSIVE FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_build_story_reactions_story_id ON build_story_reactions(story_id);
CREATE INDEX idx_build_story_reactions_user_id ON build_story_reactions(user_id);
