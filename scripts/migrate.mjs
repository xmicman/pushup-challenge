import pg from "pg"
import { readFileSync, readdirSync } from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const { Pool } = pg
const __dir = dirname(fileURLToPath(import.meta.url))

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function migrate() {
  const client = await pool.connect()
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
        id VARCHAR(36) PRIMARY KEY,
        checksum VARCHAR(64) NOT NULL,
        finished_at TIMESTAMPTZ,
        migration_name VARCHAR(255) NOT NULL,
        logs TEXT,
        rolled_back_at TIMESTAMPTZ,
        started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        applied_steps_count INTEGER NOT NULL DEFAULT 0
      )
    `)

    const migrationsDir = join(__dir, "../prisma/migrations")
    const dirs = readdirSync(migrationsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort()

    for (const name of dirs) {
      const { rows } = await client.query(
        `SELECT id FROM "_prisma_migrations" WHERE migration_name = $1`, [name]
      )
      if (rows.length > 0) {
        console.log(`Migration ${name} already applied, skipping.`)
        continue
      }
      const sql = readFileSync(join(migrationsDir, name, "migration.sql"), "utf8")
      console.log(`Applying migration ${name}...`)
      await client.query(sql)
      await client.query(
        `INSERT INTO "_prisma_migrations" (id, checksum, migration_name, applied_steps_count, finished_at)
         VALUES (gen_random_uuid(), 'manual', $1, 1, now())`, [name]
      )
      console.log(`Migration ${name} applied.`)
    }
  } finally {
    client.release()
    await pool.end()
  }
}

migrate().catch((e) => { console.error(e); process.exit(1) })
