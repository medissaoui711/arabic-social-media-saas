CREATE TABLE media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  created_by_id uuid NOT NULL,
  storage_key varchar(255) NOT NULL UNIQUE,
  original_name varchar(180) NOT NULL,
  mime_type varchar(100) NOT NULL,
  size_bytes integer NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 20971520),
  sha256 char(64) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT media_creator_membership_fk
    FOREIGN KEY (workspace_id, created_by_id)
    REFERENCES memberships(workspace_id, user_id) ON DELETE RESTRICT
);
CREATE INDEX media_workspace_created_idx ON media_assets(workspace_id, created_at DESC);
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets FORCE ROW LEVEL SECURITY;
CREATE POLICY media_workspace_isolation ON media_assets
  USING (workspace_id = nullif(current_setting('app.current_workspace_id', true), '')::uuid)
  WITH CHECK (workspace_id = nullif(current_setting('app.current_workspace_id', true), '')::uuid);
GRANT SELECT, INSERT, UPDATE, DELETE ON media_assets TO app_user;
