import "server-only";

import pino from "pino";

import { serverConfig } from "@/config/server";
import { redact } from "@/lib/security/redact";

import { getRequestContext } from "./request-context.server";

/**
 * Base fields that MUST be present on every log call
 */
export interface BaseLogFields {
  event: string;
  [key: string]: unknown;
}

/**
 * Create pino logger with redaction and production-safe defaults
 */
const pinoLogger = pino({
  level: serverConfig.logging.level,
  // Structured JSON only - no pretty printing to avoid dependencies issues
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  // Redact sensitive fields
  redact: {
    paths: [
      // Request headers
      "req.headers.authorization",
      "req.headers.cookie",
      "req.headers['x-api-key']",
      // Common secret field names
      "meta.token",
      "meta.password",
      "meta.secret",
      "meta.apiKey",
      "meta.api_key",
      "meta.accessToken",
      "meta.access_token",
      "meta.refreshToken",
      "meta.refresh_token",
      // Body fields that might contain secrets
      "body.password",
      "body.token",
      "body.secret",
      "body.apiKey",
      "body.api_key",
    ],
    remove: true, // Remove entirely, don't replace with [Redacted]
  },
  // Serialize errors safely
  serializers: {
    err: (err: Error) => {
      const serialized: Record<string, unknown> = {
        name: err.name,
        message: err.message,
      };
      // Only include stack traces in non-production
      if (serverConfig.app.env !== "production") {
        serialized.stack = err.stack;
      }
      return serialized;
    },
    error: (err: Error) => {
      const serialized: Record<string, unknown> = {
        name: err.name,
        message: err.message,
      };
      if (serverConfig.app.env !== "production") {
        serialized.stack = err.stack;
      }
      return serialized;
    },
  },
});

/**
 * Merge request context into log fields and apply PII redaction
 */
function withContext(fields: BaseLogFields): BaseLogFields {
  const ctx = getRequestContext();

  // First merge context
  const fieldsWithContext = ctx
    ? {
        ...fields,
        requestId: ctx.requestId,
        ...(ctx.route && { route: ctx.route }),
        ...(ctx.method && { method: ctx.method }),
        ...(ctx.userId && { userId: ctx.userId }),
        ...(ctx.tenantId && { tenantId: ctx.tenantId }),
      }
    : fields;

  // Apply redaction to remove sensitive data
  // Preserve known safe fields and redact the rest
  const redacted = redact(fieldsWithContext) as BaseLogFields;

  // Ensure event field is preserved (it's required)
  if (!redacted.event && fieldsWithContext.event) {
    redacted.event = fieldsWithContext.event;
  }

  return redacted;
}

/**
 * Structured logger with type-safe event requirement
 */
export const log = {
  debug(fields: BaseLogFields, msg?: string): void {
    pinoLogger.debug(withContext(fields), msg);
  },

  info(fields: BaseLogFields, msg?: string): void {
    pinoLogger.info(withContext(fields), msg);
  },

  warn(fields: BaseLogFields, msg?: string): void {
    pinoLogger.warn(withContext(fields), msg);
  },

  error(fields: BaseLogFields, msg?: string): void {
    pinoLogger.error(withContext(fields), msg);
  },
};
