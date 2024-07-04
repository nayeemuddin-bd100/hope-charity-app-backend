import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { CustomJwtPayload } from '../../interfaces/common'
import { ICause } from './cause.interface'
import { causeService } from './cause.service'

const createCause = catchAsync(async (req: Request, res: Response) => {
  const user = req?.user as CustomJwtPayload
  const accessToken = req?.headers?.authorization || ''
  const refreshToken = req.cookies.refreshToken || ''
  const causeData = req?.body

  const result = await causeService.createCause(
    causeData,
    user,
    accessToken,
    refreshToken,
  )

  sendResponse<ICause>(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Cause created successfully',
    data: result,
  })
})

export const causeController = {
  createCause,
}
