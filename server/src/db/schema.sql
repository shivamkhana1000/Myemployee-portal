-- =============================================================================
-- MyEmployee Portal — Database Schema
-- Run via: npm run db:migrate
-- Safe to re-run: all objects use IF NOT EXISTS / CREATE OR REPLACE.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Utility: auto-update updated_at columns
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ---------------------------------------------------------------------------
-- departments
-- Reference / lookup table.  Keeps department names consistent across the
-- platform without free-text duplication.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS departments (
  id   SERIAL      PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);


-- ---------------------------------------------------------------------------
-- users  (employees + managers)
-- Central identity table.  employee_id is the human-readable login handle
-- (e.g. "EMP001"), separate from the surrogate PK used for FK references.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id              SERIAL       PRIMARY KEY,
  employee_id     VARCHAR(20)  NOT NULL UNIQUE,
  password_hash   TEXT         NOT NULL,
  name            VARCHAR(150) NOT NULL,
  role            VARCHAR(20)  NOT NULL DEFAULT 'employee'
                    CHECK (role IN ('employee', 'manager')),
  department_id   INT          REFERENCES departments(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);


-- ---------------------------------------------------------------------------
-- tickets  (IT support requests)
-- An employee opens a ticket; a manager is optionally assigned to it.
-- department is stored as text (snapshot) so renaming a department later
-- does not silently alter historical records.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tickets (
  id                  SERIAL       PRIMARY KEY,
  employee_id         INT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  department          VARCHAR(100) NOT NULL,
  category            VARCHAR(100) NOT NULL,
  priority            VARCHAR(20)  NOT NULL DEFAULT 'medium'
                        CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  description         TEXT         NOT NULL,
  status              VARCHAR(20)  NOT NULL DEFAULT 'open'
                        CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  deadline            TIMESTAMPTZ,
  resolution          TEXT,
  assigned_manager_id INT          REFERENCES users(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER tickets_set_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


-- ---------------------------------------------------------------------------
-- ticket_comments
-- Threaded discussion attached to a ticket (both employees and managers can
-- comment).  Deleting a ticket cascades and removes its comments.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ticket_comments (
  id         SERIAL      PRIMARY KEY,
  ticket_id  INT         NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author_id  INT         NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  comment    TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ---------------------------------------------------------------------------
-- historical_solutions
-- Knowledge-base of past problems and their resolutions.  Used in a later
-- phase to suggest solutions when an employee opens a new ticket.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS historical_solutions (
  id                  SERIAL      PRIMARY KEY,
  problem_description TEXT        NOT NULL,
  resolution          TEXT        NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ---------------------------------------------------------------------------
-- gamba_projects  (Continuous Improvement / Kaizen projects)
-- Employees submit improvement proposals that go through a review lifecycle.
-- Financial fields (estimated_cost, actual_savings) use NUMERIC to avoid
-- floating-point rounding errors.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gamba_projects (
  id                      SERIAL         PRIMARY KEY,
  employee_id             INT            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title                   VARCHAR(200)   NOT NULL,
  department              VARCHAR(100)   NOT NULL,
  improvement_area        VARCHAR(150),
  problem_statement       TEXT,
  current_situation       TEXT,
  root_cause              TEXT,
  proposed_solution       TEXT,
  expected_benefits       TEXT,
  estimated_cost          NUMERIC(12, 2),
  actual_savings          NUMERIC(12, 2),
  productivity_improvement VARCHAR(100),
  team_members            JSONB          DEFAULT '[]'::jsonb,
  manager_comment         TEXT,
  status                  VARCHAR(20)    NOT NULL DEFAULT 'draft'
                            CHECK (status IN (
                              'draft', 'submitted', 'under_review',
                              'changes_requested', 'approved', 'implemented', 'completed'
                            )),
  created_at              TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER gamba_projects_set_updated_at
  BEFORE UPDATE ON gamba_projects
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


-- ---------------------------------------------------------------------------
-- notifications
-- In-app alerts pushed to individual users (e.g. "Your ticket was resolved",
-- "A Gamba project was approved").
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id         SERIAL      PRIMARY KEY,
  user_id    INT         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message    TEXT        NOT NULL,
  is_read    BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ---------------------------------------------------------------------------
-- attachments
-- File uploads associated with either a ticket or a Gamba project (never
-- both simultaneously).  file_path is a relative path under the server's
-- uploads directory — the absolute root is kept in server config, not here.
-- The CHECK ensures every attachment belongs to exactly one parent.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attachments (
  id               SERIAL      PRIMARY KEY,
  ticket_id        INT         REFERENCES tickets(id)       ON DELETE CASCADE,
  gamba_project_id INT         REFERENCES gamba_projects(id) ON DELETE CASCADE,
  file_path        TEXT        NOT NULL,
  uploaded_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Enforce: must belong to a ticket XOR a gamba project, not neither, not both.
  CONSTRAINT attachments_single_parent CHECK (
    (ticket_id IS NOT NULL)::INT + (gamba_project_id IS NOT NULL)::INT = 1
  )
);


-- ---------------------------------------------------------------------------
-- Indexes for common query patterns
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_tickets_employee_id         ON tickets(employee_id);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_manager_id ON tickets(assigned_manager_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status              ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket_id   ON ticket_comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_gamba_projects_employee_id  ON gamba_projects(employee_id);
CREATE INDEX IF NOT EXISTS idx_gamba_projects_status       ON gamba_projects(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id       ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_attachments_ticket_id       ON attachments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_attachments_gamba_id        ON attachments(gamba_project_id);

-- GIN index for fast full-text search on historical_solutions
CREATE INDEX IF NOT EXISTS idx_historical_solutions_fts
  ON historical_solutions
  USING GIN (to_tsvector('english', problem_description || ' ' || resolution));
