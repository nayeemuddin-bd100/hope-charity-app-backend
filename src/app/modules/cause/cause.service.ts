import { StatusCodes } from 'http-status-codes'
import { ObjectId } from 'mongodb'
import mongoose from 'mongoose'
import ApiError from '../../../errors/ApiError'
import { queryHelper } from '../../../helper/queryHelper'
import { selectHelper } from '../../../helper/selectHelper'
import {
  CustomJwtPayload,
  IGenericResponse,
  IPaginationOptions,
} from '../../interfaces/common'
import { Admin } from '../admin/admin.model'
import { Donation } from '../donation/donation.model'
import { Donor } from '../donor/donor.model'
import { User } from '../user/user.model'
import { causeSearchableFields } from './cause.constant'
import { ICause, ICauseData, ICauseFilters } from './cause.interface'
import { Cause } from './cause.model'

const createCause = async (
  payload: ICauseData,
  user: CustomJwtPayload,
  accessToken: string,
  refreshToken: string,
): Promise<ICause | null> => {
  // check user of refreshToken and accessToken is same
  const isUserTokenMatch = await User.isUserTokenMatch(
    accessToken,
    refreshToken,
  )

  if (!isUserTokenMatch) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized access')
  }

  // check user is exist
  const admin = await Admin.findOne({ user: user?._id })
  if (!admin) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Admin not found')
  }

  let cause = null
  const session = await mongoose.startSession()

  try {
    session.startTransaction()

    // create new cause (transaction-1)

    const causeData: Partial<ICause> = {
      title: payload?.title,
      description: payload?.description,
      goalAmount: payload?.goalAmount,
      raisedAmount: 0,
      image: payload?.image,
      createdBy: admin?._id,
    }

    const createdCause = await Cause.create([causeData], { session })
    if (!createdCause.length) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create cause')
    }

    cause = createdCause[0]

    // add cause reference to user (transaction-2)
    const addCauseReferenceToAdmin = await Admin.findByIdAndUpdate(
      admin?._id,
      { $push: { causes: new ObjectId(createdCause[0]._id) } },
      { session, new: true },
    )

    if (!addCauseReferenceToAdmin) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to add cause to user')
    }

    await session.commitTransaction()
    session.endSession()
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw error
  }

  return Cause.findById(cause?._id).populate('createdBy')
}

const getAllCauses = async (
  filter: ICauseFilters,
  paginationOptions: IPaginationOptions,
  selectFields?: string,
): Promise<IGenericResponse<ICause[]> | null> => {
  const queryCondition = await queryHelper(
    filter,
    paginationOptions,
    causeSearchableFields,
    selectFields,
  )

  const { whereCondition, sortCondition, selectCondition, skip, limit, page } =
    queryCondition

  const result = await Cause.find(whereCondition)
    .sort(sortCondition)
    .skip(skip)
    .limit(limit)
    .select(selectCondition)
    .lean()
    .populate('createdBy')

  const total = await Cause.countDocuments(whereCondition)

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  }
}

const getSingleCause = async (
  id: string,
  selectFields?: string,
): Promise<ICause | null> => {
  const selectCondition = selectHelper(selectFields)
  const cause = await Cause.findById(id)
    .select(selectCondition)
    .populate('createdBy')

  if (!cause) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Cause not found')
  }

  return cause
}

const updateCause = async (
  id: string,
  payload: Partial<ICause>,
): Promise<ICause | null> => {
  // check cause is exist
  const isCauseExist = await Cause.findById(id)
  if (!isCauseExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Cause not found')
  }

  const updatedCauseData: Partial<ICause> = {
    title: payload?.title,
    description: payload?.description,
    goalAmount: payload?.goalAmount,
    raisedAmount: payload?.raisedAmount,
    image: payload?.image,
  }

  // check goal amount is greater than raised amount

  if (
    !!payload?.goalAmount &&
    isCauseExist.raisedAmount > payload?.goalAmount
  ) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Goal amount can not be less than raised amount',
    )
  }

  const updatedCause = await Cause.findByIdAndUpdate(id, updatedCauseData, {
    new: true,
  })

  return updatedCause
}

const deleteCause = async (id: string): Promise<void> => {
  // check cause is exist
  const cause = await Cause.findById(id)
  if (!cause) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Cause not found')
  }

  const session = await mongoose.startSession()
  try {
    session.startTransaction()

    //delete cause
    const cause = await Cause.findByIdAndDelete(id, { session })
    if (!cause) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete cause')
    }

    // delete cause reference from admin
    const updatedAdmin = await Admin.findOneAndUpdate(
      { causes: id },
      { $pull: { causes: id } },
      { session, new: true },
    )

    if (!updatedAdmin) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update admin')
    }

    // Delete all donations related to the cause
    const donations = await Donation.find({ cause: id }).session(session)

    const deletedDonations = await Donation.deleteMany(
      { cause: id },
      { session },
    )

    if (!deletedDonations) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete donations')
    }

    // Update donors to remove the donations related to the deleted cause
    const donorIds = donations.map(donation => donation.donor)

    const updatedDonors = await Donor.updateMany(
      { _id: { $in: donorIds } },
      { $pull: { donation: { $in: donations.map(d => d._id) } } },
      { session },
    )

    if (!updatedDonors) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update donors')
    }

    await session.commitTransaction()
    session.endSession()
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw error
  }
}

export const causeService = {
  createCause,
  getAllCauses,
  getSingleCause,
  updateCause,
  deleteCause,
}
