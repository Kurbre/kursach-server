import { Controller, Get, Param } from '@nestjs/common'
import { MailService } from './mail.service'

@Controller('mail')
export class MailController {
	constructor(private readonly mailService: MailService) {}

	@Get(':template')
	renderTemplate(@Param('template') template: string) {
		return this.mailService.getTemplate(template, {
			title: '123',
			username: 'Zmey',
			link: 'https://google.com',
			techLink: 'https://google.com'
		})
	}
}
