import { hash } from 'argon2'
import { DatabaseService } from '../../src/database/database.service'

type CreateE2EUserOptions = {
	email: string
	login: string
	name: string
	surname: string
	password?: string
}

export async function createE2EUser(
	db: DatabaseService,
	options: CreateE2EUserOptions
) {
	const password = options.password ?? 'password123'
	const hashedPassword = await hash(password)

	const { rows } = await db.query(
		`
			INSERT INTO users (
				email,
				login,
				name,
				surname,
				password
			)
			VALUES ($1, $2, $3, $4, $5)
			RETURNING
				id,
				email,
				login,
				name,
				surname,
				created_at,
				updated_at
		`,
		[
			options.email,
			options.login,
			options.name,
			options.surname,
			hashedPassword
		]
	)

	return {
		user: rows[0],
		password
	}
}
