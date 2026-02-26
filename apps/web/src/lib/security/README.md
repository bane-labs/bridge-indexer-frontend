# Security Module

Security utilities for Atlas web application.

## Overview

This module provides security primitives for:

- Content Security Policy (CSP) generation with nonce support
- Security headers management
- PII and secrets redaction for logging
- Nonce access for server components

## Module Structure

```
lib/security/
├── index.ts              # Public API exports
├── csp.ts                # CSP header builder
├── headers.ts            # Security headers configuration
├── nonce.ts              # CSP nonce helper for server components
├── redact.ts             # PII/secrets redaction utilities
└── __tests__/
    └── redact.test.ts    # Redaction unit tests
```

## Usage

### Content Security Policy

Generate CSP headers with per-request nonces:

```typescript
import { buildCSP, getCSPHeaderName } from "@/lib/security";

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

### Security Headers

Get baseline security headers:

```typescript
import { getSecurityHeaders } from "@/lib/security";

const headers = getSecurityHeaders({
  enableHSTS: process.env.NODE_ENV === "production",
});

// Returns:
// {
//   "X-Content-Type-Options": "nosniff",
//   "Referrer-Policy": "strict-origin-when-cross-origin",
//   ...
// }
```

### CSP Nonce in Components

Access nonce in server components:

```typescript
import { getNonce } from "@/lib/security";
import Script from "next/script";

export default async function Page() {
  const nonce = await getNonce();

  return (
    <Script
      id="analytics"
      nonce={nonce}
      dangerouslySetInnerHTML={{
        __html: `console.log('Analytics loaded');`,
      }}
    />
  );
}
```

### PII Redaction

Automatically redact sensitive data from logs:

```typescript
import { redact } from "@/lib/security";

const data = {
  userId: "123",
  email: "user@example.com",
  password: "secret123", // ⚠️ Sensitive
  apiKey: "sk_live_abc", // ⚠️ Sensitive
};

const safe = redact(data);
// { userId: "123", email: "user@example.com" }
```

Check for sensitive data:

```typescript
import { containsSensitiveData } from "@/lib/security";

const data = { password: "test" };
console.log(containsSensitiveData(data)); // true
```

Redact strings (log messages, queries):

```typescript
import { redactString } from "@/lib/security";

const msg = "Authorization: Bearer abc123";
console.log(redactString(msg));
// "Authorization: [REDACTED]"
```

## Integration Points

### Middleware (`src/middleware.ts`)

- Generates per-request CSP nonce
- Sets CSP header based on environment
- Passes nonce to server components via `x-nonce` header

### Logger (`src/lib/logging/logger.server.ts`)

- Automatically redacts all logged objects
- Removes passwords, tokens, API keys, etc.
- Preserves safe identifiers (userId, requestId)

### Next.js Config (`next.config.js`)

- Sets baseline security headers for all routes
- HSTS header (production only)
- X-Frame-Options, COOP, CORP headers

## Configuration

See [.env.example](../../.env.example) and [docs/SECURITY.md](../../../docs/SECURITY.md) for:

- CSP mode configuration
- HSTS enablement
- Allowlisted domains for analytics, CDNs, etc.

## Testing

```bash
pnpm test --testPathPattern=redact.test.ts
```

## References

- [SECURITY.md](../../../docs/SECURITY.md) - Complete security documentation
- [SECRETS_ROTATION.md](../../../docs/SECRETS_ROTATION.md) - Secrets rotation procedures
- [OWASP Secure Headers](https://owasp.org/www-project-secure-headers/)
- [MDN CSP Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
