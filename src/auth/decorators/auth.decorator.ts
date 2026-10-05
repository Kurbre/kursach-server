import { UseGuards } from '@nestjs/common'
import { AuthGuard } from '../guard/auth.guard'
import { RolesGuard } from '../../roles/guards/roles.guard'

export const Auth = () => UseGuards(AuthGuard, RolesGuard)
