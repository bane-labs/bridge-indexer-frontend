/**
 * Demo Landing Page
 *
 * Overview of the Atlas Showcase demo section.
 * Lists all demo pages and what they demonstrate.
 *
 * @module app/demo/page
 */

import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Database,
  FileText,
  Flag,
  Lock,
  Palette,
  Radio,
} from "lucide-react";
import Link from "next/link";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@atlas/ui";

const demoPages = [
  {
    href: "/demo/auth",
    title: "Authentication",
    icon: Lock,
    description: "Google OAuth sign-in/out with SSR-safe session handling",
    features: ["useSession hook", "Sign in/out flow", "Server-side session", "SSR hydration"],
  },
  {
    href: "/demo/data",
    title: "Data Fetching",
    icon: Database,
    description: "React Query with OpenAPI typed client and app states",
    features: [
      "Loading skeleton",
      "Empty state",
      "Error fallback",
      "Success rendering",
      "Mode switching",
    ],
  },
  {
    href: "/demo/form",
    title: "Forms & Validation",
    icon: FileText,
    description: "React Hook Form with Zod and server error mapping",
    features: [
      "Zod schema validation",
      "Field-level errors",
      "Server validation mapping",
      "Accessible forms",
    ],
  },
  {
    href: "/demo/flags",
    title: "Feature Flags",
    icon: Flag,
    description: "Feature toggles and kill switch patterns",
    features: ["Flag provider", "useFlag hook", "Kill switch guard", "FeatureGuard component"],
  },
  {
    href: "/demo/observability",
    title: "Observability",
    icon: Radio,
    description: "Error tracking with Sentry and structured logging",
    features: ["Error capture", "Correlation ID", "Structured logs", "Dev-safe testing"],
  },
  {
    href: "/demo/a11y-theme",
    title: "A11y & Theming",
    icon: Palette,
    description: "Theme toggle and keyboard navigation patterns",
    features: ["Light/dark/system themes", "Focus visible", "Keyboard navigation", "ARIA patterns"],
  },
];

export default function DemoLandingPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Hero */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Demo</Badge>
          <Badge variant="outline">v1.0</Badge>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Atlas Showcase</h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          This demo section proves that Atlas platform primitives work correctly together. Each page
          demonstrates a specific pattern with real, working code.
        </p>
      </div>

      {/* Important Notice */}
      <Card className="border-amber-500/50 bg-amber-500/5">
        <CardContent className="flex items-start gap-3 py-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-700 dark:text-amber-300" />
          <div className="space-y-1">
            <p className="font-medium">Demo Mode Active</p>
            <p className="text-muted-foreground text-sm">
              All data is mocked with in-memory storage. No external backend is required. Changes
              will reset on page reload.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Demo Pages Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {demoPages.map((page) => {
          const Icon = page.icon;
          return (
            <Link key={page.href} href={page.href} className="block">
              <Card className="hover:border-primary/50 h-full transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                      <Icon className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{page.title}</CardTitle>
                      <CardDescription>{page.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {page.features.map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* What This Proves */}
      <Card>
        <CardHeader>
          <CardTitle>What This Proves</CardTitle>
          <CardDescription>
            The demo section validates that Atlas patterns work end-to-end
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
            <span className="text-sm">Type-safe API contracts with OpenAPI</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
            <span className="text-sm">Consistent loading/error/empty states</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
            <span className="text-sm">SSR-safe auth with hydration</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
            <span className="text-sm">Form validation with server errors</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
            <span className="text-sm">Feature flags with kill switches</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
            <span className="text-sm">Observability with correlation IDs</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
            <span className="text-sm">Accessible, keyboard-navigable UI</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
            <span className="text-sm">Breadcrumbs with nested routing</span>
          </div>
        </CardContent>
      </Card>

      {/* Quick Start */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div>
          <p className="font-medium">Ready to explore?</p>
          <p className="text-muted-foreground text-sm">
            Start with the Auth demo to see session handling in action.
          </p>
        </div>
        <Link href="/demo/auth">
          <Button>
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
