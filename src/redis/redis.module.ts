import { Global, Inject, Injectable, Module, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'
import { redisConfig } from '../config/redis.config'

export const REDIS_CLIENT = Symbol('REDIS_CLIENT')

@Injectable()
class RedisConnectionLifecycle implements OnModuleDestroy {
	constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

	async onModuleDestroy() {
		await this.redis.quit()
	}
}

@Global()
@Module({
	providers: [
		RedisConnectionLifecycle,
		{
			provide: REDIS_CLIENT,
			inject: [ConfigService],
			useFactory: redisConfig
		}
	],
	exports: [REDIS_CLIENT]
})
export class RedisModule {}
