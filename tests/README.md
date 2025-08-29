# Tests

This project uses [Vitest](https://vitest.dev/) for testing.

## Running Tests

```bash
# Run tests once
npm run test:run

# Run tests in watch mode
npm run test
```

## Test Structure

- `tests/env-file-handler.test.ts` - Tests for env file copying functionality
- `tests/config-scanner.test.ts` - Tests for scanning and finding defineConfigEntry calls
- `tests/dynamic-config-plugin.test.ts` - Tests for the main Vite plugin

## Test Coverage

The tests focus on the core functionality:

### env-file-handler

- ✅ Normalizing env file configuration
- ✅ Reading and adding files to Vite assets
- ✅ Copying files to target directories
- ✅ Handling file paths and filename extraction
- ✅ Error handling for missing files

### config-scanner

- ✅ Scanning directories for defineConfigEntry calls
- ✅ Extracting config names and export names
- ✅ Handling multiple configs
- ✅ Directory exclusion
- ✅ File content detection

### dynamic-config-plugin

- ✅ Plugin creation and structure
- ✅ Required Vite hooks
- ✅ Options handling

## Test Files

Tests use temporary directories and files to avoid affecting the actual project files. All temporary resources are cleaned up after each test.
