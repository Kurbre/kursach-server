import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'

export const redisConfig = async (configService: ConfigService) =>
	new Redis({
		port: Number(configService.getOrThrow<number>('REDIS_PORT')),
		host: configService.getOrThrow<string>('REDIS_HOST')
	})
