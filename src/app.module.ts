import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { DatabaseModule } from './database/database.module'
import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.module'
import { JwtModule } from '@nestjs/jwt'
import { jwtConfig } from './config/jwt.config'
import { MailModule } from './mail/mail.module'
import { RedisModule } from './redis/redis.module'
import { BullModule } from '@nestjs/bullmq'
import { bullMQConfig } from './config/bull-mq.config'
import { BrandsModule } from './brands/brands.module';
import { RolesModule } from './roles/roles.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true
		}),
		JwtModule.registerAsync({
			global: true,
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: jwtConfig
		}),
		BullModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: bullMQConfig
		}),
		DatabaseModule,
		UsersModule,
		AuthModule,
		MailModule,
		RedisModule,
		BrandsModule,
		RolesModule
	],
	controllers: [],
	providers: []
})
export class AppModule {}
