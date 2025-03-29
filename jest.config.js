module.exports = {
    testEnvironment: 'node',
    coverageDirectory: 'coverage',
    collectCoverageFrom: ['**/*.js'],
    reporters: [
      'default',
      ['jest-junit', { outputDirectory: 'reports', outputName: 'junit.xml' }]
    ]
  };