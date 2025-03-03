module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  moduleNameMapper: {
    '^phaser$': '<rootDir>/tests/mocks/phaser.js'
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/objects/**/*.js',
    'src/utils/**/*.js',
    '!src/assets/**'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};