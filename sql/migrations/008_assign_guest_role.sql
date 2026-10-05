INSERT INTO roles (name)
VALUES ('guest')
ON CONFLICT (name) DO NOTHING;

UPDATE users
SET role_id = (SELECT id FROM roles WHERE name = 'guest')
WHERE role_id IS NULL;
