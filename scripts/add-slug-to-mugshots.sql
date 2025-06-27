-- Add slug column to mugshots table
ALTER TABLE mugshots 
ADD COLUMN slug VARCHAR(255);

-- Backfill existing mugshots with unique slugs
UPDATE mugshots 
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(name, '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  )
) || '-' || LEFT(id, 8)
WHERE slug IS NULL;

-- Make slug NOT NULL
ALTER TABLE mugshots 
ALTER COLUMN slug SET NOT NULL;

-- Add unique index on slug
CREATE UNIQUE INDEX mugshots_slug_idx ON mugshots(slug);
