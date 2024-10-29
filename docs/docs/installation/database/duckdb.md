## DuckDB

To use DuckDB as the database provider in your Remult-based application, follow these steps:

### Step 1: Install DuckDB

Run the following command to install `duckdb`:

```sh
npm i duckdb
```

### Step 2: Configure the `dataProvider`

In your `index.ts` (or server file), configure the `dataProvider` to use DuckDB:

```ts
import express from 'express'
import { remultExpress } from 'remult/remult-express'
import { SqlDatabase } from 'remult' // [!code highlight]
import { Database } from 'duckdb' // [!code highlight]
import { DuckDBDataProvider } from 'remult/remult-duckdb' // [!code highlight]

const app = express()

app.use(
  remultExpress({
    dataProvider: new SqlDatabase( // [!code highlight]
      new DuckDBDataProvider(new Database(':memory:')), // [!code highlight]
    ), // [!code highlight]
  }),
)

app.listen(3000, () => console.log('Server is running on port 3000'))
```

### Explanation:

- **DuckDB setup**: The database is initialized with `new Database(':memory:')` to create an in-memory database. Replace `':memory:'` with a file path if you want to persist the database to disk.
- **SqlDatabase**: `SqlDatabase` is used to connect Remult with DuckDB through the `DuckDBDataProvider`.

This setup allows you to use DuckDB as your database provider in a Remult project.