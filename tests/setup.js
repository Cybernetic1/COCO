/**
 * Jest setup configuration for COCO project tests
 */

// Set test timeout for integration tests
jest.setTimeout(30000);

// Mock console methods in test environment
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

beforeAll(() => {
  // Suppress console output during tests unless explicitly needed
  if (!process.env.VERBOSE_TESTS) {
    console.error = jest.fn();
    console.warn = jest.fn();
    console.log = jest.fn();
  }
});

afterAll(() => {
  // Restore console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.log = originalConsoleLog;
});

// Global test utilities
global.testUtils = {
  // Helper to wait for async operations
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Helper to generate random IDs for tests
  generateTestId: () => `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  
  // Helper to create test projects with unique IDs
  createUniqueProject: (overrides = {}) => ({
    id: global.testUtils.generateTestId(),
    name: `Test Project ${Date.now()}`,
    description: 'Generated test project',
    x: Math.floor(Math.random() * 500),
    y: Math.floor(Math.random() * 500),
    percentage: Math.floor(Math.random() * 100),
    connections: [],
    ...overrides
  })
};

// Clean up function for tests
global.cleanup = {
  files: [],
  directories: [],
  
  addFile: (filePath) => {
    global.cleanup.files.push(filePath);
  },
  
  addDirectory: (dirPath) => {
    global.cleanup.directories.push(dirPath);
  },
  
  async run() {
    const fs = require('fs').promises;
    
    // Clean up files
    for (const filePath of global.cleanup.files) {
      try {
        await fs.unlink(filePath);
      } catch (error) {
        // File might not exist, ignore error
      }
    }
    
    // Clean up directories
    for (const dirPath of global.cleanup.directories) {
      try {
        await fs.rmdir(dirPath, { recursive: true });
      } catch (error) {
        // Directory might not exist, ignore error
      }
    }
    
    // Reset lists
    global.cleanup.files = [];
    global.cleanup.directories = [];
  }
};

// Mock HTML Audio API for client-side tests
global.Audio = jest.fn().mockImplementation(() => ({
  play: jest.fn().mockResolvedValue(),
  pause: jest.fn(),
  load: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  volume: 1,
  currentTime: 0,
  duration: 0,
  paused: true,
  ended: false
}));

// Mock Blob and URL APIs for file operations
global.Blob = jest.fn().mockImplementation((content, options) => ({
  content,
  options,
  size: content ? content.reduce((acc, item) => acc + item.length, 0) : 0,
  type: options ? options.type : ''
}));

global.URL = {
  createObjectURL: jest.fn().mockReturnValue('mock-object-url'),
  revokeObjectURL: jest.fn()
};

// Enhanced DOM mocking for client-side component tests
global.createMockElement = (tagName, properties = {}) => {
  const element = {
    tagName: tagName.toUpperCase(),
    id: properties.id || '',
    className: properties.className || '',
    innerHTML: properties.innerHTML || '',
    textContent: properties.textContent || '',
    style: properties.style || {},
    dataset: properties.dataset || {},
    
    // Event handling
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
    
    // DOM manipulation
    appendChild: jest.fn(),
    removeChild: jest.fn(),
    replaceChild: jest.fn(),
    insertBefore: jest.fn(),
    
    // Query methods
    querySelector: jest.fn(),
    querySelectorAll: jest.fn().mockReturnValue([]),
    getElementById: jest.fn(),
    getElementsByTagName: jest.fn().mockReturnValue([]),
    getElementsByClassName: jest.fn().mockReturnValue([]),
    
    // Attributes
    getAttribute: jest.fn(),
    setAttribute: jest.fn(),
    removeAttribute: jest.fn(),
    hasAttribute: jest.fn().mockReturnValue(false),
    
    // Form elements
    click: jest.fn(),
    focus: jest.fn(),
    blur: jest.fn(),
    submit: jest.fn(),
    
    // Position/size
    getBoundingClientRect: jest.fn().mockReturnValue({
      x: 0, y: 0, width: 100, height: 100,
      top: 0, right: 100, bottom: 100, left: 0
    }),
    offsetWidth: 100,
    offsetHeight: 100,
    scrollTop: 0,
    scrollLeft: 0,
    
    // Parent/child relationships
    parentNode: null,
    parentElement: null,
    children: [],
    childNodes: [],
    firstChild: null,
    lastChild: null,
    nextSibling: null,
    previousSibling: null,
    
    // Apply any additional properties
    ...properties
  };
  
  return element;
};

// Error boundary for tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process in tests, just log the error
});

// Suppress experimental warnings in Node.js
process.removeAllListeners('warning');
