import { StatusCodes } from 'http-status-codes'
import { ObjectId } from 'mongodb'
import mongoose from 'mongoose'
import ApiError from '../../../errors/ApiError'
import { CustomJwtPayload } from '../../interfaces/common'
import { Admin } from '../admin/admin.model'
import { User } from '../user/user.model'
import { ICause, ICauseData } from './cause.interface'
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
      raisedAmount: payload?.raisedAmount,
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

export const causeService = {
  createCause,
}
