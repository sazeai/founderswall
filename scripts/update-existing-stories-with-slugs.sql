-- Update existing stories that don't have slugs
UPDATE build_stories 
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    ),
    '-+', '-', 'g'
  )
)
WHERE slug IS NULL OR slug = '';

-- Ensure slugs are unique by appending ID if needed
UPDATE build_stories 
SET slug = slug || '-' || SUBSTRING(id::text, 1, 8)
WHERE id IN (
  SELECT id FROM (
    SELECT id, slug, ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at) as rn
    FROM build_stories
  ) t WHERE t.rn > 1
);
