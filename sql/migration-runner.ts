import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { Pool } from 'pg'
import 'dotenv/config'

const pool = new Pool({
	host: process.env.POSTGRES_HOST,
	port: Number(process.env.POSTGRES_PORT),
	user: process.env.POSTGRES_USER,
	password: process.env.POSTGRES_PASSWORD,
	database: process.env.POSTGRES_DB
})

async function runMigrations() {
	const client = await pool.connect()

	try {
		await client.query(`
			CREATE TABLE IF NOT EXISTS migrations (
				id BIGSERIAL PRIMARY KEY,
				name VARCHAR(255) NOT NULL UNIQUE,
				executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
			)
		`)

		const { rows: executedMigrations } = await client.query<{
			name: string
		}>(`
			SELECT name
			FROM migrations
			ORDER BY id
		`)

		const executedNames = new Set(
			executedMigrations.map(migration => migration.name)
		)

		const migrationsPath = path.join(process.cwd(), 'sql/migrations')

		const files = (await readdir(migrationsPath))
			.filter(file => file.endsWith('.sql'))
			.sort()

		for (const file of files) {
			if (executedNames.has(file)) {
				continue
			}

			const sql = await readFile(path.join(migrationsPath, file), 'utf-8')

			await client.query('BEGIN')

			try {
				await client.query(sql)

				await client.query(
					`
						INSERT INTO migrations (name)
						VALUES ($1)
					`,
					[file]
				)

				await client.query('COMMIT')

				console.log(`Migration ${file} executed`)
			} catch (error) {
				await client.query('ROLLBACK')
				throw error
			}
		}
	} finally {
		client.release()
		await pool.end()
	}
}

runMigrations()
