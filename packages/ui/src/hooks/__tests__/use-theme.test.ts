import { renderHook, act } from "@testing-library/react";
import {
  useTheme,
  getThemePreference,
  setThemePreference,
  resolveTheme,
  applyResolvedTheme,
} from "../use-theme";

describe("getThemePreference", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns 'system' when in SSR environment", () => {
    const originalWindow = global.window;
    // @ts-expect-error - Testing SSR
    delete global.window;

    expect(getThemePreference()).toBe("system");

    global.window = originalWindow;
  });

  it("returns 'system' when no preference is stored", () => {
    expect(getThemePreference()).toBe("system");
  });

  it("returns stored 'light' preference", () => {
    localStorage.setItem("theme-preference", "light");
    expect(getThemePreference()).toBe("light");
  });

  it("returns stored 'dark' preference", () => {
    localStorage.setItem("theme-preference", "dark");
    expect(getThemePreference()).toBe("dark");
  });

  it("returns stored 'system' preference", () => {
    localStorage.setItem("theme-preference", "system");
    expect(getThemePreference()).toBe("system");
  });

  it("returns 'system' for invalid stored value", () => {
    localStorage.setItem("theme-preference", "invalid");
    expect(getThemePreference()).toBe("system");
  });

  it("handles localStorage errors gracefully", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("localStorage unavailable");
    });

    expect(getThemePreference()).toBe("system");

    consoleError.mockRestore();
    jest.restoreAllMocks();
  });
});

describe("setThemePreference", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("does nothing in SSR environment", () => {
    const originalWindow = global.window;
    // @ts-expect-error - Testing SSR
    delete global.window;

    setThemePreference("dark");

    global.window = originalWindow;
    expect(localStorage.getItem("theme-preference")).toBeNull();
  });

  it("stores 'light' preference", () => {
    setThemePreference("light");
    expect(localStorage.getItem("theme-preference")).toBe("light");
  });

  it("stores 'dark' preference", () => {
    setThemePreference("dark");
    expect(localStorage.getItem("theme-preference")).toBe("dark");
  });

  it("stores 'system' preference", () => {
    setThemePreference("system");
    expect(localStorage.getItem("theme-preference")).toBe("system");
  });

  it("handles localStorage errors gracefully", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("localStorage unavailable");
    });

    expect(() => setThemePreference("dark")).not.toThrow();

    consoleError.mockRestore();
    jest.restoreAllMocks();
  });
});

describe("resolveTheme", () => {
  it("returns 'light' for light preference", () => {
    expect(resolveTheme("light")).toBe("light");
  });

  it("returns 'dark' for dark preference", () => {
    expect(resolveTheme("dark")).toBe("dark");
  });

  it("returns 'light' in SSR environment with system preference", () => {
    const originalWindow = global.window;
    // @ts-expect-error - Testing SSR
    delete global.window;

    expect(resolveTheme("system")).toBe("light");

    global.window = originalWindow;
  });

  it("returns 'dark' when system prefers dark mode", () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: query === "(prefers-color-scheme: dark)",
        media: query,
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    expect(resolveTheme("system")).toBe("dark");
  });

  it("returns 'light' when system prefers light mode", () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    expect(resolveTheme("system")).toBe("light");
  });
});

