// Set up global mocks and test environment
global.console = {
  ...console,
  // Ignore console.warn and console.error in tests
  warn: jest.fn(),
  error: jest.fn(),
};