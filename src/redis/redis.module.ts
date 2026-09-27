import { Global, Module } from '@nestjs/common'
import Redis from 'ioredis'
import { redisConfig } from '../config/redis.config'
import { ConfigService } from '@nestjs/config'

export const REDIS_CLIENT = Symbol('REDIS_CLIENT')

@Global()
@Module({
	providers: [
		{
			provide: REDIS_CLIENT,
			inject: [ConfigService],
			useFactory: redisConfig
		}
	],
	exports: [REDIS_CLIENT]
})
export class RedisModule {}
