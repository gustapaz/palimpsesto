CREATE TABLE IF NOT EXISTS archives (
 id TEXT PRIMARY KEY,
 version INTEGER NOT NULL,
 document TEXT NOT NULL,
 expires INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS archives_expiry ON archives(expires);
