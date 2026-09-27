import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Pool } from 'pg'
import { DatabaseService } from './database.service'

@Global()
@Module({
	providers: [
		{
			provide: 'DATABASE_POOL',
			inject: [ConfigService],
			useFactory: (configService: ConfigService) =>
				new Pool({
					host: configService.getOrThrow<string>('POSTGRES_HOST'),
					port: Number(configService.getOrThrow<number>('POSTGRES_PORT')),
					user: configService.getOrThrow<string>('POSTGRES_USER'),
					password: configService.getOrThrow<string>('POSTGRES_PASSWORD'),
					database: configService.getOrThrow<string>('POSTGRES_DB')
				})
		},
		DatabaseService
	],
	exports: ['DATABASE_POOL', DatabaseService]
})
export class DatabaseModule {}
