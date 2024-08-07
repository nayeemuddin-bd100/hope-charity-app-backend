import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { Application, NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import globalErrorHandler from './app/middleware/globalErrorHandler'
import router from './app/routes'

const app: Application = express()
// app.use(cors())

app.use(
  cors({
    origin: ['https://hope-charity-app.vercel.app', 'http://localhost:3000'],
    credentials: true,
  }),
)
app.use(cookieParser())

//parser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//app route
app.use('/api/v1', router)

app.get('/', (_req: Request, res: Response) => {
  res.send('Hello World!')
})

//handle Not Found Route
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(StatusCodes.NOT_FOUND).json({
    statusCode: StatusCodes.NOT_FOUND,
    success: false,
    message: 'API Not Found',
    errorMessage: [
      {
        path: req.originalUrl,
        message: 'API Not Found',
      },
    ],
  })
  next()
})

//global Error handler
app.use(globalErrorHandler)

export default app
