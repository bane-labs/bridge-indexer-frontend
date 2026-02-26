"use client";

/**
 * A11y & Theme Demo Page
 *
 * Demonstrates Atlas accessibility and theming patterns:
 * - Theme toggle (light/dark/system)
 * - Keyboard navigation
 * - Focus visible states
 * - ARIA patterns
 *
 * @module app/demo/a11y-theme/page
 */

import { Check, Keyboard, Moon, Palette, Sun, SunMoon } from "lucide-react";
import { useRef, useState } from "react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  ThemeToggle,
  useTheme,
} from "@atlas/ui";

function ThemeIcon({ theme }: { theme: string }) {
  switch (theme) {
    case "light":
      return <Sun className="h-4 w-4" />;
    case "dark":
      return <Moon className="h-4 w-4" />;
    default:
      return <SunMoon className="h-4 w-4" />;
  }
}

export default function A11yThemeDemoPage() {
  const { preference, resolvedTheme, setPreference } = useTheme();
  const [focusedItem, setFocusedItem] = useState<number | null>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Keyboard navigation items
  const navItems = [
    { id: 1, label: "Dashboard" },
    { id: 2, label: "Projects" },
    { id: 3, label: "Settings" },
    { id: 4, label: "Help" },
  ];

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let newIndex: number | null = null;

    switch (e.key) {
      case "ArrowDown":
      case "ArrowRight":
        e.preventDefault();
        newIndex = (index + 1) % navItems.length;
        break;
      case "ArrowUp":
      case "ArrowLeft":
        e.preventDefault();
        newIndex = (index - 1 + navItems.length) % navItems.length;
        break;
      case "Home":
        e.preventDefault();
        newIndex = 0;
        break;
      case "End":
        e.preventDefault();
        newIndex = navItems.length - 1;
        break;
    }

    if (newIndex !== null) {
      itemRefs.current[newIndex]?.focus();
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">A11y & Theme Demo</h1>
        <p className="text-muted-foreground">
          Demonstrates accessibility patterns and theming with light/dark/system modes.
        </p>
      </div>

      {/* Theme Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme Selection
          </CardTitle>
          <CardDescription>Toggle between light, dark, and system themes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Theme Status */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Current Theme</p>
              <p className="text-muted-foreground text-sm">
                Preference: <span className="capitalize">{preference}</span> → Resolved:{" "}
                <span className="capitalize">{resolvedTheme}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeIcon theme={resolvedTheme || "system"} />
              <Badge variant="secondary" className="capitalize">
                {resolvedTheme}
              </Badge>
            </div>
          </div>

          {/* Theme Buttons */}
          <div className="flex flex-wrap gap-3">
            {(["light", "dark", "system"] as const).map((t) => (
              <Button
                key={t}
                variant={preference === t ? "default" : "outline"}
                onClick={() => setPreference(t)}
                className="capitalize"
              >
                <ThemeIcon theme={t} />
                <span className="ml-2">{t}</span>
                {preference === t && <Check className="ml-2 h-4 w-4" />}
              </Button>
            ))}
          </div>

          {/* Built-in Toggle */}
          <div className="flex items-center gap-4">
            <span className="text-sm">Or use the built-in toggle:</span>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      {/* Keyboard Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Navigation
          </CardTitle>
          <CardDescription>
            Use arrow keys to navigate between items. Try Tab, Arrow keys, Home, and End.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Navigation List */}
          <div role="listbox" aria-label="Navigation items" className="rounded-lg border">
            {navItems.map((item, index) => (
              <button
                key={item.id}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                role="option"
                aria-selected={focusedItem === index}
                tabIndex={focusedItem === index || (focusedItem === null && index === 0) ? 0 : -1}
                className="hover:bg-accent focus:bg-accent focus-visible:ring-ring w-full px-4 py-3 text-left text-sm transition-colors first:rounded-t-lg last:rounded-b-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                onFocus={() => setFocusedItem(index)}
                onBlur={() => setFocusedItem(null)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Instructions */}
          <div className="bg-muted/50 rounded-lg p-4 text-sm">
            <p className="font-medium">Keyboard shortcuts:</p>
            <ul className="text-muted-foreground mt-2 grid gap-1 sm:grid-cols-2">
              <li>
                <kbd className="rounded border px-1.5 py-0.5 text-xs">↑</kbd>{" "}
                <kbd className="rounded border px-1.5 py-0.5 text-xs">↓</kbd> - Navigate up/down
              </li>
              <li>
                <kbd className="rounded border px-1.5 py-0.5 text-xs">←</kbd>{" "}
                <kbd className="rounded border px-1.5 py-0.5 text-xs">→</kbd> - Navigate left/right
              </li>
              <li>
                <kbd className="rounded border px-1.5 py-0.5 text-xs">Home</kbd> - Go to first
              </li>
              <li>
                <kbd className="rounded border px-1.5 py-0.5 text-xs">End</kbd> - Go to last
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Focus Visible Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Focus Visible States</CardTitle>
          <CardDescription>
            Tab through these elements to see focus rings. They only appear on keyboard navigation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button>Primary Button</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </div>

          <div className="flex items-center gap-3">
            <Input placeholder="Focus me with Tab..." className="max-w-xs" />
            <Button variant="outline">Submit</Button>
          </div>

          <p className="text-muted-foreground text-sm">
            Notice how the focus ring only appears when using keyboard navigation (Tab), not on
            mouse click. This is the <code>focus-visible</code> pattern.
          </p>
        </CardContent>
      </Card>

      {/* Dialog/Modal Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Accessible Modal</CardTitle>
          <CardDescription>
            Modal with focus trap, keyboard dismissal, and ARIA attributes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open Modal</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Accessible Dialog</DialogTitle>
                <DialogDescription>
                  This dialog traps focus, can be dismissed with Escape, and uses proper ARIA
                  attributes.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Input placeholder="Try tabbing through elements..." />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button>Confirm</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <ul className="text-muted-foreground mt-4 list-inside list-disc space-y-1 text-sm">
            <li>Focus is trapped inside the modal</li>
            <li>
              <kbd className="rounded border px-1.5 py-0.5 text-xs">Escape</kbd> closes the modal
            </li>
            <li>Focus returns to trigger on close</li>
            <li>Proper role and ARIA attributes</li>
          </ul>
        </CardContent>
      </Card>

      {/* Semantic HTML */}
      <Card>
        <CardHeader>
          <CardTitle>Semantic Patterns</CardTitle>
          <CardDescription>
            Correct usage of buttons vs links based on their purpose
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="mb-2 font-medium text-green-600">✓ Button for actions</p>
              <Button size="sm">Submit Form</Button>
              <p className="text-muted-foreground mt-2 text-xs">
                Triggers JavaScript action, no navigation
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="mb-2 font-medium text-green-600">✓ Link for navigation</p>
              <a href="/demo" className="text-primary text-sm underline hover:no-underline">
                Go to Demo Home
              </a>
              <p className="text-muted-foreground mt-2 text-xs">
                Navigates to a URL, can be opened in new tab
              </p>
            </div>
          </div>

          <div className="bg-destructive/10 rounded-lg p-4">
            <p className="text-destructive mb-2 font-medium">✗ Anti-pattern</p>
            <p className="text-muted-foreground text-sm">
              Don&apos;t use <code>&lt;div onClick&gt;</code> or <code>&lt;span onClick&gt;</code>{" "}
              for interactive elements. They lack keyboard support and ARIA semantics.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
