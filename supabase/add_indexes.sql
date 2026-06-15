-- Add indexes to speed up analytics by assigned user and activity creator

CREATE INDEX IF NOT EXISTS idx_deals_assigned_to ON deals (assigned_to);
CREATE INDEX IF NOT EXISTS idx_activities_created_by ON activities (created_by);

-- Consider adding partial indexes for active deals (not won/lost) if needed:
-- CREATE INDEX IF NOT EXISTS idx_deals_assigned_to_active ON deals (assigned_to) WHERE stage NOT IN ('won','lost');
