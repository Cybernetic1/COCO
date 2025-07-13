#!/bin/bash

# COCO Project Test Runner
# Provides convenient commands to run different test suites

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if dependencies are installed
check_dependencies() {
    if [ ! -d "node_modules" ]; then
        print_warning "Dependencies not found. Installing..."
        npm install
    fi
}

# Run all tests
run_all() {
    print_header "Running All Tests"
    check_dependencies
    npm test
}

# Run unit tests only
run_unit() {
    print_header "Running Unit Tests"
    check_dependencies
    npx jest tests/unit --verbose
}

# Run integration tests only
run_integration() {
    print_header "Running Integration Tests"
    check_dependencies
    npx jest tests/integration --verbose
}

# Run tests with coverage
run_coverage() {
    print_header "Running Tests with Coverage"
    check_dependencies
    npm run test:coverage
}

# Run tests in watch mode
run_watch() {
    print_header "Running Tests in Watch Mode"
    check_dependencies
    npm run test:watch
}

# Run specific test file
run_specific() {
    if [ -z "$1" ]; then
        print_error "Please specify a test file"
        echo "Usage: $0 specific <test-file>"
        echo "Example: $0 specific data-manager.test.js"
        exit 1
    fi
    
    print_header "Running Specific Test: $1"
    check_dependencies
    npx jest "$1" --verbose
}

# Clean test artifacts
clean() {
    print_header "Cleaning Test Artifacts"
    
    # Remove coverage directory
    if [ -d "coverage" ]; then
        rm -rf coverage
        print_success "Removed coverage directory"
    fi
    
    # Remove temp test files
    if [ -d "tests/temp" ]; then
        rm -rf tests/temp
        print_success "Removed temp test files"
    fi
    
    # Remove any test project-maps files that might be created
    if [ -d "project-maps" ]; then
        find project-maps -name "*test*.json" -delete 2>/dev/null || true
        find project-maps -name "*api-test*.json" -delete 2>/dev/null || true
        print_success "Cleaned up test project map files"
    fi
    
    print_success "Cleanup completed"
}

# Show test status/summary
status() {
    print_header "Test Suite Status"
    
    if [ ! -d "node_modules" ]; then
        print_error "Dependencies not installed"
        echo "Run: npm install"
        return 1
    fi
    
    echo "Test files found:"
    find tests -name "*.test.js" | while read -r file; do
        echo "  - $file"
    done
    
    echo ""
    echo "Available npm scripts:"
    echo "  - npm test           # Run all tests"
    echo "  - npm run test:watch # Run tests in watch mode"
    echo "  - npm run test:coverage # Run with coverage report"
    echo "  - npm run test:verbose  # Run with verbose output"
    
    echo ""
    if [ -d "coverage" ]; then
        print_success "Coverage reports available in ./coverage/"
    else
        print_warning "No coverage reports found (run with coverage to generate)"
    fi
}

# Validate test environment
validate() {
    print_header "Validating Test Environment"
    
    # Check Node.js version
    node_version=$(node --version)
    print_success "Node.js version: $node_version"
    
    # Check npm version
    npm_version=$(npm --version)
    print_success "npm version: $npm_version"
    
    # Check if Jest is available
    if command -v npx jest &> /dev/null; then
        jest_version=$(npx jest --version)
        print_success "Jest version: $jest_version"
    else
        print_error "Jest not found"
        return 1
    fi
    
    # Check test files
    test_count=$(find tests -name "*.test.js" | wc -l)
    print_success "Found $test_count test files"
    
    # Check fixtures
    fixture_count=$(find tests/fixtures -name "*.json" 2>/dev/null | wc -l || echo "0")
    print_success "Found $fixture_count test fixtures"
    
    # Test basic Jest functionality
    echo "Testing Jest configuration..."
    if npx jest --listTests &> /dev/null; then
        print_success "Jest configuration is valid"
    else
        print_error "Jest configuration has issues"
        return 1
    fi
    
    print_success "Test environment validation completed"
}

# Show help
show_help() {
    echo "COCO Project Test Runner"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  all               Run all tests"
    echo "  unit              Run unit tests only"
    echo "  integration       Run integration tests only"
    echo "  coverage          Run tests with coverage report"
    echo "  watch             Run tests in watch mode"
    echo "  specific <file>   Run specific test file"
    echo "  clean             Clean test artifacts"
    echo "  status            Show test suite status"
    echo "  validate          Validate test environment"
    echo "  help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 all"
    echo "  $0 unit"
    echo "  $0 specific data-manager.test.js"
    echo "  $0 coverage"
}

# Main command dispatcher
case "$1" in
    "all"|"")
        run_all
        ;;
    "unit")
        run_unit
        ;;
    "integration")
        run_integration
        ;;
    "coverage")
        run_coverage
        ;;
    "watch")
        run_watch
        ;;
    "specific")
        run_specific "$2"
        ;;
    "clean")
        clean
        ;;
    "status")
        status
        ;;
    "validate")
        validate
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
