-- Add pdcaEnabled column to companies table
-- This allows enabling/disabling PDCA feature per company

ALTER TABLE companies
ADD COLUMN IF NOT EXISTS "pdcaEnabled" boolean DEFAULT false;

-- Update existing companies to have PDCA disabled by default
UPDATE companies
SET "pdcaEnabled" = false
WHERE "pdcaEnabled" IS NULL;
