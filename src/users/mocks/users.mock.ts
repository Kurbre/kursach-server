import { Roles } from '../../roles/types/role.type'

export const mockUser = {
	id: '123',
	email: 'test@gmail.com',
	login: 'test',
	name: 'John',
	surname: 'Doe',
	role_id: 'role-123',
	role: Roles.GUEST,
	created_at: new Date(),
	updated_at: new Date()
}
