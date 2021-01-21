import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { CoverageMapData, createCoverageMap } from 'istanbul-lib-coverage';
import { createContext, ReportBase } from 'istanbul-lib-report';
import { create } from 'istanbul-reports';
import * as mkdirp from 'mkdirp';
import { exec } from 'child_process';

const UNIT_TESTS_COVERAGE_DIR = 'cov-unit';
const E2E_TESTS_COVERAGE_DIR = 'cov-e2e';
const OUTPUT_COVERAGE_DIR = 'cov';
const JSON_FILENAME = 'coverage-final.json';

export async function mergeCoverageReports() {
  const map = createCoverageMap();
  let unitTestsCoverageReport: CoverageMapData;
  let e2eTestsCoverageReport: CoverageMapData;

  try {
    const fileContent = await readFile(resolve(UNIT_TESTS_COVERAGE_DIR, JSON_FILENAME));
    unitTestsCoverageReport = JSON.parse(fileContent.toString()) as CoverageMapData;
  } catch (err) {
    unitTestsCoverageReport = {};
  }
  try {
    const fileContent = await readFile(resolve(E2E_TESTS_COVERAGE_DIR, JSON_FILENAME));
    e2eTestsCoverageReport = JSON.parse(fileContent.toString()) as CoverageMapData;
  } catch (err) {
    e2eTestsCoverageReport = {};
  }

  map.merge(unitTestsCoverageReport);
  map.merge(e2eTestsCoverageReport);

  const outputDirPath = resolve(OUTPUT_COVERAGE_DIR);
  await mkdirp(outputDirPath);
  const context = createContext({
    dir: outputDirPath,
    coverageMap: map,
    watermarks: {
      lines: [80, 95],
      statements: [80, 95],
      branches: [80, 95],
      functions: [80, 95],
    },
  });

  if (process.env.CI === 'true') {
    const coberturaReport = (create('cobertura') as unknown) as ReportBase;
    coberturaReport.execute(context);
  } else {
    const lcovReport = (create('lcov') as unknown) as ReportBase;
    lcovReport.execute(context);
    const filePath = `file://${resolve('cov', 'lcov-report', 'index.html')}`;

    let command;
    // istanbul ignore else
    // macOS
    if (process.platform === 'darwin') command = `open ${filePath}`;
    // Windows
    else if (process.platform === 'win32') command = `start "" "${filePath}"`;
    // Linux
    else command = `xdg-open ${filePath}`;

    exec(command);
  }
}
