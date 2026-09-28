CREATE TABLE user_oauth_accounts (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

	user_id UUID NOT NULL
		REFERENCES users(id)
		ON DELETE CASCADE,

	provider VARCHAR(30) NOT NULL,

	provider_account_id VARCHAR(255) NOT NULL,

	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

	UNIQUE(provider, provider_account_id),

	UNIQUE(user_id, provider)
);