describe("applyResolvedTheme", () => {
  beforeEach(() => {
    document.documentElement.className = "";
  });

  it("does nothing in SSR environment", () => {
    const originalDocument = global.document;
    // @ts-expect-error - Testing SSR
    delete global.document;

    expect(() => applyResolvedTheme("dark")).not.toThrow();

    global.document = originalDocument;
  });

  it("adds 'dark' class for dark theme", () => {
    applyResolvedTheme("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("removes 'dark' class for light theme", () => {
    document.documentElement.classList.add("dark");
    applyResolvedTheme("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("handles multiple calls correctly", () => {
    applyResolvedTheme("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    applyResolvedTheme("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    applyResolvedTheme("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});

describe("useTheme", () => {
  let mockMatchMedia: jest.Mock;
  let mediaQueryListeners: ((e: MediaQueryListEvent) => void)[];

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
    mediaQueryListeners = [];

    mockMatchMedia = jest.fn().mockImplementation((query) => ({
      matches: query === "(prefers-color-scheme: dark)",
      media: query,
      onchange: null,
      addEventListener: jest.fn((event, handler) => {
        if (event === "change") {
          mediaQueryListeners.push(handler);
        }
      }),
      removeEventListener: jest.fn((event, handler) => {
        if (event === "change") {
          const index = mediaQueryListeners.indexOf(handler);
          if (index > -1) {
            mediaQueryListeners.splice(index, 1);
          }
        }
      }),
      dispatchEvent: jest.fn(),
    }));

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: mockMatchMedia,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("initializes with system preference by default", () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.preference).toBe("system");
    expect(result.current.resolvedTheme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("initializes with stored preference", () => {
    localStorage.setItem("theme-preference", "light");

    const { result } = renderHook(() => useTheme());

    expect(result.current.preference).toBe("light");
    expect(result.current.resolvedTheme).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("sets preference to light", () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setPreference("light");
    });

    expect(result.current.preference).toBe("light");
    expect(result.current.resolvedTheme).toBe("light");
    expect(localStorage.getItem("theme-preference")).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("sets preference to dark", () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setPreference("dark");
    });

    expect(result.current.preference).toBe("dark");
    expect(result.current.resolvedTheme).toBe("dark");
    expect(localStorage.getItem("theme-preference")).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("toggles from dark to light", () => {
    localStorage.setItem("theme-preference", "dark");
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggle();
    });

    expect(result.current.preference).toBe("light");
    expect(result.current.resolvedTheme).toBe("light");
  });

  it("toggles from light to dark", () => {
    localStorage.setItem("theme-preference", "light");
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggle();
    });

    expect(result.current.preference).toBe("dark");
    expect(result.current.resolvedTheme).toBe("dark");
  });

  it("sets system preference", () => {
    localStorage.setItem("theme-preference", "light");
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setSystem();
    });

    expect(result.current.preference).toBe("system");
    expect(localStorage.getItem("theme-preference")).toBe("system");
  });

  it("listens to system theme changes when preference is system", async () => {
    mockMatchMedia.mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: jest.fn((event, handler) => {
        if (event === "change") {
          mediaQueryListeners.push(handler);
        }
      }),
      removeEventListener: jest.fn((event, handler) => {
        if (event === "change") {
          const index = mediaQueryListeners.indexOf(handler);
          if (index > -1) {
            mediaQueryListeners.splice(index, 1);
          }
        }
      }),
      dispatchEvent: jest.fn(),
    }));

    const { result } = renderHook(() => useTheme());

    expect(result.current.resolvedTheme).toBe("light");

    // Simulate system theme change to dark
    await act(async () => {
      mediaQueryListeners.forEach((listener) => {
        listener({ matches: true, media: "(prefers-color-scheme: dark)" } as MediaQueryListEvent);
      });
    });

    expect(result.current.resolvedTheme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    // Simulate system theme change to light
    await act(async () => {
      mediaQueryListeners.forEach((listener) => {
        listener({ matches: false, media: "(prefers-color-scheme: dark)" } as MediaQueryListEvent);
      });
    });

    expect(result.current.resolvedTheme).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("subscribes to system changes when switching to system mode", () => {
    localStorage.setItem("theme-preference", "dark");
    const { result } = renderHook(() => useTheme());

    expect(mediaQueryListeners.length).toBe(0);

    act(() => {
      result.current.setSystem();
    });

    expect(mediaQueryListeners.length).toBeGreaterThan(0);
  });

  it("cleans up event listeners on unmount", () => {
    const { unmount } = renderHook(() => useTheme());

    expect(mediaQueryListeners.length).toBeGreaterThan(0);

    unmount();

    expect(mediaQueryListeners.length).toBe(0);
  });

  it("does not subscribe to system changes for non-system preferences", () => {
    localStorage.setItem("theme-preference", "dark");
    renderHook(() => useTheme());

    expect(mediaQueryListeners.length).toBe(0);
  });
});
