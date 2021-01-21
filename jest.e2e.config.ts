import { Config } from '@jest/types';
import baseConfig from './jest.base.config';

const e2eConfig: Config.InitialOptions = {
  ...baseConfig,
  testRegex: '\\.e2e-spec\\.ts$',
  coverageDirectory: '../cov-e2e',
  coveragePathIgnorePatterns: ['\\.spec\\.ts$'],
};

export default e2eConfig;
