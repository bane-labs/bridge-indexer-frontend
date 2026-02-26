# Secrets Rotation Runbook

**Owner**: Platform Engineering  
**Last Updated**: December 25, 2025  
**Review Frequency**: Quarterly or after any security incident

## Overview

This document provides step-by-step procedures for rotating secrets and credentials in Atlas. Follow
these procedures during:

- Scheduled rotation (quarterly recommended)
- Security incidents or suspected compromise
- Team member offboarding with access to secrets
- Compliance requirements

## Secrets Inventory

### 1. Authentication & Authorization

- **OAuth Client Secrets** (GitHub, Google, etc.)

  - Location: Environment variables `OAUTH_*_SECRET`
  - Rotation frequency: Quarterly
  - Impact: OAuth login flow

- **JWT Signing Keys**

  - Location: Environment variable `JWT_SECRET`
  - Rotation frequency: Quarterly (requires dual-key period)
  - Impact: All user sessions

- **Session Secrets**
  - Location: Environment variable `SESSION_SECRET`
  - Rotation frequency: Quarterly
  - Impact: Active sessions

### 2. Database Credentials

- **Database Password**
  - Location: `DATABASE_URL` connection string
  - Rotation frequency: Quarterly
  - Impact: Database connectivity

### 3. External API Keys

- **Sentry Auth Token**

  - Location: `SENTRY_AUTH_TOKEN` (build-time only)
  - Rotation frequency: Annually
  - Impact: Source map uploads

- **Third-party API Keys**
  - Location: Various `*_API_KEY` variables
  - Rotation frequency: Per vendor policy
  - Impact: External service integration

### 4. Infrastructure Secrets

- **Webhook Secrets**

  - Location: `WEBHOOK_SECRET_*`
  - Rotation frequency: Quarterly
  - Impact: Webhook signature verification

- **Encryption Keys**
  - Location: `ENCRYPTION_KEY`
  - Rotation frequency: Annually (requires dual-key period)
  - Impact: Encrypted data at rest

## Standard Rotation Procedure

### Step 1: Generate New Secret

```bash
# Generate a secure random secret (adjust length as needed)
openssl rand -base64 32

# For hex format
openssl rand -hex 32

# For UUID format
uuidgen
```

### Step 2: Update Secret in Secret Manager

Update the secret in your secret management system:

**Vercel/Environment Variables:**

1. Navigate to Project Settings → Environment Variables
2. Edit the target secret
3. Update value with new secret
4. Save (do NOT deploy yet)

**AWS Secrets Manager:**

```bash
aws secretsmanager update-secret \
  --secret-id atlas/prod/jwt-secret \
  --secret-string "new-secret-value"
```

**Other Platforms:**

- Follow your platform's secret update procedure
- Do NOT immediately deploy/restart services

### Step 3: Deploy with Dual-Read Window (if applicable)

**For secrets that support dual-key validation** (JWT, webhooks, encryption):

1. Keep old secret temporarily
2. Add new secret alongside (e.g., `JWT_SECRET_NEW`)
3. Update code to accept both secrets during validation
4. Deploy to production
5. Monitor for errors over 24-48 hours
6. Remove old secret after confirmation

**For secrets that do NOT support dual-key** (database passwords, OAuth):

1. Schedule maintenance window if needed
2. Deploy new secret
3. Verify immediately (health checks, auth flows)
4. Rollback capability ready

### Step 4: Verify New Secret

Run verification checks:

```bash
# Health check
curl https://atlas.example.com/api/health

# Authentication flow (if rotating auth secrets)
# Test login/logout flows manually

# External integrations (if rotating API keys)
# Verify webhook deliveries, API calls succeed
```

Monitor:

- Application logs for authentication errors
- Sentry for secret-related exceptions
- Health check endpoints
- User-reported issues

### Step 5: Revoke Old Secret

**CRITICAL**: Only proceed after verification passes.

1. Remove old secret from secret manager
2. Update documentation with rotation date
3. Record in security audit log

Example log entry:

```
Date: 2025-12-25
Secret: JWT_SECRET
Action: Rotated
Reason: Quarterly rotation
Performed by: alice@example.com
Verification: Health checks passed
Old secret revoked: Yes
```

### Step 6: Update Documentation

Update the following:

- [ ] This runbook (last rotation date)
- [ ] Team wiki or internal docs
- [ ] Compliance/audit records
- [ ] Access logs

