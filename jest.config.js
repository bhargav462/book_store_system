module.exports = {
    // Indicates the root directory of your project
    rootDir: '.',
  
    // A list of paths to directories that Jest should use to search for files
    roots: ['<rootDir>/test'],
  
    // The test environment that will be used for testing
    testEnvironment: 'node',
  
    // A list of file extensions Jest should look for
    moduleFileExtensions: ['js', 'json'],
  
    // A list of paths to directories containing test files
    testMatch: ['<rootDir>/test/*.test.js'],
  
    // A list of paths to Jest setup files
    // setupFiles: ['<rootDir>/test/setupTests.js'],
  
    // A list of Jest transformations to apply to files before testing
    // transform: {
    //   '^.+\\.js$': 'babel-jest',
    // },
  
    // Indicates whether Jest should collect code coverage information
    collectCoverage: true,
  
    // The directory where Jest should output coverage reports
    coverageDirectory: '<rootDir>/coverage',
  
    // An array of glob patterns indicating a set of files for which coverage information should be collected
    collectCoverageFrom: ['<rootDir>/src/**/*.js'],
  
    // A threshold for code coverage, an object specifying minimum coverage thresholds for statements, branches, functions, and lines
    coverageThreshold: {
      global: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  };
  