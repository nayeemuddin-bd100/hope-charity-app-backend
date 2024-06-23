import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import catchAsync from '../../../shared/catchAsync'
import pick from '../../../shared/pick'
import sendResponse from '../../../shared/sendResponse'
import { userFilterableFields } from './user.constant'
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

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, userFilterableFields)
  const result = await userService.getAllUsers(filter)

  sendResponse<IUser[]>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User retrieved successfully',
    meta: result?.meta,
    data: result?.data,
  })
})

const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id

  const result = await userService.getSingleUser(id)

  sendResponse<IUser>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User retrieved successfully',
    data: result,
  })
})

export const userController = {
  createStudent,
  getSingleUser,
  getAllUsers,
}
