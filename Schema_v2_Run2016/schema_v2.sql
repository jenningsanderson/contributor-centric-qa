-- User Schema v2
-- Basing a lot of this off of https://github.com/openstreetmap/osmosis/blob/master/package/script/pgsimple_schema_0.6.sql

-- Drop all tables if they exist.
DROP TABLE IF EXISTS user_stats;
DROP TABLE IF EXISTS schema_info;
DROP TABLE IF EXISTS per_tile;

--Drop indexes if they exist;
DROP INDEX CONCURRENTLY IF EXISTS uid_idx;
DROP INDEX CONCURRENTLY IF EXISTS year_idx;
DROP INDEX CONCURRENTLY IF EXISTS quad_idx;


CREATE TABLE user_stats(
   id             serial PRIMARY KEY     NOT NULL, -- unique id for the entry
   uid            INT                 NOT NULL, -- user id
   name           text,
   year           INT                 NOT NULL, -- year of info
   buildings      INT,
   road_km        REAL,
   amenities      INT,
   edits          INT,
   active_days    integer ARRAY
);

CREATE TABLE schema_info(
  version integer NOT NULL
);

CREATE TABLE per_tile(
  id              serial PRIMARY KEY   NOT NULL,
  quadkey         text                 NOT NULL,
  year            INT                  NOT NULL,
  uid             INT                  NOT NULL,
  buildings       INT,
  road_km         REAL,
  amenities       INT,
  edits           INT,
  active_days     integer ARRAY
);

-- Configure the schema version.
INSERT INTO schema_info (version) VALUES (2);

-- Add indexes to tables.
CREATE INDEX uid_idx  ON user_stats (uid);
CREATE INDEX year_idx ON user_stats (year);
CREATE INDEX quad_idx ON per_tile   (quadkey);
CREATE INDEX uid_idx_tile  ON per_tile   (uid);
