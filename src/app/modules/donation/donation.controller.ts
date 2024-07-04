import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import catchAsync from '../../../shared/catchAsync'
import pick from '../../../shared/pick'
import sendResponse from '../../../shared/sendResponse'
import { paginationFields } from '../../constant/paginationFields'
import { CustomJwtPayload } from '../../interfaces/common'
import { donationFilterableFields } from './donation.constant'
import { IDonation } from './donation.interface'
import { donationService } from './donation.service'

const createDonation = catchAsync(async (req: Request, res: Response) => {
  const user = req?.user as CustomJwtPayload
  const accessToken = req?.headers?.authorization || ''
  const refreshToken = req.cookies.refreshToken || ''
  const donationData = req?.body

  const result = await donationService.createDonation(
    donationData,
    user,
    accessToken,
    refreshToken,
  )

  sendResponse<IDonation>(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Donated successfully',
    data: result,
  })
})

const getSingleDonation = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id
  const selectFields = pick(req.query, ['fields'])

  const result = await donationService.getSingleDonation(
    id,
    selectFields.fields as string,
  )

  sendResponse<IDonation>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Donation retrieved successfully',
    data: result,
  })
})

const getAllDonation = catchAsync(async (req: Request, res: Response) => {
  // pick search and pagination and selected fields
  const filter = pick(req.query, donationFilterableFields)
  const paginationOption = pick(req.query, paginationFields)
  const selectFields = pick(req.query, ['fields'])

  const result = await donationService.getAllDonations(
    filter,
    paginationOption,
    selectFields.fields as string,
  )

  sendResponse<IDonation[]>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Retrieved Donation successfully',
    meta: result?.meta,
    data: result?.data,
  })
})

const deleteDonation = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id
  const user = req?.user as CustomJwtPayload
  const accessToken = req?.headers?.authorization || ''
  const refreshToken = req.cookies.refreshToken || ''

  await donationService.deleteDonation(id, user, accessToken, refreshToken)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Donation Deleted successfully',
    data: null,
  })
})

export const donationController = {
  createDonation,
  getAllDonation,
  getSingleDonation,
  deleteDonation,
}
