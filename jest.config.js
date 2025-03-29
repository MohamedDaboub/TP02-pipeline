module.exports = {
    testEnvironment: 'node',
    coverageDirectory: 'coverage',
    collectCoverageFrom: ['**/*.js'],
    reporters: [
      'default',
      ['jest-junit', {
        outputDirectory: 'test-results/junit',
        outputName: 'junit.xml',
        suiteName: 'jest tests',
        classNameTemplate: '{classname}-{title}',
        titleTemplate: '{classname}-{title}',
        ancestorSeparator: ' > ',
        usePathForSuiteName: 'true'
      }]
    ]
  }