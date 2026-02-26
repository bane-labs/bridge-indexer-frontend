/**
 * CSP Nonce Helper for Server Components
 *
 * Provides access to the per-request CSP nonce for use in server components.
 * The nonce is generated in middleware and passed via request headers.
 *
 * @module lib/security/nonce
 */

import { headers } from "next/headers";

/**
 * Get the CSP nonce for the current request
 *
 * Use this in server components to get the nonce for inline scripts/styles.
 * The nonce is generated per-request in middleware.
 *
 * @returns CSP nonce or undefined if not available
 *
 * @example Server component with inline script
 * ```tsx
 * import { getNonce } from '@/lib/security/nonce';
 *
 * export default async function Page() {
 *   const nonce = await getNonce();
 *
 *   return (
 *     <div>
 *       <script nonce={nonce} dangerouslySetInnerHTML={{
 *         __html: `console.log('Hello from inline script');`
 *       }} />
 *     </div>
 *   );
 * }
 * ```
 *
 * @example With Next.js Script component
 * ```tsx
 * import Script from 'next/script';
 * import { getNonce } from '@/lib/security/nonce';
 *
 * export default async function Page() {
 *   const nonce = await getNonce();
 *
 *   return (
 *     <div>
 *       <Script
 *         id="analytics"
 *         nonce={nonce}
 *         dangerouslySetInnerHTML={{
 *           __html: `
 *             window.dataLayer = window.dataLayer || [];
 *             // ... analytics code
 *           `
 *         }}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */
export async function getNonce(): Promise<string | undefined> {
  const headersList = await headers();
  return headersList.get("x-nonce") ?? undefined;
}
