import { Test } from '@nestjs/testing'
import { AuthProcessor } from './auth.processor'
import { REDIS_CLIENT } from '../redis/redis.module'
import { MailService } from '../mail/mail.service'
import { ConfigService } from '@nestjs/config'
import { authQueueConstant } from './constants/auth-queue.constant'
import { Job } from 'bullmq'

describe('Auth Processor', () => {
	let processor: AuthProcessor
	let redis: {
		get: jest.Mock
	}
	let mailService: {
		getTemplate: jest.Mock
		sendMail: jest.Mock
	}
	let configService: {
		getOrThrow: jest.Mock
	}

	beforeEach(async () => {
		redis = { get: jest.fn() }

		mailService = {
			getTemplate: jest.fn(),
			sendMail: jest.fn()
		}

		configService = {
			getOrThrow: jest.fn()
		}

		const module = await Test.createTestingModule({
			providers: [
				AuthProcessor,
				{
					provide: REDIS_CLIENT,
					useValue: redis
				},
				{
					provide: MailService,
					useValue: mailService
				},
				{
					provide: ConfigService,
					useValue: configService
				}
			]
		}).compile()

		processor = module.get(AuthProcessor)
	})

	describe('process', () => {
		it('should process send register mail job', async () => {
			const spy = jest
				.spyOn(processor, 'sendConfirmRegister')
				.mockResolvedValue(true)

			const job = {
				name: authQueueConstant.sendRegisterMail,
				data: {
					token: 'test-token'
				}
			} as Job

			await processor.process(job)

			expect(spy).toHaveBeenCalledWith('test-token')
		})

		it('should throw for unknown job', async () => {
			const job = {
				name: 'unknown-job',
				data: {}
			} as Job

			await expect(processor.process(job)).rejects.toThrow(
				'Unknown job: unknown-job'
			)
		})
	})

	describe('sendConfirmRegister', () => {
		it('should throw if pending user not found', async () => {
			redis.get.mockResolvedValue(null)

			await expect(processor.sendConfirmRegister('test-token')).rejects.toThrow(
				'Pending user not found.'
			)

			expect(mailService.getTemplate).not.toHaveBeenCalled()
			expect(mailService.sendMail).not.toHaveBeenCalled()
		})

		it('should send confirmation email', async () => {
			const token = 'test-token'

			redis.get.mockResolvedValue(
				JSON.stringify({
					email: 'test@example.com',
					name: 'Илья',
					surname: 'Змей'
				})
			)

			configService.getOrThrow.mockReturnValue('http://localhost:3000')

			mailService.getTemplate.mockResolvedValue('<html>confirmation</html>')

			mailService.sendMail.mockResolvedValue(undefined)

			const result = await processor.sendConfirmRegister(token)

			expect(result).toBe(true)

			expect(redis.get).toHaveBeenCalledWith(`pendingUser:${token}`)

			expect(mailService.getTemplate).toHaveBeenCalledWith(
				'confirm-registration',
				{
					title: 'Подтверждение регстрации',
					link: `http://localhost:3000/auth/register/confirm?token=${token}`,
					name: 'Илья',
					surname: 'Змей'
				}
			)

			expect(mailService.sendMail).toHaveBeenCalledWith(
				'test@example.com',
				'Подтверждение регстрации',
				'<html>confirmation</html>'
			)
		})
	})
})
