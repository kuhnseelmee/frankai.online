-- FRA-DOM-001: additive, catalogue-only schema. Does not publish DNS or execute agents.
CREATE TABLE IF NOT EXISTS domain_registry (
  id text PRIMARY KEY,
  name text NOT NULL,
  capability_group text NOT NULL,
  priority text NOT NULL CHECK (priority IN ('P0','P1','P2','P3')),
  owner_user_id text REFERENCES users(id) ON DELETE RESTRICT,
  lifecycle text NOT NULL DEFAULT 'PROPOSED' CHECK (lifecycle IN ('PROPOSED','APPROVED','PROVISIONED','VERIFIED','RETIRED')),
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS domain_hostnames (
  hostname text PRIMARY KEY,
  domain_id text NOT NULL REFERENCES domain_registry(id) ON DELETE RESTRICT,
  exposure text NOT NULL DEFAULT 'UNPUBLISHED' CHECK (exposure IN ('UNPUBLISHED','PROTECTED','PUBLISHED')),
  verification_status text NOT NULL DEFAULT 'UNVERIFIED' CHECK (verification_status IN ('UNVERIFIED','VERIFIED','FAILED')),
  environment text NOT NULL DEFAULT 'PROPOSED' CHECK (environment IN ('PROPOSED','DEVELOPMENT','STAGING','PRODUCTION')),
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT hostname_lowercase CHECK (hostname = lower(hostname))
);
CREATE TABLE IF NOT EXISTS domain_registry_events (
  event_id text PRIMARY KEY,
  subject_kind text NOT NULL CHECK (subject_kind IN ('DOMAIN','HOSTNAME')),
  subject_id text NOT NULL,
  event_type text NOT NULL,
  actor_user_id text REFERENCES users(id) ON DELETE RESTRICT,
  request_id text NOT NULL,
  idempotency_key text NOT NULL UNIQUE,
  decision_reference text,
  evidence_reference text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS domain_hostnames_domain_idx ON domain_hostnames(domain_id);
CREATE INDEX IF NOT EXISTS domain_events_subject_idx ON domain_registry_events(subject_kind, subject_id, occurred_at);
-- No application role grants: schema ownership does not imply registry write authority.
