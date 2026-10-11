import { Inject, Injectable } from '@nestjs/common'
import { Pool, QueryResultRow } from 'pg'

@Injectable()
export class DatabaseService {
	constructor(
		@Inject('DATABASE_POOL')
		private readonly pool: Pool
	) {}

	query<T extends QueryResultRow = QueryResultRow>(
		text: string,
		values?: unknown[]
	) {
		return this.pool.query<T>(text, values)
	}

	getPool() {
		return this.pool
	}
}
