import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { IUser } from './user.interface'
import { userService } from './user.service'

const createStudent = catchAsync(async (req: Request, res: Response) => {
  const { ...userData } = req.body

  const result = await userService.createUser(userData)

  sendResponse<IUser>(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'User created successfully',
    data: result,
  })
})

export const userController = {
  createStudent,
}
