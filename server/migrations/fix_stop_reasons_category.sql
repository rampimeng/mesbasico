-- Remove the CHECK constraint on stop_reasons.category to allow free text
-- This allows users to define their own categories without restrictions

ALTER TABLE stop_reasons
DROP CONSTRAINT IF EXISTS stop_reasons_category_check;

-- Make category column accept any text value (already nullable)
-- No additional changes needed, just removing the constraint
