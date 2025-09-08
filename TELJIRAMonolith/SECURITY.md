# Security Notes

- Configure JWT secret (JWT_SECRET) with a long random value. Rotate periodically.
- Enforce HTTPS in production and set secure cookies if used.
- Enable MFA (MFA_ENABLED=true) to require TOTP at login for users with mfa_enabled=true.
- RBAC is enforced via permissions/roles. Limit admin roles to few users.
- Validate all inputs with Joi. Extend schemas when adding fields.
- Apply database SSL if your provider requires it (PG_SSL=true).
- Keep dependencies up to date and run npm audit regularly.
