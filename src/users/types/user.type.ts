import { Roles } from '../../roles/types/role.type'

export type User = {
	id: string
	login: string
	name: string
	surname: string
	email: string
	created_at: Date
	updated_at: Date
	role: Roles | null
	role_id: string | null
}
