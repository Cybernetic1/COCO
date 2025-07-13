/**
 * Test utility functions for COCO project tests
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Load JSON fixture file
 * @param {string} filename - Name of the fixture file (without path)
 * @returns {Object} Parsed JSON data
 */
async function loadFixture(filename) {
  const fixturePath = path.join(__dirname, 'fixtures', filename);
  const data = await fs.readFile(fixturePath, 'utf8');
  return JSON.parse(data);
}

/**
 * Create a temporary test file
 * @param {string} filename - Name of the temp file (can include subdirectories)
 * @param {string|Object} content - Content to write (string or object to stringify)
 * @returns {string} Full path to the created file
 */
async function createTempFile(filename, content) {
  const tempDir = path.join(__dirname, '..', 'temp');
  
  // Ensure temp directory exists
  try {
    await fs.mkdir(tempDir, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
  
  const filePath = path.join(tempDir, filename);
  
  // Ensure subdirectories exist if filename contains paths
  const fileDir = path.dirname(filePath);
  if (fileDir !== tempDir) {
    try {
      await fs.mkdir(fileDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }
  
  const fileContent = typeof content === 'object' ? JSON.stringify(content, null, 2) : content;
  
  await fs.writeFile(filePath, fileContent, 'utf8');
  return filePath;
}

/**
 * Clean up temporary test files
 * @param {string|string[]} paths - File path(s) to clean up
 */
async function cleanupFiles(paths) {
  const pathArray = Array.isArray(paths) ? paths : [paths];
  
  for (const filePath of pathArray) {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // File might not exist, ignore error
    }
  }
}

/**
 * Create a mock DOM environment for client-side tests
 */
function createMockDOM() {
  // Basic DOM mock for testing client-side code
  global.document = {
    getElementById: jest.fn(),
    createElement: jest.fn(() => ({
      style: {},
      setAttribute: jest.fn(),
      appendChild: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      click: jest.fn()
    })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  };
  
  global.window = {
    localStorage: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn()
    },
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    confirm: jest.fn(() => true),
    alert: jest.fn(),
    location: { reload: jest.fn() }
  };
  
  global.Audio = jest.fn(() => ({
    play: jest.fn(),
    pause: jest.fn(),
    load: jest.fn()
  }));
}

/**
 * Reset all mocks
 */
function resetMocks() {
  jest.clearAllMocks();
  
  if (global.document) {
    Object.values(global.document).forEach(fn => {
      if (typeof fn === 'function' && fn.mockReset) {
        fn.mockReset();
      }
    });
  }
  
  if (global.window) {
    Object.values(global.window.localStorage).forEach(fn => {
      if (typeof fn === 'function' && fn.mockReset) {
        fn.mockReset();
      }
    });
  }
}

/**
 * Create a sample project object for testing
 * @param {Object} overrides - Properties to override
 * @returns {Object} Sample project
 */
function createSampleProject(overrides = {}) {
  return {
    id: 'test-project-id',
    name: 'Test Project',
    description: 'A test project description',
    x: 100,
    y: 150,
    percentage: 50.0,
    connections: [],
    ...overrides
  };
}

/**
 * Validate project object structure
 * @param {Object} project - Project to validate
 * @returns {boolean} True if valid
 */
function isValidProject(project) {
  return (
    project &&
    typeof project.id === 'string' &&
    typeof project.name === 'string' &&
    typeof project.x === 'number' &&
    typeof project.y === 'number' &&
    typeof project.percentage === 'number' &&
    Array.isArray(project.connections) &&
    project.percentage >= 0 &&
    project.percentage <= 100
  );
}

module.exports = {
  loadFixture,
  createTempFile,
  cleanupFiles,
  createMockDOM,
  resetMocks,
  createSampleProject,
  isValidProject
};
