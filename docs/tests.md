# Tests

## Running unit and end-to-end tests

There are two types of tests: unit tests (files that end with `.spec.ts`) and end-to-end tests (files that
end with `.e2e-spec.ts`). Each type of test has its own Jest config file in the root directory at
`./jest.(unit|e2e).config.ts`, but both extend our base config `./jest.base.config.ts`. Unit tests are not
supposed to interact with the database: they should individually test a function while mocking everything
outside it; on the other hand, end-to-end tests test the app globally, necessitate a database set up
and often make requests directly to the bootstrapped app to analyse the response. Use these commands to
run tests:

```shell
# unit tests
$ npm run test:unit

# e2e tests
$ npm run test:e2e

# both
$ npm run test
```

## Test coverage

Our test framework Jest uses [`istanbul/nyc`](https://www.npmjs.com/package/nyc) under the hood to collect
coverage on our server files during the tests (that is, to know whether a line or statement has been run or
not during the test run) and produce coverage reports in `./cov-unit/` and `./cov-e2e/` if you run tests
with these commands (be careful, running tests with coverage makes the run significantly longer):

```shell
# unit tests coverage
$ npm run test:unit:cov

# e2e tests coverage
$ npm run test:e2e:cov
```

As some parts of the same file can be run by unit tests as well as end-to-end tests, the real information
we are interested in is the aggregated coverage report for both unit and end-to-end tests. You can generate
this report with `npm run merge-coverage` (this will run the script in `./src/scripts/merge-coverage`) if
you already generated coverage reports for unit and end-to-end tests. Another way to do this is to run
`npm run test:cov`, which will directly run the two commands and then the merge script for you. The merge
coverage script creates the aggregated coverage report in `./cov/` and it should open a local HTML file in
your browser in the end. This file allows you to navigate and browse your codebase to see graphically the
details of code coverage.

If you are on Windows and use Windows Subsystem for Linux (WSL), will have to set this environment variable
for the file opening to work in your browser:

```shell
export BROWSER='path/to/your/browser/executable/browser.exe'
```

For example, if your browser is Firefox, with its executable file in `C:\Program Files\Firefox\firefox.exe`,
use this command:

```shell
export BROWSER='/mnt/c/Program Files/Firefox/firefox.exe'
```

You might want to add this command to your `.bashrc`, `.zshrc` or equivalent to make it persistent.

If you create a Merge Request on GitLab, the CI process should generate a Cobertura coverage report (during
the `merge_coverage` job) that will be used by GitLab to directly display test coverage on your files, in
the "Changes" tab.

We should always aim at maximum coverage for our code: an untested piece of code is a piece of code that
will inevitably be forgotten during big changes in the codebase (because it won't break any tests) and
become outdated; of course, the moment you realize this is when you need it and it does not work anymore.
A 90% coverage on lines, statements and branches should be a minimum (this will soon be enforced by a CI
check).

## Debug and watch mode

We provide npm scripts to run tests (either unit or end-to-end) in watch mode (during development, if you
want to run tests each time a file is updated) or in debug mode (if you want to be able to attach a debugger
to track down what is going on and understand a bug), with these commands:

```shell
# unit/e2e tests in watch mode
$ npm run test:(unit|e2e):watch

# unit/e2e tests in debug mode
$ npm run test:(unit|e2e):debug
```
