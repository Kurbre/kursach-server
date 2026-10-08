import { ApiProperty } from '@nestjs/swagger'

export class DeleteRoleResponse {
	@ApiProperty({ example: true })
	success: boolean
}