## Emergency Rotation (Leaked Secret)

**If a secret is leaked or suspected of compromise**, follow this expedited procedure:

### Immediate Actions (Within 1 hour)

1. **Confirm the leak**

   - Screenshot/document evidence
   - Identify which secret(s) are exposed
   - Determine exposure duration

2. **Generate new secret** (see Step 1 above)

3. **Update and deploy immediately**

   - Skip dual-read window unless critical
   - Deploy to all environments simultaneously
   - Accept potential downtime over security risk

4. **Revoke old secret**

   - Immediately revoke compromised secret
   - Block any suspicious activity using the old secret

5. **Notify stakeholders**
   - Security team
   - On-call engineer
   - Management (if data exposure risk)

### Post-Incident Actions (Within 24 hours)

1. **Audit access logs**

   - Check for unauthorized access using leaked secret
   - Identify affected users/data

2. **Document incident**

   - Timeline of events
   - Root cause analysis
   - Actions taken

3. **Review exposure**

   - Where was secret leaked? (logs, git history, screenshots)
   - Remove from all locations (GitHub, Slack, etc.)

4. **Prevent recurrence**
   - Update logging redaction rules
   - Review team training needs
   - Improve secret scanning automation

## Dual-Key Pattern (Advanced)

For high-availability secrets (JWT, encryption keys), use dual-key rotation:

### Example: JWT Secret Rotation

```typescript
// Before rotation
const JWT_SECRET = process.env.JWT_SECRET;

// During rotation (dual-read period)
const JWT_SECRET_CURRENT = process.env.JWT_SECRET;
const JWT_SECRET_NEXT = process.env.JWT_SECRET_NEXT;

function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET_CURRENT);
  } catch {
    // Fallback to new secret
    return jwt.verify(token, JWT_SECRET_NEXT);
  }
}

// Always sign with new secret
function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET_NEXT || JWT_SECRET_CURRENT);
}
```

**Timeline:**

1. Day 0: Add `JWT_SECRET_NEXT`, deploy dual-read code
2. Day 1-7: Monitor (both secrets work)
3. Day 7: Promote `JWT_SECRET_NEXT` → `JWT_SECRET`
4. Day 7: Remove old secret

## Secret-Specific Procedures

### OAuth Client Secret

1. Navigate to OAuth provider (GitHub, Google, etc.)
2. Generate new client secret
3. Update `OAUTH_*_SECRET` environment variable
4. Deploy (no dual-key needed)
5. Verify login flow works
6. Delete old secret from provider

### Database Password

**CRITICAL**: Requires coordination with database team.

1. Create new database user or update password:
   ```sql
   ALTER USER atlas_app WITH PASSWORD 'new-password';
   ```
2. Update `DATABASE_URL` with new password
3. Deploy immediately (minimize window)
4. Verify database connectivity via health checks
5. Remove old password (if new user created)

### Webhook Secrets

1. Contact webhook provider for new secret
2. Update `WEBHOOK_SECRET_*` environment variable
3. Update webhook signature verification code (dual-key if possible)
4. Deploy and verify webhook deliveries
5. Confirm old secret is deactivated with provider

## Automation

**Recommended tooling:**

- Secret scanning: `gitleaks`, `truffleHog`
- Secret management: Vault, AWS Secrets Manager, Doppler
- Rotation automation: Custom scripts, AWS Secrets Manager auto-rotation

**Future enhancements:**

- Automated quarterly rotation reminders
- Automated secret expiry checks
- Rotation testing in CI/CD

## Compliance Notes

- SOC 2: Document all rotations in audit log
- PCI DSS: Rotate every 90 days minimum
- HIPAA: Document access to secrets
- ISO 27001: Regular rotation schedule required

## Emergency Contacts

- **Security Team**: security@example.com
- **On-call Engineer**: PagerDuty escalation
- **Platform Lead**: platform-lead@example.com

## Appendix: Common Mistakes

❌ **Don't:**

- Rotate secrets without verification plan
- Delete old secret before new one is verified
- Commit secrets to git (even temporarily)
- Share secrets via Slack/email (use secret manager links)
- Rotate everything at once (stagger for safety)

✅ **Do:**

- Test rotation procedure in staging first
- Document rotation date and owner
- Monitor for 24-48 hours after rotation
- Use dual-key pattern when possible
- Automate where feasible
