/** @type {import("ts-jest").JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",

  // Only look inside src/tests/ - keeps CI fast and avoids picking up
  // any accidental *.test files elsewhere in the source tree.
  roots: ["<rootDir>/src/tests"],

  // Match both .test.ts and .spec.ts naming conventions
  testMatch: ["**/*.test.ts", "**/*.spec.ts"],

  // ts-jest compiles tests on the fly using the existing tsconfig
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.json",
        // Skip full type-checking in tests for speed;
        // tsc --noEmit in CI handles correctness separately.
        diagnostics: { warnOnly: true },
      },
    ],
  },

  // Load .env before any test file so DATABASE_URL and JWT_SECRET are set
  globalSetup: "<rootDir>/src/tests/setup.ts",

  // Separate test suites run in their own worker; default timeout is generous
  // to allow for Neon cold-start on the first query.
  testTimeout: 20000,

  // Print individual test names in output
  verbose: true,
};
