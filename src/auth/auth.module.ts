import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { UsersModule } from '../users/users.module'
import { JwtStrategy } from './strategies/jwt.strategy'
import { BullModule } from '@nestjs/bullmq'
import { AuthProcessor } from './auth.processor'
import { authQueueConstant } from './constants/auth-queue.constant'
import { MailModule } from '../mail/mail.module'

@Module({
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy, AuthProcessor],
	imports: [
		BullModule.registerQueue({ name: authQueueConstant.name }),
		UsersModule,
		MailModule
	]
})
export class AuthModule {}
