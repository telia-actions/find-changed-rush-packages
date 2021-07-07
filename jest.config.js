module.exports = {
  clearMocks: true,
  restoreMocks: true,
  preset: 'jest-preset-typescript',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageReporters: ['text-summary', 'text'],
};
