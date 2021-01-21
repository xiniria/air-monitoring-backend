import * as mkdirp from 'mkdirp';
import { resolve } from 'path';
import { readFile, unlink, writeFile } from 'fs/promises';
import { mergeCoverageReports } from './script';

jest.mock('child_process');

const pwd = resolve('.');

describe('Merge coverage script', () => {
  describe('if there are no coverage files', () => {
    beforeAll(async () => {
      try {
        await unlink(resolve('cov-unit', 'coverage-final.json'));
        await unlink(resolve('cov-e2e', 'coverage-final.json'));
      } catch (err) {}
    });

    it('should create a Cobertura report if CI === true', async () => {
      process.env.CI = 'true';

      await mergeCoverageReports();

      const output = await readFile(resolve('cov', 'cobertura-coverage.xml'));
      const expectedOutput = await readFile(
        resolve(__dirname, 'test-artifacts', 'cobertura-coverage-empty.xml'),
      );

      const formattedOutput = output
        .toString()
        .replace(/timestamp="\d+"/, 'timestamp="1610029936090"');
      const formattedExpectedOutput = expectedOutput.toString().replace(/\[PROJECT_ROOT]/, pwd);

      expect(formattedOutput).toEqual(formattedExpectedOutput);
    });
  });

  describe('if there are coverage files', () => {
    beforeAll(async () => {
      const unitCoverage = await readFile(
        resolve(__dirname, 'test-artifacts', 'unit.coverage.json'),
      );
      const e2eCoverage = await readFile(resolve(__dirname, 'test-artifacts', 'e2e.coverage.json'));

      const formattedUnitCoverage = unitCoverage.toString().replace(/\[PROJECT_ROOT]/g, pwd);
      const formattedE2eCoverage = e2eCoverage.toString().replace(/\[PROJECT_ROOT]/g, pwd);

      await mkdirp(resolve('cov-unit'));
      await mkdirp(resolve('cov-e2e'));

      await writeFile(resolve('cov-unit', 'coverage-final.json'), formattedUnitCoverage);
      await writeFile(resolve('cov-e2e', 'coverage-final.json'), formattedE2eCoverage);
    });

    it('should create a Cobertura report if CI === true', async () => {
      process.env.CI = 'true';

      await mergeCoverageReports();

      const output = await readFile(resolve('cov', 'cobertura-coverage.xml'));
      const expectedOutput = await readFile(
        resolve(__dirname, 'test-artifacts', 'cobertura-coverage.xml'),
      );

      const formattedOutput = output
        .toString()
        .replace(/timestamp="\d+"/, 'timestamp="1610026495019"');
      const formattedExpectedOutput = expectedOutput.toString().replace(/\[PROJECT_ROOT]/, pwd);

      expect(formattedOutput).toEqual(formattedExpectedOutput);
    });

    it('should create a LCOV report if CI !== true', async () => {
      process.env.CI = 'false';

      await mergeCoverageReports();

      const output = await readFile(resolve('cov', 'lcov-report', 'index.html'));
      const expectedOutput = await readFile(resolve(__dirname, 'test-artifacts', 'index.html'));

      const dateRegex = /(Mon|Tue|Wed|Thu|Fri|Sat|Sun) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{2} \d{4} \d{2}:\d{2}:\d{2} GMT[+-]\d{4} \([\w ]+\)/;
      const formattedOutput = output
        .toString()
        .replace(/^\s*$/gm, '')
        .replace(dateRegex, 'Thu Jan 07 2021 14:49:30 GMT+0100 (Central European Standard Time)');
      const formattedExpectedOutput = expectedOutput.toString();

      expect(formattedOutput).toEqual(formattedExpectedOutput);
    });
  });
});
