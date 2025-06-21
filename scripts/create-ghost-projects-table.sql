-- Create ghost_projects table
CREATE TABLE IF NOT EXISTS ghost_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  founder_id UUID REFERENCES mugshots(id) ON DELETE CASCADE,
  
  -- Basic Info
  codename VARCHAR(255) NOT NULL,
  real_name VARCHAR(255), -- private field
  one_liner TEXT NOT NULL,
  
  -- Technical Details
  tech_stack TEXT[] DEFAULT '{}',
  assets_available TEXT[] DEFAULT '{}', -- ['code', 'domain', 'ui', 'branding', 'docs']
  
  -- Story & Learning (private fields)
  learnings TEXT,
  abandonment_reason TEXT,
  full_description TEXT,
  
  -- Pricing & Intent
  intent VARCHAR(50) NOT NULL DEFAULT 'for_sale', -- 'for_sale', 'learning_only', 'open_to_offers'
  asking_price VARCHAR(100),
  
  -- Status & Visibility
  status VARCHAR(50) NOT NULL DEFAULT 'abandoned_after_mvp', -- 'never_launched', 'abandoned_after_mvp', 'had_traction'
  is_approved BOOLEAN DEFAULT false,
  is_visible BOOLEAN DEFAULT true,
  
  -- Access Control
  approved_viewers UUID[] DEFAULT '{}', -- array of user IDs who can see private details
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ghost_projects_founder_id ON ghost_projects(founder_id);
CREATE INDEX IF NOT EXISTS idx_ghost_projects_slug ON ghost_projects(slug);
CREATE INDEX IF NOT EXISTS idx_ghost_projects_status ON ghost_projects(status);
CREATE INDEX IF NOT EXISTS idx_ghost_projects_intent ON ghost_projects(intent);
CREATE INDEX IF NOT EXISTS idx_ghost_projects_created_at ON ghost_projects(created_at DESC);

-- Create access requests table for tracking who wants to see private details
CREATE TABLE IF NOT EXISTS ghost_project_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ghost_project_id UUID REFERENCES ghost_projects(id) ON DELETE CASCADE,
  requester_id UUID REFERENCES mugshots(id) ON DELETE CASCADE,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'denied'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(ghost_project_id, requester_id)
);

CREATE INDEX IF NOT EXISTS idx_ghost_access_requests_project ON ghost_project_access_requests(ghost_project_id);
CREATE INDEX IF NOT EXISTS idx_ghost_access_requests_requester ON ghost_project_access_requests(requester_id);
