-- Add slug column to build_stories table
ALTER TABLE build_stories 
ADD COLUMN slug VARCHAR(255);

-- Create unique index on slug
CREATE UNIQUE INDEX build_stories_slug_idx ON build_stories(slug);

-- Update existing stories with slugs (if any)
UPDATE build_stories 
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  )
)
WHERE slug IS NULL;

-- Make slug NOT NULL after updating existing records
ALTER TABLE build_stories 
ALTER COLUMN slug SET NOT NULL;
