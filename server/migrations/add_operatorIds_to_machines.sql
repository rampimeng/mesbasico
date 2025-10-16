-- Add operatorIds column to machines table
-- This column stores an array of operator IDs that are assigned to this machine

ALTER TABLE machines
ADD COLUMN IF NOT EXISTS "operatorIds" text[] DEFAULT '{}';

-- Add comment to document the column
COMMENT ON COLUMN machines."operatorIds" IS 'Array of user IDs (operators) assigned to this machine';

-- Update existing machines to have an empty array
UPDATE machines
SET "operatorIds" = '{}'
WHERE "operatorIds" IS NULL;
