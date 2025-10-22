# Backend Tests

Comprehensive test suite for the PAAS Platform backend using Vitest.

## Test Structure

```
__tests__/
├── setup.ts                          # Test configuration and database setup
├── helpers.ts                        # Test helper functions
├── unit/                             # Unit tests
│   ├── jwt.test.ts                   # JWT token generation and verification
│   └── password.test.ts              # Password hashing and comparison
└── integration/                      # Integration tests
    ├── auth.service.test.ts          # Auth service (login, register, getCurrentUser)
    └── database.test.ts              # Database operations and constraints
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Coverage

### Unit Tests (29 tests)

**JWT Utility (11 tests)**
- Token generation and signing
- Token verification and decoding
- Token expiration handling
- Token integrity validation
- Invalid token handling

**Password Utility (18 tests)**
- Password hashing with bcrypt
- Password comparison
- Special character handling
- Unicode character support
- Case sensitivity
- Edge cases (empty passwords, long passwords)

### Integration Tests (36 tests)

**Auth Service (20 tests)**

*Login (8 tests)*
- Successful login with correct credentials
- JWT token generation on login
- Invalid password rejection
- Non-existent email handling
- Empty email validation
- Case-sensitive email matching
- Multiple user role support

*Register (8 tests)*
- New user registration
- Password hashing on registration
- JWT token generation on registration
- Duplicate email prevention
- Custom role assignment
- Optional phone number
- Database record creation

*Get Current User (4 tests)*
- User retrieval by ID
- Password field exclusion
- Non-existent user handling
- Empty ID validation

**Database Operations (16 tests)**

*User Table (5 tests)*
- User creation with all fields
- User retrieval by email and ID
- Unique email constraint enforcement
- Record counting

*Location Table (2 tests)*
- Location creation
- Record counting

*Department Table (3 tests)*
- Department creation with location reference
- Unique code constraint enforcement
- Foreign key constraint validation

*Patient Table (3 tests)*
- Patient creation without user link
- Patient creation with user link
- Record counting

*Database Integrity (2 tests)*
- Referential integrity maintenance
- Multi-table operations

*Table Existence (1 test)*
- Verification of all 8 required tables

## Test Configuration

### In-Memory Database

Tests use an in-memory SQLite database for:
- Fast test execution
- Isolated test environment
- No side effects on development database
- Automatic cleanup between tests

### Test Isolation

Each test:
- Runs in isolation with a clean database
- Uses `beforeEach` to clear all tables
- Has no dependencies on other tests
- Can run in any order

### Helper Functions

**Database Helpers:**
- `createTestUser()` - Create test user with hashed password
- `createTestLocation()` - Create test location
- `createTestDepartment()` - Create test department
- `createTestPatient()` - Create test patient
- `getUserByEmail()` - Retrieve user by email
- `getUserById()` - Retrieve user by ID
- `countRecords()` - Count records in any table

**Database Utilities:**
- `initTestDatabase()` - Initialize schema in test database
- `clearDatabase()` - Clear all table data
- `generateUUID()` - Generate unique IDs
- `getCurrentDateTime()` - Get ISO datetime string

## Test Results

```
✓ Unit Tests
  ✓ JWT Utils (11/11)
  ✓ Password Utils (18/18)

✓ Integration Tests
  ✓ Auth Service (20/20)
  ✓ Database Operations (16/16)

Total: 65 tests | 65 passed | 0 failed
```

## Code Coverage

Coverage reports are generated in the `coverage/` directory when running:

```bash
npm run test:coverage
```

Coverage excludes:
- `node_modules/`
- `src/__tests__/`
- `dist/`
- Test files (`*.test.ts`, `*.spec.ts`)
- Seed scripts

## Best Practices

1. **Test Naming**: Use descriptive test names that explain what is being tested
2. **Arrange-Act-Assert**: Structure tests with clear setup, action, and verification
3. **Test Isolation**: Each test should be independent and not rely on others
4. **Clean Database**: Always start with a clean database state
5. **Async Handling**: Properly handle async operations with `async/await`
6. **Error Testing**: Test both success and failure scenarios
7. **Edge Cases**: Cover edge cases like empty strings, null values, special characters

## Future Test Additions

- [ ] Appointment service tests
- [ ] Waitlist service tests
- [ ] Analytics service tests
- [ ] API endpoint tests (using supertest)
- [ ] Middleware tests (auth, error handling)
- [ ] Performance tests
- [ ] Load tests

## Troubleshooting

### Test Failures

If tests fail, check:
1. Database schema is up to date
2. Environment variables are set correctly
3. Dependencies are installed (`npm install`)
4. No database locks from other processes

### Slow Tests

Password hashing tests are slower due to bcrypt's intentional computational cost. This is expected and ensures production-level security testing.

### Coverage Issues

If coverage is not generated:
```bash
npm install --save-dev @vitest/coverage-v8
```

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Better-SQLite3 Documentation](https://github.com/WiseLibs/better-sqlite3)
- [Testing Best Practices](https://testingjavascript.com/)
