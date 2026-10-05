import { Module } from '@nestjs/common'
import { RolesService } from './roles.service'
import { RolesController } from './roles.controller'
import { RolesGuard } from './guards/roles.guard'

@Module({
	controllers: [RolesController],
	providers: [RolesService, RolesGuard],
	exports: [RolesGuard]
})
export class RolesModule {}
