import { UseGuards } from '@nestjs/common'
import { AuthGuard } from '../guard/auth.guard'

export const Auth = () => UseGuards(AuthGuard)
