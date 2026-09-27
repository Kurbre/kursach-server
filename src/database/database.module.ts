import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DatabaseService } from './database.service'
import { databaseConfig } from '../config/database.config'

@Global()
@Module({
	providers: [
		{
			provide: 'DATABASE_POOL',
			inject: [ConfigService],
			useFactory: databaseConfig
		},
		DatabaseService
	],
	exports: ['DATABASE_POOL', DatabaseService]
})
export class DatabaseModule {}
