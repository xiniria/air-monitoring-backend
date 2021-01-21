import { Config } from '@jest/types';
import { CoverageReporters } from '@jest/types/build/Config';

const coverageReporters: CoverageReporters = ['json'];
if (process.env.CI !== 'true') coverageReporters.push('lcov');
if (process.env.COV_OUTPUT !== 'false') coverageReporters.push('text');

const baseConfig: Config.InitialOptions = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  testEnvironment: 'node',
  collectCoverageFrom: ['**/*.(t|j)s', '!main.ts', '!scripts/*/run.ts'],
  coverageReporters,
};

export default baseConfig;
