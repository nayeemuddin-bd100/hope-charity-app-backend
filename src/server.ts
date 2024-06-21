import { Server } from 'http'
import mongoose from 'mongoose'
import app from './app'
import config from './config'
// import { errorLogger, logger } from "./shared/logger";
// import { error } from "winston";


process.on('uncaughtException', () => {
  //   errorLogger.error("Uncaught Exception Detected", error);
  console.log('Uncaught Exception Detected')

  process.exit(1)
})

let server: Server
async function bootstrap() {
  try {
    await mongoose.connect(config.database_url as string)
    // logger.info("Database connected successfully");

    console.log('Database connected successfully')

    server = app.listen(config.port, () => {
      //   logger.info(`App listening on port ${config.port}`);
      console.log(`App listening on port ${config.port}`)
    })
  } catch (error) {
    // errorLogger.error("Error connecting to database", error);
    console.log('Error connecting to database', error)
  }

  process.on('unhandledRejection', error => {
    console.log('Unhandled Rejection Detected,Shutting down...')

    if (server) {
      server.close(() => {
        // errorLogger.error(error);
        console.log(error)
        process.exit(1)
      })
    } else {
      process.exit(1)
    }
  })
}

bootstrap()
