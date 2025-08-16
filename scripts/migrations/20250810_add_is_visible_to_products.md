# Migration: Add is_visible to products

Copy-paste the SQL below into the Supabase SQL editor and run. All optional sections are clearly marked.

```sql
-- 1. Add column (idempotent)
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS is_visible boolean DEFAULT false;

-- 2. Backfill existing rows based on launch_date relative to now (UTC)
UPDATE public.products
SET is_visible = (launch_date <= now() AT TIME ZONE 'utc');

-- 3. (Optional) Enforce NOT NULL after backfill
ALTER TABLE public.products
ALTER COLUMN is_visible SET NOT NULL;

-- 4. (Optional) Trigger to auto-set visibility on insert/update of launch_date
CREATE OR REPLACE FUNCTION public.set_product_visibility()
RETURNS trigger AS $$
BEGIN
  NEW.is_visible := (NEW.launch_date <= now() AT TIME ZONE 'utc');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_product_visibility ON public.products;

CREATE TRIGGER trg_set_product_visibility
BEFORE INSERT OR UPDATE OF launch_date ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.set_product_visibility();

-- 5. (Optional) Partial index to speed up queries for visible launches
CREATE INDEX IF NOT EXISTS idx_products_visible_launchdate
ON public.products (launch_date)
WHERE is_visible = true;

-- 6. (Optional) Helper function to refresh visibility manually if you skip the trigger
CREATE OR REPLACE FUNCTION public.refresh_product_visibility()
RETURNS void AS $$
  UPDATE public.products
  SET is_visible = (launch_date <= now() AT TIME ZONE 'utc');
$$ LANGUAGE sql;

-- To manually refresh (run separately when needed):
-- SELECT public.refresh_product_visibility();
```

## Notes
- Steps 3–6 are optional but recommended.
- If you rely on a cron job instead of the trigger, omit step 4 and schedule step 6.
- Ensure your backend filters with `WHERE is_visible = true` (or `launch_date <= now()`).

## Adjust existing future launches to 08:00 UTC
Use this if earlier you stored future launch timestamps at 12:00 UTC but now standard is 08:00 UTC.

```sql
-- Preview affected future rows currently at 12:00 UTC
SELECT id, launch_date
FROM public.products
WHERE launch_date > now()
  AND to_char(launch_date, 'HH24:MI') = '12:00'
ORDER BY launch_date;

-- Shift those launches to 08:00 UTC (same calendar day)
UPDATE public.products
SET launch_date = date_trunc('day', launch_date) + interval '8 hours'
WHERE launch_date > now()
  AND to_char(launch_date, 'HH24:MI') = '12:00';

-- Verify update
SELECT id, launch_date
FROM public.products
WHERE launch_date > now()
ORDER BY launch_date
LIMIT 50;

-- (If you did NOT create the trigger, refresh visibility just in case)
UPDATE public.products
SET is_visible = (launch_date <= now())
WHERE launch_date > now();
```