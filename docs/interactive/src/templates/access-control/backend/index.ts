import express from 'express'
import { remultExpress } from 'remult/remult-express'
import { Task } from '../shared/Task.js'
import session from 'cookie-session'
import { AuthController } from '../shared/AuthController.js'
import { SeedData } from '../shared/SeedData'
import { createSqlite3DataProvider } from 'remult/remult-sqlite3'

export const app = express()

app.enable('trust proxy') // required for stackblitz and other reverse proxy scenarios
app.use(
  session({
    signed: false, // only for dev on stackblitz, use secret in production
    // secret: process.env['SESSION_SECRET'] || 'my secret',
  }),
)

export const api = remultExpress({
  entities: [Task],
  controllers: [AuthController],
  admin: true,
  dataProvider: createSqlite3DataProvider(),
  getUser: (request) => request.session?.['user'],
  initApi: async () => {
    await SeedData()
  },
})

app.use(api)
