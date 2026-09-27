import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Pool } from 'pg'

@Global()
@Module({
	providers: [
		{
			provide: 'DATABASE_POOL',
			inject: [ConfigService],
			useFactory: (configService: ConfigService) =>
				new Pool({
					host: configService.getOrThrow('POSTGRES_HOST'),
					port: configService.getOrThrow('POSTGRES_PORT'),
					user: configService.getOrThrow('POSTGRES_USER'),
					password: configService.getOrThrow('POSTGRES_PASSWORD'),
					database: configService.getOrThrow('POSTGRES_DB')
				})
		}
	]
})
export class DatabaseModule {}
