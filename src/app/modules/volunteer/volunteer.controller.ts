import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import catchAsync from '../../../shared/catchAsync'
import pick from '../../../shared/pick'
import sendResponse from '../../../shared/sendResponse'
import { paginationFields } from '../../constant/paginationFields'
import { userFilterableFields } from '../../constant/userFilterableFields'
import { IVolunteer } from './volunteer.interface'
import { volunteerService } from './volunteer.service'

const getAllVolunteer = catchAsync(async (req: Request, res: Response) => {
  // pick search and pagination and selected fields
  const filter = pick(req.query, userFilterableFields)
  const paginationOption = pick(req.query, paginationFields)
  const selectFields = pick(req.query, ['fields'])

  const result = await volunteerService.getAllVolunteer(
    filter,
    paginationOption,
    selectFields.fields as string,
  )

  sendResponse<IVolunteer[]>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Volunteer retrieved successfully',
    meta: result?.meta,
    data: result?.data,
  })
})

const getSingleVolunteer = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id
  const selectFields = pick(req.query, ['fields'])

  const result = await volunteerService.getSingleVolunteer(
    id,
    selectFields.fields as string,
  )

  sendResponse<IVolunteer>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Volunteer retrieved successfully',
    data: result,
  })
})

const updateVolunteer = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id
  const updatedData = req?.body

  const result = await volunteerService.updateVolunteer(id, updatedData)

  sendResponse<IVolunteer>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Volunteer updated successfully',
    data: result,
  })
})

const deleteVolunteer = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id

  await volunteerService.deleteVolunteer(id)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Volunteer Deleted successfully',
    data: null,
  })
})

export const volunteerController = {
  getSingleVolunteer,
  getAllVolunteer,
  updateVolunteer,
  deleteVolunteer,
}
