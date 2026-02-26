import Link from "next/link";

import { Button } from "@atlas/ui";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <main className="container flex max-w-md flex-col items-center justify-center gap-8 px-4 py-16">
        <div className="w-full space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Sign In</h1>
            <p className="text-muted-foreground">Enter your credentials to access your account</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="w-full rounded-md border px-3 py-2"
                disabled
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="w-full rounded-md border px-3 py-2"
                disabled
              />
            </div>

            <Button className="w-full" disabled>
              Sign In
            </Button>
          </div>

          <p className="text-muted-foreground text-center text-sm">
            This is a demo page for performance testing.
          </p>

          <div className="text-center">
            <Link href="/" className="text-primary text-sm hover:underline">
              ← Back to home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
