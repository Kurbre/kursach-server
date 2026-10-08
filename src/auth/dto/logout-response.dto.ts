import { ApiProperty } from '@nestjs/swagger'

export class LogoutResponse {
	@ApiProperty({ example: true })
	success: boolean

	@ApiProperty({
		example: 'You have successfully logged out of your account.'
	})
	message: string
}
