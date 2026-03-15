-- ============================================================
-- REFERENCE ONLY — database is already live, do not re-run
-- ============================================================

-- teams
-- CREATE TABLE teams (
--   id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   team_name        text UNIQUE NOT NULL,
--   password         text NOT NULL,
--   currency_balance integer NOT NULL DEFAULT 1000,
--   color            text,
--   created_at       timestamptz DEFAULT now()
-- );

-- items
-- CREATE TABLE items (
--   id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   item_name text NOT NULL,
--   category  text NOT NULL,
--   base_cost integer NOT NULL
-- );

-- purchases
-- CREATE TABLE purchases (
--   id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   team_id   uuid REFERENCES teams(id),
--   item_id   uuid REFERENCES items(id),
--   cost      integer NOT NULL,
--   timestamp timestamptz DEFAULT now()
-- );

-- results
-- CREATE TABLE results (
--   id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   team_id      uuid UNIQUE REFERENCES teams(id),
--   rank         integer,
--   score        decimal,
--   project_name text,
--   project_desc text
-- );

-- RPC: deduct_balance
-- CREATE OR REPLACE FUNCTION deduct_balance(p_team_id uuid, p_amount integer)
-- RETURNS void AS $$
--   UPDATE teams SET currency_balance = currency_balance - p_amount WHERE id = p_team_id;
-- $$ LANGUAGE sql;

-- Notes:
-- • Realtime enabled on: purchases, teams
-- • RLS disabled on all tables
-- • Seed data: 4 teams (CodeWarriors, DevDynamos, HackMasters, ByteForce)
--              14 items across AI API, Framework, Database, API, Tool, Problem Statement
