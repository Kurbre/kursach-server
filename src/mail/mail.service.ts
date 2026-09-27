import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { type Data, renderFile } from 'ejs'
import * as nodemailer from 'nodemailer'
import { join } from 'path'
import juice from 'juice'

@Injectable()
export class MailService {
	private transporter

	constructor(private readonly configService: ConfigService) {
		this.transporter = nodemailer.createTransport({
			host: this.configService.getOrThrow<string>('SMTP_HOST'),
			port: Number(this.configService.getOrThrow<number>('SMTP_PORT')),
			secure: Boolean(this.configService.getOrThrow<boolean>('SMTP_SECURE')), // true для 465, false для других портов
			auth: {
				user: this.configService.getOrThrow<string>('SMTP_USER'),
				pass: this.configService.getOrThrow<string>('SMTP_PASSWORD')
			}
		})
	}

	async sendMail(to: string, subject: string, html: string) {
		return this.transporter.sendMail({
			from: `"KursahShop" <${this.configService.getOrThrow<string>('SMTP_USER')}>`,
			to,
			subject,
			html
		})
	}

	async getTemplate<T extends Data & { title: string }>(
		templateName: string,
		{ title, ...data }: T
	) {
		const basePath = join(process.cwd(), 'src', 'mail', 'templates')

		const templateFile = join(
			process.cwd(),
			'src',
			'mail',
			'templates',
			'partials',
			'layout.ejs'
		)
		const file = join(
			process.cwd(),
			'src',
			'mail',
			'templates',
			`${templateName}.ejs`
		)

		const content = await renderFile(file, data, {
			views: [basePath]
		})

		const template = await renderFile(
			templateFile,
			{
				title,
				content
			},
			{
				views: [basePath] // 👈 ВАЖНО
			}
		)

		return juice(template)
	}
}
