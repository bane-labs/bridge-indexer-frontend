# Security Baseline

**Status**: ✅ Implemented  
**Last Updated**: December 25, 2025  
**Owner**: Platform Engineering

## Overview

Atlas implements a comprehensive security baseline covering:

- Security headers (prevent common web vulnerabilities)
- Content Security Policy (CSP) with nonce-based inline script protection
- PII-safe logging with automatic redaction
- Secrets rotation procedures

This baseline provides **sane defaults** with **documented escape hatches** for legitimate use
cases.

## Table of Contents

1. [Security Headers](#security-headers)
2. [Content Security Policy (CSP)](#content-security-policy-csp)
3. [PII-Safe Logging](#pii-safe-logging)
4. [Secrets Management](#secrets-management)
5. [Configuration](#configuration)
6. [Common Patterns](#common-patterns)
7. [Troubleshooting](#troubleshooting)

---

## Security Headers

### What We Protect Against

Atlas sets baseline security headers on all responses to defend against:

| Header                                             | Protection                      | Impact                                                           |
| -------------------------------------------------- | ------------------------------- | ---------------------------------------------------------------- |
| `X-Content-Type-Options: nosniff`                  | MIME sniffing attacks           | Prevents browsers from interpreting files as different MIME type |
| `Referrer-Policy: strict-origin-when-cross-origin` | Information leakage via Referer | Limits referrer info to origin only for cross-origin requests    |
| `Permissions-Policy`                               | Unauthorized API access         | Blocks camera, microphone, geolocation, payment APIs by default  |
| `X-Frame-Options: DENY`                            | Clickjacking                    | Prevents embedding in iframes                                    |
| `Strict-Transport-Security` (HSTS)                 | Protocol downgrade attacks      | Forces HTTPS (production only)                                   |
| `Cross-Origin-Opener-Policy: same-origin`          | Cross-origin attacks            | Isolates browsing context                                        |
| `Cross-Origin-Resource-Policy: same-site`          | Resource timing attacks         | Prevents cross-origin resource access                            |

### Implementation

Headers are configured in [next.config.js](../apps/web/next.config.js):

```javascript
async headers() {
  const enableHSTS = process.env.ENABLE_HSTS === "true" && process.env.NODE_ENV === "production";

  return [
    {
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        // ... other headers
      ],
    },
  ];
}
```

### Escape Hatches

**Need to embed a page in an iframe?**

For specific routes (e.g., `/embed/*`), you can override `X-Frame-Options` in middleware:

```typescript
// apps/web/src/middleware.ts
if (pathname.startsWith("/embed/")) {
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  // Or allow specific origin:
  // response.headers.delete("X-Frame-Options");
  // Use CSP frame-ancestors instead for fine-grained control
}
```

**Need to allow specific APIs in Permissions-Policy?**

Update the header in [next.config.js](../apps/web/next.config.js):

```javascript
{
  key: "Permissions-Policy",
  value: "camera=(self), microphone=(), geolocation=()" // Allow camera for self
}
```

### HSTS Configuration

HSTS is **only enabled in production** when `ENABLE_HSTS=true`:

```bash
# .env.production
ENABLE_HSTS=true  # Only if HTTPS is guaranteed
```

⚠️ **Warning**: Enabling HSTS requires:

- Valid SSL certificate
- All subdomains on HTTPS (if using `includeSubDomains`)
- Commitment to HTTPS (max-age is 1 year)

---

## Content Security Policy (CSP)

### What is CSP?

CSP is a security layer that helps detect and mitigate certain types of attacks:

- Cross-Site Scripting (XSS)
- Data injection attacks
- Clickjacking

### CSP Modes

Atlas supports three CSP modes:

| Mode          | Behavior                         | Use Case                         |
| ------------- | -------------------------------- | -------------------------------- |
| `off`         | No CSP header                    | Debugging only (not recommended) |
| `report-only` | Violations reported, not blocked | Development, staging             |
| `enforce`     | Violations blocked               | Production                       |

**Default behavior:**

- **Production**: `enforce` (violations blocked)
- **Development/Staging**: `report-only` (violations logged, not blocked)

### Implementation

CSP is generated per-request in [middleware.ts](../apps/web/src/middleware.ts):

```typescript
const nonce = crypto.randomUUID().replace(/-/g, "");
const csp = buildCSP({
  mode: "enforce",
  nonce,
  env: "production",
  allowlist: {
    scriptSrc: ["https://www.googletagmanager.com"],
    connectSrc: ["https://api.example.com"],
  },
});
response.headers.set("Content-Security-Policy", csp);
```

### Baseline Policy

```csp
default-src 'self';
script-src 'self' 'nonce-{RANDOM}';
style-src 'self' 'nonce-{RANDOM}' 'unsafe-inline';
img-src 'self' data: https:;
connect-src 'self';
font-src 'self' data: https:;
frame-src 'self';
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
object-src 'none';
```

### Using Nonces in Components

**Server Components:**

```tsx
import { getNonce } from "@/lib/security/nonce";
import Script from "next/script";

export default async function Page() {
  const nonce = await getNonce();

  return (
    <Script
      id="analytics"
      nonce={nonce}
      dangerouslySetInnerHTML={{
        __html: `
          window.dataLayer = window.dataLayer || [];
          gtag('config', 'GA-XXXXX');
        `,
      }}
    />
  );
}
```

**Client Components:**

Client components cannot access nonce directly. Use one of these patterns:

1. Pass nonce from parent server component as prop
2. Load scripts from external files (preferred)
3. Use `next/script` with `strategy="afterInteractive"` (works with CSP)

### Common Patterns

#### Adding Analytics (Google Analytics, Plausible, etc.)

```bash
# .env
CSP_SCRIPT_SRC=https://www.googletagmanager.com,https://www.google-analytics.com
CSP_CONNECT_SRC=https://www.google-analytics.com
```

Then use nonce in server component:

```tsx
import { getNonce } from "@/lib/security/nonce";
import Script from "next/script";

export default async function AnalyticsProvider({ children }) {
  const nonce = await getNonce();

  return (
    <>
      <Script
        id="gtag-base"
        strategy="afterInteractive"
        nonce={nonce}
        src="https://www.googletagmanager.com/gtag/js?id=GA-XXXXX"
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA-XXXXX');
          `,
        }}
      />
      {children}
    </>
  );
}
```

#### Adding External Images (CDN, user avatars)

External images from HTTPS sources work by default (`img-src 'self' data: https:`).

For specific domains:

```bash
# .env
CSP_IMG_SRC=https://cdn.example.com,https://avatars.githubusercontent.com
```

#### Embedding Content (YouTube, Vimeo, etc.)

```bash
# .env
CSP_FRAME_SRC=https://www.youtube.com,https://player.vimeo.com
```

#### Allowing Embedding (be cautious!)

By default, Atlas blocks embedding (`frame-ancestors 'none'`).

To allow specific parent sites:

```bash
# .env
CSP_FRAME_ANCESTORS=https://trusted-partner.com
```

⚠️ **Security Note**: Only allow trusted domains. This opens clickjacking risk.

### CSP Violation Reporting

Enable violation reporting to catch CSP issues:

```bash
# .env
CSP_REPORT_URI=/api/csp-report
```

Then create the endpoint:

```typescript
// apps/web/src/app/api/csp-report/route.ts
import { log } from "@/lib/logging/logger.server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const report = await request.json();

    log.warn(
      {
        event: "csp_violation",
        report,
      },
      "CSP violation detected"
    );

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid report" }, { status: 400 });
  }
}
```

---

## PII-Safe Logging

### What is PII?

Personally Identifiable Information (PII) includes:

- Passwords, tokens, API keys
- Credit card numbers, SSN
- Email addresses (context-dependent)
- Session cookies
- Authorization headers

### Automatic Redaction

All logs automatically redact sensitive data via
[redact.ts](../apps/web/src/lib/security/redact.ts):

```typescript
import { log } from "@/lib/logging/logger.server";

// This object contains sensitive data
const user = {
  userId: "123",
  email: "user@example.com",
  password: "hunter2", // ⚠️ Sensitive
  apiKey: "sk_test_xxxxx", // ⚠️ Sensitive
};

log.info({ event: "user_created", user }, "User created");

// Actual log output (password and apiKey removed):
// {
//   "event": "user_created",
//   "user": {
//     "userId": "123",
//     "email": "user@example.com"
//   }
// }
```

### Redacted Keys (case-insensitive)

The following keys are automatically removed:

- Authentication: `password`, `secret`, `token`, `accessToken`, `apiKey`, `authorization`, `bearer`
- Session: `cookie`, `session`, `csrf`
- Payment: `creditCard`, `cvv`, `pan`, `accountNumber`
- PII: `ssn`, `passport`, `driverLicense`, `aadhar`

**Full list**: See [redact.ts](../apps/web/src/lib/security/redact.ts#L16-L71)

### Pattern-Based Redaction

Values matching these patterns are removed regardless of key name:

- Bearer tokens: `Bearer eyJhbGc...`
- JWTs: `eyJhbGciOiJIUzI1NiIs...`
- API keys: `sk_live_...`, `ghp_...`

### Safe Logging Practices

✅ **Do:**

```typescript
log.info(
  {
    event: "payment_processed",
    userId: "123", // User ID is fine
    amount: 99.99,
    currency: "USD",
    paymentMethod: "card_****1234", // Last 4 digits only
  },
  "Payment successful"
);
```

❌ **Don't:**

```typescript
log.info({
  event: "payment_processed",
  cardNumber: "4242424242424242", // ❌ Will be redacted
  cvv: "123", // ❌ Will be redacted
  token: "tok_abc123", // ❌ Will be redacted
});
```

### Email Addresses and Phone Numbers

**Current policy**: Email addresses are **not** redacted by default (considered identifiers, not
secrets).

If your compliance requirements demand email redaction:

```typescript
// apps/web/src/lib/security/redact.ts
const SENSITIVE_KEYS = new Set([
  // ... existing keys
  "email", // Add this
  "phone",
  "phonenumber",
  "phone_number",
]);
```

### Debugging Safely

**Development environment:**

```typescript
if (serverConfig.app.env !== "production") {
  console.log("Debug data:", sensitiveData); // OK in dev
}
```

**Testing redaction:**

```typescript
import { redact, containsSensitiveData } from "@/lib/security/redact";

const data = { password: "test123" };
console.log(containsSensitiveData(data)); // true
console.log(redact(data)); // {}
```

---

## Secrets Management

### Where Secrets Live

Atlas uses environment variables for secrets:

- **Local**: `.env.local` (gitignored)
- **Vercel**: Project Settings → Environment Variables
- **Other platforms**: Platform-specific secret manager

### Rotation Procedures

**See**: [SECRETS_ROTATION.md](./SECRETS_ROTATION.md) for complete procedures.

**Quick reference:**

1. Generate new secret: `openssl rand -base64 32`
2. Update in secret manager (don't deploy yet)
3. Deploy with dual-read window if possible
4. Verify new secret works
5. Revoke old secret
6. Document rotation

**Rotation frequency:**

- OAuth secrets: Quarterly
- JWT signing keys: Quarterly (use dual-key pattern)
- Database passwords: Quarterly
- API keys: Per vendor policy

### Emergency Rotation

If a secret is leaked:

1. Generate new secret immediately
2. Deploy and revoke old secret (accept downtime if needed)
3. Audit access logs
4. Document incident
5. Review prevention measures

---

## Configuration

### Environment Variables

**Security Headers:**

```bash
# Enable HSTS (production only, requires HTTPS)
ENABLE_HSTS=true
```

**CSP Configuration:**

```bash
# CSP mode: off | report-only | enforce
# Default: report-only (dev/staging), enforce (production)
CSP_MODE=enforce

# CSP violation reporting endpoint
CSP_REPORT_URI=/api/csp-report

# Additional allowed sources (comma-separated)
CSP_SCRIPT_SRC=https://www.googletagmanager.com,https://cdn.example.com
CSP_CONNECT_SRC=https://api.example.com,https://analytics.example.com
CSP_IMG_SRC=https://cdn.example.com,https://images.example.com
CSP_FONT_SRC=https://fonts.googleapis.com,https://fonts.gstatic.com
CSP_STYLE_SRC=https://fonts.googleapis.com
CSP_FRAME_SRC=https://www.youtube.com,https://player.vimeo.com

# Allow embedding (default: none)
CSP_FRAME_ANCESTORS=https://trusted-partner.com
```

### Default Values

If not specified, Atlas uses smart defaults:

| Variable              | Default (Dev) | Default (Prod)        |
| --------------------- | ------------- | --------------------- |
| `CSP_MODE`            | `report-only` | `enforce`             |
| `ENABLE_HSTS`         | `false`       | `false` (must opt-in) |
| `CSP_FRAME_ANCESTORS` | `'none'`      | `'none'`              |

---

## Common Patterns

### Pattern 1: Add Third-Party Script

**Example**: Adding Google Analytics

1. Add domains to CSP allowlist:

   ```bash
   CSP_SCRIPT_SRC=https://www.googletagmanager.com
   CSP_CONNECT_SRC=https://www.google-analytics.com
   ```

2. Use nonce in server component:

   ```tsx
   import { getNonce } from "@/lib/security/nonce";
   import Script from "next/script";

   export default async function Layout({ children }) {
     const nonce = await getNonce();
     return (
       <>
         <Script nonce={nonce} src="https://www.googletagmanager.com/gtag/js?id=GA-X" />
         {children}
       </>
     );
   }
   ```

### Pattern 2: Allow External Images

External images work by default (CSP allows `https:`), but you can restrict:

```bash
# Only allow specific image CDNs
CSP_IMG_SRC=https://cdn.example.com,https://images.example.com
```

### Pattern 3: Embed YouTube Videos

```bash
CSP_FRAME_SRC=https://www.youtube.com,https://www.youtube-nocookie.com
```

```tsx
<iframe
  src="https://www.youtube.com/embed/VIDEO_ID"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowFullScreen
/>
```

### Pattern 4: Create Embeddable Route

For `/embed/*` routes that need to be embedded:

```typescript
// apps/web/src/middleware.ts
export function middleware(request: NextRequest) {
  // ... existing code ...

  if (pathname.startsWith("/embed/")) {
    // Allow embedding for this route
    response.headers.delete("X-Frame-Options");
    // Or use CSP frame-ancestors for more control
  }

  return response;
}
```

### Pattern 5: API Webhook Route

Webhook routes often need relaxed CORS/CSP:

```bash
# Allow webhook source
CSP_CONNECT_SRC=https://webhook-provider.com
```

---

## Troubleshooting

### CSP Violations in Browser Console

**Symptom**: Console shows "Refused to load script" or "Refused to connect to"

**Solution**:

1. Check browser console for exact violation
2. Add required domain to appropriate CSP directive:
   - Scripts: `CSP_SCRIPT_SRC`
   - API calls: `CSP_CONNECT_SRC`
   - Images: `CSP_IMG_SRC`
   - Fonts: `CSP_FONT_SRC`
   - Iframes: `CSP_FRAME_SRC`

**Example**:

```
Refused to load script from 'https://cdn.example.com/script.js' because it violates the following CSP directive: "script-src 'self' 'nonce-abc123'".
```

Fix:

```bash
CSP_SCRIPT_SRC=https://cdn.example.com
```

### Inline Scripts Not Working

**Symptom**: Inline `<script>` tags are blocked

**Solution**: Use nonce or move to external file

```tsx
// ❌ Blocked
<script>console.log('hello');</script>

// ✅ With nonce (server component only)
import { getNonce } from "@/lib/security/nonce";

const nonce = await getNonce();
<script nonce={nonce}>console.log('hello');</script>

// ✅ External file (preferred)
<Script src="/scripts/my-script.js" />
```

### HSTS Causing Localhost Issues

**Symptom**: Can't access `http://localhost` after enabling HSTS on that domain

**Solution**: Clear HSTS cache

- Chrome: `chrome://net-internals/#hsts` → Delete domain
- Firefox: Clear browsing data → Active logins

**Prevention**: Never enable HSTS on `localhost` or non-HTTPS domains.

### Logs Missing Expected Data

**Symptom**: Logged object is missing fields

**Solution**: Check if field name is in redaction list

```typescript
import { containsSensitiveData } from "@/lib/security/redact";

const data = { password: "test" };
console.log(containsSensitiveData(data)); // true - will be redacted
```

If a safe field is being redacted incorrectly, update
[redact.ts](../apps/web/src/lib/security/redact.ts).

### CSP Breaking Third-Party Widget

**Symptom**: Embedded widget (chat, forms) not loading

**Solution**: Add widget's domains to CSP

1. Open browser console to see violations
2. Add domains to appropriate directives:
   ```bash
   CSP_SCRIPT_SRC=https://widget.example.com
   CSP_FRAME_SRC=https://widget.example.com
   CSP_CONNECT_SRC=https://api.widget.example.com
   ```

**Alternative**: If widget is incompatible with CSP, consider:

- Contact vendor for CSP-compatible version
- Use iframe isolation (widget runs in separate domain)
- Temporarily use `report-only` mode while investigating

---

## Testing

### Verify Security Headers

```bash
# Check headers on production
curl -I https://atlas.example.com

# Should include:
# X-Content-Type-Options: nosniff
# Referrer-Policy: strict-origin-when-cross-origin
# Content-Security-Policy: default-src 'self'; ...
```

### Verify CSP Nonce Changes

```bash
# Make two requests, check nonce is different
curl -I https://atlas.example.com | grep "Content-Security-Policy"
curl -I https://atlas.example.com | grep "Content-Security-Policy"
```

### Test Redaction

```typescript
import { log } from "@/lib/logging/logger.server";

log.info(
  {
    event: "test_redaction",
    userId: "123",
    password: "should-not-appear",
    token: "should-not-appear",
  },
  "Testing redaction"
);

// Check logs - password and token should be gone
```

---

## References

- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [MDN Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Next.js Security Headers](https://nextjs.org/docs/app/api-reference/next-config-js/headers)
- [SECRETS_ROTATION.md](./SECRETS_ROTATION.md) - Secrets rotation procedures

---

## Compliance Notes

This security baseline helps meet requirements for:

- **SOC 2**: Security controls, audit logging
- **PCI DSS**: Secrets rotation, logging redaction
- **GDPR**: PII redaction in logs
- **HIPAA**: Access controls, encryption enforcement

Consult your compliance team for specific requirements.
