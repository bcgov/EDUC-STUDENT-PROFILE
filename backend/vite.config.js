import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    reporters: [
      ['vitest-sonar-reporter', { outputFile: 'sonar-report.xml' }],
    ],
    coverage: { reporters: 'lcov' }
  }
});
