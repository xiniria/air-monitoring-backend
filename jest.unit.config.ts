import { Config } from '@jest/types';
import baseConfig from './jest.base.config';

const e2eConfig: Config.InitialOptions = {
  ...baseConfig,
  testRegex: '\\.spec\\.ts$',
  coverageDirectory: '../cov-unit',
  coveragePathIgnorePatterns: ['\\.e2e-spec\\.ts$'],
};

export default e2eConfig;
