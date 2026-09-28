-- Drop gamba_members as we will use a JSONB array in gamba_projects
DROP TABLE IF EXISTS gamba_members CASCADE;

-- Alter gamba_projects to match Phase 6 requirements
ALTER TABLE gamba_projects 
  DROP CONSTRAINT IF EXISTS gamba_projects_status_check;

-- Add new columns
ALTER TABLE gamba_projects
  ADD COLUMN IF NOT EXISTS team_members JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS manager_comment TEXT;

-- Modify existing columns
ALTER TABLE gamba_projects
  ALTER COLUMN productivity_improvement TYPE VARCHAR(100);

-- Apply new constraint for statuses
ALTER TABLE gamba_projects
  ADD CONSTRAINT gamba_projects_status_check CHECK (
    status IN (
      'draft', 'submitted', 'under_review', 'changes_requested',
      'approved', 'implemented', 'completed'
    )
  );
