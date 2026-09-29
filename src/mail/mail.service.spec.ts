import { Test } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { MailService } from './mail.service'
import * as nodemailer from 'nodemailer'
import { renderFile } from 'ejs'
import juice from 'juice'

jest.mock('nodemailer')
jest.mock('ejs')
jest.mock('juice')

describe('MailService', () => {
	let service: MailService

	const mockTransporter = {
		verify: jest.fn(),
		sendMail: jest.fn()
	}

	const mockConfigService = {
		getOrThrow: jest.fn((key: string) => {
			const config: Record<string, string> = {
				SMTP_HOST: 'smtp.gmail.com',
				SMTP_PORT: '465',
				SMTP_SECURE: 'true',
				SMTP_USER: 'test@gmail.com',
				SMTP_PASSWORD: 'password'
			}

			return config[key]
		})
	}

	beforeEach(async () => {
		jest.clearAllMocks()

		;(nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter)

		mockTransporter.verify.mockResolvedValue(undefined)

		const module = await Test.createTestingModule({
			providers: [
				MailService,
				{
					provide: ConfigService,
					useValue: mockConfigService
				}
			]
		}).compile()

		service = module.get(MailService)
	})

	describe('constructor', () => {
		it('should be defined', () => {
			expect(service).toBeDefined()
		})

		it('should create SMTP transporter with correct config', () => {
			expect(nodemailer.createTransport).toHaveBeenCalledTimes(1)

			expect(nodemailer.createTransport).toHaveBeenCalledWith({
				host: 'smtp.gmail.com',
				port: 465,
				secure: true,
				auth: {
					user: 'test@gmail.com',
					pass: 'password'
				}
			})
		})

		it('should verify SMTP connection', () => {
			expect(mockTransporter.verify).toHaveBeenCalledTimes(1)
		})
	})

	describe('sendMail', () => {
		it('should send email', async () => {
			const mailResult = {
				messageId: '123'
			}

			mockTransporter.sendMail.mockResolvedValue(mailResult)

			const result = await service.sendMail(
				'user@gmail.com',
				'Test subject',
				'<h1>Hello</h1>'
			)

			expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1)

			expect(mockTransporter.sendMail).toHaveBeenCalledWith({
				from: '"KursahShop" <test@gmail.com>',
				to: 'user@gmail.com',
				subject: 'Test subject',
				html: '<h1>Hello</h1>'
			})

			expect(result).toEqual(mailResult)
		})

		it('should propagate sendMail error', async () => {
			const error = new Error('SMTP error')

			mockTransporter.sendMail.mockRejectedValue(error)

			await expect(
				service.sendMail('user@gmail.com', 'Test subject', '<h1>Hello</h1>')
			).rejects.toThrow('SMTP error')
		})
	})

	describe('getTemplate', () => {
		it('should render template and apply juice', async () => {
			const renderedContent = '<p>Hello John</p>'
			const renderedTemplate = `
				<html>
					<body>
						<p>Hello John</p>
					</body>
				</html>
			`

			;(renderFile as jest.Mock)
				.mockResolvedValueOnce(renderedContent)
				.mockResolvedValueOnce(renderedTemplate)

			;(juice as unknown as jest.Mock).mockReturnValue(
				'<html><body><p>Hello John</p></body></html>'
			)

			const result = await service.getTemplate('register', {
				title: 'Registration',
				name: 'John'
			})

			expect(renderFile).toHaveBeenCalledTimes(2)

			expect(renderFile).toHaveBeenNthCalledWith(
				1,
				expect.stringContaining('/src/mail/templates/register.ejs'),
				{
					name: 'John'
				},
				{
					views: [expect.stringContaining('/src/mail/templates')]
				}
			)

			expect(renderFile).toHaveBeenNthCalledWith(
				2,
				expect.stringContaining('/src/mail/templates/partials/layout.ejs'),
				{
					title: 'Registration',
					content: renderedContent
				},
				{
					views: [expect.stringContaining('/src/mail/templates')]
				}
			)

			expect(juice).toHaveBeenCalledTimes(1)
			expect(juice).toHaveBeenCalledWith(renderedTemplate)

			expect(result).toBe('<html><body><p>Hello John</p></body></html>')
		})

		it('should propagate template rendering error', async () => {
			;(renderFile as jest.Mock).mockRejectedValue(
				new Error('Template not found')
			)

			await expect(
				service.getTemplate('register', {
					title: 'Registration'
				})
			).rejects.toThrow('Template not found')

			expect(juice).not.toHaveBeenCalled()
		})
	})
})
