# Environment variables

## Your `.env` file

To have secret information accessible in environment variables (such as the database connection credentials,
for example), we store these variables in an uncommitted `.env` file at the root of the project. Then, we use
[package `dotenv`](https://www.npmjs.com/package/dotenv) to load it in `ormconfig.ts`, and put its contents in
environment variables, ones we can access with `process.env.ENV_VAR` in the code.

For example, if you want an environment variable `WELL_GUARDED_SECRET` with value `imasecret`, add this line
to your `.env` file:

```dotenv
WELL_GUARDED_SECRET=imasecret
```

You can then use this variable with:

```typescript
console.log(`My secret is ${process.env.WELL_GUARDED_SECRET}!`);
```

## The `IS_TS_NODE` environment variable

Because we use commands with TypeScript files in development (that we transpile using `ts-node`), and with
JavaScript files in production (when the files have already been built in `./dist/`), we have to tell TypeORM
which situation we're in (so that it looks for TypeScript files instead of JavaScript ones in development for
entities and migrations). We do that using the `IS_TS_NODE` environment variable set to `true`. This environment
variable will be automatically set if you run something with the command `ts-node`, but if you don't (for
example when you use the command `jest`, with the underlying `ts-jest`, or when you use the formula `node
--require ts-node/register`), you will have to specify it yourself with `IS_TS_NODE=true [command]`. If you
are sure to never run any plain JavaScript command, you can also set the `IS_TS_NODE` environment variable
to `true` in your `.env` file.
