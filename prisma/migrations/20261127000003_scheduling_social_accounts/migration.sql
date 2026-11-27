CREATE TYPE "SocialPlatform" AS ENUM ('facebook','instagram','tiktok','youtube','linkedin','x','other');
CREATE TABLE schedule_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  content_id uuid NOT NULL,
  status "ScheduleStatus" NOT NULL DEFAULT 'scheduled',
  scheduled_at timestamptz NOT NULL,
  timezone varchar(64) NOT NULL,
  idempotency_key varchar(128) NOT NULL,
  attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  claimed_at timestamptz,
  completed_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT schedule_content_workspace_fk FOREIGN KEY (workspace_id,content_id)
    REFERENCES content_items(workspace_id,id) ON DELETE RESTRICT,
  CONSTRAINT schedule_workspace_idempotency_unique UNIQUE(workspace_id,idempotency_key),
  CONSTRAINT schedule_workspace_id_unique UNIQUE(workspace_id,id)
);
CREATE INDEX schedule_workspace_status_time_idx ON schedule_jobs(workspace_id,status,scheduled_at);
CREATE TABLE schedule_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL,
  schedule_id uuid NOT NULL,
  from_status "ScheduleStatus",
  to_status "ScheduleStatus" NOT NULL,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT schedule_event_job_fk FOREIGN KEY (workspace_id,schedule_id)
    REFERENCES schedule_jobs(workspace_id,id) ON DELETE CASCADE
);
CREATE INDEX schedule_events_history_idx ON schedule_events(workspace_id,schedule_id,created_at);
CREATE TABLE social_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  platform "SocialPlatform" NOT NULL,
  account_name varchar(120) NOT NULL,
  handle varchar(120) NOT NULL,
  notes varchar(1000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT social_workspace_platform_handle_unique UNIQUE(workspace_id,platform,handle)
);
CREATE INDEX social_accounts_workspace_platform_idx ON social_accounts(workspace_id,platform);
ALTER TABLE schedule_jobs ENABLE ROW LEVEL SECURITY; ALTER TABLE schedule_jobs FORCE ROW LEVEL SECURITY;
ALTER TABLE schedule_events ENABLE ROW LEVEL SECURITY; ALTER TABLE schedule_events FORCE ROW LEVEL SECURITY;
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY; ALTER TABLE social_accounts FORCE ROW LEVEL SECURITY;
CREATE POLICY schedule_workspace_isolation ON schedule_jobs
  USING (workspace_id = nullif(current_setting('app.current_workspace_id',true),'')::uuid)
  WITH CHECK (workspace_id = nullif(current_setting('app.current_workspace_id',true),'')::uuid);
CREATE POLICY schedule_events_workspace_isolation ON schedule_events
  USING (workspace_id = nullif(current_setting('app.current_workspace_id',true),'')::uuid)
  WITH CHECK (workspace_id = nullif(current_setting('app.current_workspace_id',true),'')::uuid);
CREATE POLICY social_workspace_isolation ON social_accounts
  USING (workspace_id = nullif(current_setting('app.current_workspace_id',true),'')::uuid)
  WITH CHECK (workspace_id = nullif(current_setting('app.current_workspace_id',true),'')::uuid);
GRANT SELECT,INSERT,UPDATE,DELETE ON schedule_jobs,schedule_events,social_accounts TO app_user;
