import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { redisConfig } from '../config/redis.config'

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
