import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Inject, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Job } from 'bullmq'
import Redis from 'ioredis'
import { MailService } from '../mail/mail.service'
import { ConfirmRegistration } from '../mail/types/confirm-registration.type'
import { REDIS_CLIENT } from '../redis/redis.module'
import { User } from '../users/types/user.type'
import { authQueueConstant } from './constants/auth-queue.constant'

@Processor(authQueueConstant.name)
export class AuthProcessor extends WorkerHost {
	private readonly logger = new Logger(AuthProcessor.name)

	constructor(
		private readonly mailService: MailService,
		@Inject(REDIS_CLIENT) private readonly redis: Redis,
		private readonly configService: ConfigService
	) {
		super()
	}

	async process(job: Job): Promise<any> {
		switch (job.name) {
			case authQueueConstant.sendRegisterMail:
				return this.sendConfirmRegister(job.data.token)

			default:
				throw new Error(`Unknown job: ${job.name}`)
		}
	}

	async sendConfirmRegister(token: string) {
		this.logger.log('Started')

		const pendingUser = await this.redis.get(`pendingUser:${token}`)

		this.logger.log(`Find ${pendingUser} Token: ${token}`)

		if (!pendingUser) throw new Error('Pending user not found.')

		this.logger.log('Finded')

		const { name, surname, email } = JSON.parse(pendingUser) as User

		const link = `${this.configService.getOrThrow('CLIENT_URL')}/auth/register/confirm?token=${token}`

		const template = await this.mailService.getTemplate<ConfirmRegistration>(
			'confirm-registration',
			{ title: 'Подтверждение регстрации', link, name, surname }
		)

		this.logger.log('Get template')

		await this.mailService.sendMail(email, 'Подтверждение регстрации', template)

		this.logger.log('Sended')

		return true
	}
}
