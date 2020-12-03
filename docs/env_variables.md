# Environment variables

To have secret information accessible in environment variables (such as the database connection credentials,
for example), we store these variables in an uncommitted `.env` file at the root of the project. Then, we use
[package `dotenv`](https://www.npmjs.com/package/dotenv) to load it in `src/main.ts`, and put its contents in
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
