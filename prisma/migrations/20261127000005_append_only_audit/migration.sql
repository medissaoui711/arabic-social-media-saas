-- Audit and schedule transition history are append-only for the runtime role.
REVOKE UPDATE, DELETE, TRUNCATE ON audit_events FROM app_user;
REVOKE UPDATE, DELETE, TRUNCATE ON schedule_events FROM app_user;
GRANT SELECT, INSERT ON audit_events, schedule_events TO app_user;
