import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import catchAsync from '../../../shared/catchAsync'
import pick from '../../../shared/pick'
import sendResponse from '../../../shared/sendResponse'
import { paginationFields } from '../../constant/paginationFields'
import { userFilterableFields } from '../../constant/userFilterableFields'
import { CustomJwtPayload } from '../../interfaces/common'
import { IAdmin } from '../admin/admin.interface'
import { IDonor } from '../donor/donor.interface'
import { IVolunteer } from '../volunteer/volunteer.interface'
import { IUser } from './user.interface'
import { userService } from './user.service'

const createUser = catchAsync(async (req: Request, res: Response) => {
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
  // pick search and pagination and selected fields
  const filter = pick(req.query, userFilterableFields)
  const paginationOption = pick(req.query, paginationFields)
  const selectFields = pick(req.query, ['fields'])

  const result = await userService.getAllUsers(
    filter,
    paginationOption,
    selectFields.fields as string,
  )

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
  const selectFields = pick(req.query, ['fields'])

  const result = await userService.getSingleUser(
    id,
    selectFields.fields as string,
  )

  sendResponse<IUser>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User retrieved successfully',
    data: result,
  })
})

const getMe = catchAsync(async (req, res) => {
  const { loginUserEmail, role } = req.user as CustomJwtPayload
  const result = await userService.getMe(loginUserEmail, role)

  sendResponse<IAdmin | IVolunteer | IDonor | null>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User retrieved successfully',
    data: result,
  })
})

export const userController = {
  createUser,
  getSingleUser,
  getAllUsers,
  getMe,
}
