import { ConfigService } from '@nestjs/config'
import { Pool } from 'pg'

export const databaseConfig = async (configService: ConfigService) =>
	new Pool({
		host: configService.getOrThrow<string>('POSTGRES_HOST'),
		port: Number(configService.getOrThrow<number>('POSTGRES_PORT')),
		user: configService.getOrThrow<string>('POSTGRES_USER'),
		password: configService.getOrThrow<string>('POSTGRES_PASSWORD'),
		database: configService.getOrThrow<string>('POSTGRES_DB')
	})
