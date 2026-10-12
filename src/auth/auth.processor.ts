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
import { SendResetPassword } from './types/send-reset-password.type'
import { ResetPasswordMail } from '../mail/types/reset-password.type'

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
			case authQueueConstant.sendResetPassword:
				return this.sendResetPassword(job.data)

			default:
				throw new Error(`Unknown job: ${job.name}`)
		}
	}

	async sendConfirmRegister(token: string) {
		const pendingUser = await this.redis.get(`pendingUser:${token}`)

		if (!pendingUser) throw new Error('Pending user not found.')

		const { name, surname, email } = JSON.parse(pendingUser) as User

		const link = `${this.configService.getOrThrow('CLIENT_URL')}/auth/register/confirm?token=${token}`

		const template = await this.mailService.getTemplate<ConfirmRegistration>(
			'confirm-registration',
			{
				title: 'Подтверждение регстрации',
				link,
				name,
				surname
			}
		)

		await this.mailService.sendMail(email, 'Подтверждение регстрации', template)

		return true
	}

	async sendResetPassword({ token, login, email }: SendResetPassword) {
		try {
			const link = `${this.configService.getOrThrow('CLIENT_URL')}/profile/reset-password/confirm?token=${token}`

			const template = await this.mailService.getTemplate<ResetPasswordMail>(
				'reset-password',
				{
					title: 'Сброс пароля',
					link,
					username: login,
					techLink: `${this.configService.getOrThrow('CLIENT_URL')}/tech`
				}
			)

			await this.mailService.sendMail(email, 'Сброс пароля', template)
			return true
		} catch (error) {
			this.logger.error(
				`Failed to send reset password email to ${email}`,
				error
			)
			throw error // Бросаем ошибку, чтобы BullMQ сделал retry
		}
	}
}
