# COCO Project Test Suite

This directory contains comprehensive tests for the COCO project management application.

## Test Structure

```
tests/
├── unit/                     # Unit tests for individual modules
│   ├── data-manager.test.js  # Tests for ProjectMapDataManager
│   └── percentage-handling.test.js  # Tests for percentage logic
├── integration/              # Integration tests for workflows
│   ├── file-operations.test.js  # JSON save/load testing
│   └── server-api.test.js    # Server API endpoint tests
├── fixtures/                 # Test data files
│   ├── sample-project-map.json
│   └── invalid-project-map.json
├── setup.js                  # Jest configuration and mocks
├── test-utils.js            # Shared test utilities
└── README.md                # This file
```

## Running Tests

### Prerequisites

```bash
npm install
```

### Basic Commands

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test suite
npm run test:verbose
```

### Using the Test Runner Script

The project includes a convenient test runner script:

```bash
# Make executable (if needed)
chmod +x test-runner.sh

# Run all tests
./test-runner.sh all

# Run only unit tests
./test-runner.sh unit

# Run only integration tests
./test-runner.sh integration

# Run with coverage report
./test-runner.sh coverage

# Run specific test file
./test-runner.sh specific data-manager.test.js

# Clean test artifacts
./test-runner.sh clean

# Check test environment
./test-runner.sh validate

# Show test status
./test-runner.sh status
```

## Test Coverage

The test suite covers:

### Unit Tests
- **ProjectMapDataManager**: Core data operations, tree traversal, CRUD operations
- **Percentage Handling**: Validation, precision, caching, JSON serialization

### Integration Tests
- **File Operations**: JSON save/load workflows, data persistence, error handling
- **Server API**: HTTP endpoints, request/response handling, file system operations

### Key Test Areas
- ✅ Percentage precision in JSON save/load cycles
- ✅ Tree structure manipulation and validation
- ✅ Error handling and edge cases
- ✅ API endpoint security and validation
- ✅ File system operations and path handling
- ✅ Data integrity across operations

## Test Utilities

### Fixtures
- `sample-project-map.json`: Valid test data with proper structure
- `invalid-project-map.json`: Invalid data for error testing

### Mocking
- DOM API mocking for client-side tests
- File system mocking for integration tests
- HTTP request/response mocking for API tests

### Helpers
- `createSampleProject()`: Generate test project objects
- `loadFixture()`: Load test data files
- `createTempFile()`: Create temporary files for testing
- `cleanupFiles()`: Clean up test artifacts

## Coverage Reports

After running tests with coverage, reports are available in:
- `coverage/lcov-report/index.html` - HTML coverage report
- `coverage/lcov.info` - LCOV format for CI/CD
- Terminal output with summary

## Debugging Tests

### Verbose Output
```bash
VERBOSE_TESTS=1 npm test
```

### Debugging Individual Tests
```bash
npx jest --verbose tests/unit/data-manager.test.js
```

### Test Filtering
```bash
# Run tests matching pattern
npx jest --testNamePattern="percentage"

# Run tests in specific file
npx jest data-manager
```

## Writing New Tests

### Unit Test Template
```javascript
describe('ModuleName', () => {
  beforeEach(() => {
    // Setup
  });

  test('should do something specific', () => {
    // Test implementation
  });
});
```

### Integration Test Template
```javascript
describe('Integration: FeatureName', () => {
  let tempFiles = [];

  afterEach(async () => {
    await cleanupFiles(tempFiles);
    tempFiles = [];
  });

  test('should handle complete workflow', async () => {
    // Test implementation
  });
});
```

## Known Issues

1. **Node.js Version Warnings**: Jest requires Node.js 18+, but tests run on 17.x with warnings
2. **File Cleanup**: Some tests may leave temporary files; use `clean` command to remove them
3. **Server Dependencies**: Integration tests require server modules to be properly structured

## Contributing

When adding new tests:
1. Follow existing naming conventions
2. Include both positive and negative test cases
3. Add appropriate cleanup for temporary resources
4. Update this README if adding new test categories
5. Ensure tests are deterministic and don't depend on external state

## Continuous Integration

The test suite is designed to work with CI/CD pipelines:
- All tests should pass consistently
- Coverage reports are generated in CI-friendly formats
- No external dependencies required for core functionality
- Tests clean up after themselves
