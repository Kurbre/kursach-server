import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { BullModule } from '@nestjs/bullmq'
import { authQueueConstant } from '../auth/constants/auth-queue.constant'
import { AuthProcessor } from '../auth/auth.processor'
import { MailModule } from '../mail/mail.module'

@Module({
	controllers: [UsersController],
	providers: [UsersService, AuthProcessor],
	imports: [
		BullModule.registerQueue({ name: authQueueConstant.name }),
		MailModule
	],
	exports: [UsersService]
})
export class UsersModule {}
