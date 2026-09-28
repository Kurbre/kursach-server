import { BullRootModuleOptions } from '@nestjs/bullmq'
import { ConfigService } from '@nestjs/config'

export const bullMQConfig = async (
	configService: ConfigService
): Promise<BullRootModuleOptions> => ({
	connection: {
		host: configService.getOrThrow('REDIS_HOST'),
		port: configService.getOrThrow('REDIS_PORT')
	}
})
