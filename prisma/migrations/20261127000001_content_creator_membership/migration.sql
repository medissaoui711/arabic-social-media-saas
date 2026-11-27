-- Ensure content creators are actual members of the same workspace.
ALTER TABLE content_items
  ADD CONSTRAINT content_items_creator_membership_fk
  FOREIGN KEY (workspace_id, created_by_id)
  REFERENCES memberships(workspace_id, user_id)
  ON DELETE RESTRICT;
