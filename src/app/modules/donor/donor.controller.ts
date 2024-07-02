import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import catchAsync from '../../../shared/catchAsync'
import pick from '../../../shared/pick'
import sendResponse from '../../../shared/sendResponse'
import { paginationFields } from '../../constant/paginationFields'
import { userFilterableFields } from '../../constant/userFilterableFields'
import { IDonor } from './donor.interface'
import { donorService } from './donor.service'

const getAllDonor = catchAsync(async (req: Request, res: Response) => {
  // pick search and pagination and selected fields
  const filter = pick(req.query, userFilterableFields)
  const paginationOption = pick(req.query, paginationFields)
  const selectFields = pick(req.query, ['fields'])

  const result = await donorService.getAllDonor(
    filter,
    paginationOption,
    selectFields.fields as string,
  )

  sendResponse<IDonor[]>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Donor retrieved successfully',
    meta: result?.meta,
    data: result?.data,
  })
})

const getSingleDonor = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id
  const selectFields = pick(req.query, ['fields'])

  const result = await donorService.getSingleDonor(
    id,
    selectFields.fields as string,
  )

  sendResponse<IDonor>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Donor retrieved successfully',
    data: result,
  })
})

const updateDonor = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id
  const updatedData = req?.body

  const result = await donorService.updateDonor(id, updatedData)

  sendResponse<IDonor>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Donor updated successfully',
    data: result,
  })
})

const deleteDonor = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id

  await donorService.deleteDonor(id)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Donor Deleted successfully',
    data: null,
  })
})

export const donorController = {
  getSingleDonor,
  getAllDonor,
  updateDonor,
  deleteDonor,
}
