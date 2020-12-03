# Database

## Installation and setup

Follow the instructions of the [README](../README.md) to install PostgreSQL v13 and set up your local
database.

## ORM

We use [TypeORM](https://typeorm.io/#/) as the ORM (Object Relational Mapper), to provide an interface
between the database and the app. Nest provides an out-of-the-box
[integration](https://docs.nestjs.com/techniques/database#typeorm-integration) for this ORM with the package
`@nestjs/typeorm`. We use `node-postgres` (`pg` on [npm](https://www.npmjs.com/package/pg)) as the underlying
database driver for TypeORM.

## Credentials

To connect to the database, `node-postgres` (used by TypeORM) uses credentials stored in environment
variables. Thus, you'll have to set them in your `.env` file (as explained [here](./env_variables.md))
as so:

```dotenv
PG_USER=[your_database_username]     # Default postgres
PG_PASSWORD=[your_database_password] # Default no password
PG_PORT=[your_port]                  # Default 5432
PG_HOST=[your_hostname]              # Default localhost
PG_DATABASE=[your_database_name]     # Default air_monitoring
```

## TypeORM CLI installation

To be able to run migrations, you will have to install the [TypeORM CLI](https://typeorm.io/#/using-cli).
Since our project is written in TypeScript, that means we have to install `ts-node` globally and use it
to run the CLI executable file of TypeORM. We also have to install TypeScript globally as it is a peer
dependency of `ts-node`:

```bash
$ npm install --global ts-node typescript
```

Once this is done, we can use this command instead of the `typeorm` CLI command:

```bash
$ node --require ts-node/register ./node_modules/typeorm/cli.js
```

As this is not very convenient to type, we added the npm script `typeorm` instead, so you basically just
need this (there is a special syntax for dash options such as `-n`):

```bash
$ npm run typeorm <typeorm CLI command> [-- [dash option]]
$ npm run typeorm migration:create -- -n migration-name
```

Again, this is not very convenient, so there are special npm scripts for TypeORM CLI commands (see below).

## Migrations

We use migrations to manage the evolution of the DB schema. Migrations are files that have a `up()` and
a `down()` methods that allow a user to run or revert the migration on the database. The body of each
of these functions is a set of SQL instructions to run on the database. Here, we use the built-in migration
features of TypeORM (which you can read about [here](https://typeorm.io/#/migrations)) that give us access
to the `QueryRunner` methods, so we don't have to write plain SQL. Because we use the TypeORM CLI with
TypeScript files in development (that we transpile using ts-node), but we use it with JavaScript files in
production (when the files have already been built in `./dist/`), we have to tell TypeORM which one it is
(so that it looks for TypeScript files instead of JavaScript ones in development, for example). We do that
using the `NODE_ENV` environment variable set to `migration`. To make it easier and ensure it works the same
everywhere, we created npm scripts for all TypeORM CLI migration commands.

To run migrations on your database, use the `typeorm` CLI command with  `npm run migrate`; to revert the
last migration, use `npm run unmigrate`.

To create a new migration file, use the command `npm run generate-migration migration-name`.
Your migration name should be descriptive of what is actually accomplished in the migration. Make sure
that you test both `up()` and `down()` methods before deploying a new migration.
