import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import catchAsync from '../../../shared/catchAsync'
import pick from '../../../shared/pick'
import sendResponse from '../../../shared/sendResponse'
import { paginationFields } from '../../constant/paginationFields'
import { userFilterableFields } from '../../constant/userFilterableFields'
import { IAdmin } from './admin.interface'
import { adminService } from './admin.service'

const getAllAdmin = catchAsync(async (req: Request, res: Response) => {
  // pick search and pagination and selected fields
  const filter = pick(req.query, userFilterableFields)
  const paginationOption = pick(req.query, paginationFields)
  const selectFields = pick(req.query, ['fields'])

  const result = await adminService.getAllAdmin(
    filter,
    paginationOption,
    selectFields.fields as string,
  )

  sendResponse<IAdmin[]>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Admin retrieved successfully',
    meta: result?.meta,
    data: result?.data,
  })
})

const getSingleAdmin = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id
  const selectFields = pick(req.query, ['fields'])
  const result = await adminService.getSingleAdmin(
    id,
    selectFields.fields as string,
  )

  sendResponse<IAdmin>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Admin retrieved successfully',
    data: result,
  })
})

const updateAdmin = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id
  const updatedData = req?.body

  const result = await adminService.updateAdmin(id, updatedData)

  sendResponse<IAdmin>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Admin updated successfully',
    data: result,
  })
})

const deleteAdmin = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id

  await adminService.deleteAdmin(id)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Admin Deleted successfully',
    data: null,
  })
})

export const adminController = {
  getSingleAdmin,
  getAllAdmin,
  updateAdmin,
  deleteAdmin,
}
