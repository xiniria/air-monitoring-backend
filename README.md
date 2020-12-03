# Air Monitoring PWA project — backend

## Installation

```bash
$ npm install
```

## Database setup

The DBMS we use is PostgreSQL, version 13.1. You can download it
[here](https://www.postgresql.org/download/). Once this is done, follow the installation instructions
and launch a Postgres server with:

```bash
$ postgres
```

You can also use an app to manage the server, such as [pgAdmin](https://www.pgadmin.org/) or
[Postgres.app](https://postgresapp.com/) (only on macOS). Then, connect to your server with the `psql`
client:

```bash
$ psql
```

You can now type in SQL queries or
[`psql`-specific commands](https://www.postgresql.org/docs/13/app-psql.html), such as `\l` to list all
databases or `\c` to change the current database, for example. Create a new database called
`air_monitoring` with:

```postgresql
CREATE DATABASE "air_monitoring";
```

You can check that is has been created by displaying the list of databases (`\l`) and connect to it with
`\c air_monitoring`. Head to [`docs/database.md`](./docs/database.md) to finish setting up your local
database.

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
