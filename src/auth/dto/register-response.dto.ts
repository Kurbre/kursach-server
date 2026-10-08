import { ApiProperty } from '@nestjs/swagger'

export class RegisterResponse {
	@ApiProperty({ example: true })
	success: boolean

	@ApiProperty({
		example:
			'Check your email, you should receive a registration confirmation email.'
	})
	message: string
}
