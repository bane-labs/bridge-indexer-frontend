// Add custom jest matchers from jest-dom
require("@testing-library/jest-dom");

// Import test setup utilities
const { setupMSW } = require("./src/test/setup/msw");
const { setupTestEnv } = require("./src/test/setup/env");
const { resetRouterMocks } = require("./src/test/helpers/router");

// Setup test environment variables
setupTestEnv();

// Mock the env module to avoid ESM issues with @t3-oss/env-nextjs
jest.mock("./src/env", () => {
  const mockEnv = require("./src/env/__mocks__/index.ts");
  return mockEnv;
});

// Reset cached client config between tests (env vars may change)
beforeEach(() => {
  const { _resetClientConfigCache } = require("./src/config/client");
  _resetClientConfigCache();
});

// Setup MSW for API mocking
// Note: MSW v1 has limitations in Node.js/jsdom environments
// For most tests, prefer mocking fetch directly with jest.fn()
setupMSW();

// Mock sessionStorage
const sessionStorageData = {};
global.sessionStorage = {
  getItem: jest.fn((key) => sessionStorageData[key] || null),
  setItem: jest.fn((key, value) => {
    sessionStorageData[key] = value;
  }),
  removeItem: jest.fn((key) => {
    delete sessionStorageData[key];
  }),
  clear: jest.fn(() => {
    Object.keys(sessionStorageData).forEach((key) => delete sessionStorageData[key]);
  }),
};

// Mock navigator
global.navigator = {
  ...global.navigator,
  sendBeacon: jest.fn(() => true),
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

// Mock window and location for browser tests
global.window = {
  location: {
    origin: "http://localhost:3000",
    href: "http://localhost:3000/",
    pathname: "/",
  },
};

// Mock URL constructor for browser environment
global.URL = class URL {
  constructor(url, base) {
    const fullUrl = url.startsWith("http") ? url : base + url;
    const parsed = new (require("url").URL)(fullUrl);
    this.href = parsed.href;
    this.origin = parsed.origin;
    this.protocol = parsed.protocol;
    this.host = parsed.host;
    this.hostname = parsed.hostname;
    this.port = parsed.port;
    this.pathname = parsed.pathname;
    this.search = parsed.search;
    this.hash = parsed.hash;
  }
};

// Mock Next.js headers for API route tests
jest.mock("next/headers", () => ({
  headers: jest.fn(() => ({
    get: jest.fn(),
  })),
}));

// Mock Next.js navigation
jest.mock("next/navigation", () => {
  const {
    mockUseRouter,
    mockUsePathname,
    mockUseSearchParams,
    mockUseParams,
    mockRedirect,
    mockNotFound,
  } = require("./src/test/helpers/router");
  return {
    useRouter: mockUseRouter,
    usePathname: mockUsePathname,
    useSearchParams: mockUseSearchParams,
    useParams: mockUseParams,
    redirect: mockRedirect,
    notFound: mockNotFound,
  };
});

// Reset router mocks before each test
beforeEach(() => {
  resetRouterMocks();
});

// Suppress console logs during tests for cleaner output
// You can comment these out if you need to debug
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};
