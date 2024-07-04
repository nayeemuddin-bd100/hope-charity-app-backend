import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import catchAsync from '../../../shared/catchAsync'
import pick from '../../../shared/pick'
import sendResponse from '../../../shared/sendResponse'
import { paginationFields } from '../../constant/paginationFields'
import { CustomJwtPayload } from '../../interfaces/common'
import { causeFilterableFields } from './cause.constant'
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

const getAllCauses = catchAsync(async (req: Request, res: Response) => {
  // pick search and pagination and selected fields
  const filter = pick(req.query, causeFilterableFields)
  const paginationOption = pick(req.query, paginationFields)
  const selectFields = pick(req.query, ['fields'])

  const result = await causeService.getAllCauses(
    filter,
    paginationOption,
    selectFields.fields as string,
  )

  sendResponse<ICause[]>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Retrieved Cause successfully',
    meta: result?.meta,
    data: result?.data,
  })
})

const getSingleCause = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id
  const selectFields = pick(req.query, ['fields'])

  const result = await causeService.getSingleCause(
    id,
    selectFields.fields as string,
  )

  sendResponse<ICause>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Cause retrieved successfully',
    data: result,
  })
})

const updateCause = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id
  const updatedData = req?.body

  const result = await causeService.updateCause(id, updatedData)

  sendResponse<ICause>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Cause updated successfully',
    data: result,
  })
})

const deleteCause = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id

  await causeService.deleteCause(id)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Cause Deleted successfully',
    data: null,
  })
})

export const causeController = {
  createCause,
  getAllCauses,
  getSingleCause,
  updateCause,
  deleteCause,
}
