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
import { Cause } from '../cause/cause.model'
import { Donor } from '../donor/donor.model'
import { User } from '../user/user.model'
import { donationSearchableFields } from './donation.constant'
import {
  IDonation,
  IDonationData,
  IDonationFilters,
} from './donation.interface'
import { Donation } from './donation.model'

const createDonation = async (
  payload: IDonationData,
  user: CustomJwtPayload,
  accessToken: string,
  refreshToken: string,
): Promise<IDonation | null> => {
  // check user of refreshToken and accessToken is same
  const isUserTokenMatch = await User.isUserTokenMatch(
    accessToken,
    refreshToken,
  )

  if (!isUserTokenMatch) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized access')
  }

  // check cause id is valid
  const cause = await Cause.findById(payload?.cause)
  if (!cause) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Cause does not found')
  }

  const { _id: donorId, role } = user

  //check user role is donor
  if (role !== 'donor') {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      `You are ${role}, Only donor can donate`,
    )
  }

  const raisedAmount = cause?.raisedAmount + payload?.amount

  // check donation amount is less than causes goal amount
  if (raisedAmount > cause?.goalAmount) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Donation amount cannot be greater than goal amount',
    )
  }

  // check user is exist
  const donor = await Donor.findOne({ user: donorId })
  if (!donor) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Donor not found')
  }

  //make donation and add reference to donor
  let donation = null
  const session = await mongoose.startSession()

  try {
    session.startTransaction()

    // create new donation (transaction-1)

    const donationData: Partial<IDonation> = {
      amount: payload?.amount,
      cause: new ObjectId(payload?.cause),
      donor: donor?._id,
    }

    const makeDonation = await Donation.create([donationData], { session })
    if (!makeDonation.length) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to make donation')
    }

    donation = makeDonation[0]

    //update goal amount and raise amount of cause (transaction-2)
    const updateGoalAndRaisedAmount = await Cause.findByIdAndUpdate(
      cause?._id,
      {
        raisedAmount: cause?.raisedAmount + payload?.amount,
      },
      { session },
    )

    if (!updateGoalAndRaisedAmount) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Failed to update goal and raised amount',
      )
    }

    // add donation reference to donor (transaction-3)
    const addDonationReferenceToDonor = await Donor.findByIdAndUpdate(
      donor?._id,
      { $push: { donation: new ObjectId(makeDonation[0]._id) } },
      { session, new: true },
    )

    if (!addDonationReferenceToDonor) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Failed to donation reference to donor',
      )
    }

    await session.commitTransaction()
    session.endSession()
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw error
  }

  return Donation.findById(donation?._id).populate('donor').populate('cause')
}

const getAllDonations = async (
  filter: IDonationFilters,
  paginationOptions: IPaginationOptions,
  selectFields?: string,
): Promise<IGenericResponse<IDonation[]> | null> => {
  const queryCondition = await queryHelper(
    filter,
    paginationOptions,
    donationSearchableFields,
    selectFields,
  )

  const { whereCondition, sortCondition, selectCondition, skip, limit, page } =
    queryCondition

  const result = await Donation.find(whereCondition)
    .sort(sortCondition)
    .skip(skip)
    .limit(limit)
    .select(selectCondition)
    .lean()
    .populate('cause')
    .populate('donor')

  const total = await Donation.countDocuments(whereCondition)

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  }
}

const getSingleDonation = async (
  id: string,
  selectFields?: string,
): Promise<IDonation | null> => {
  const selectCondition = selectHelper(selectFields)
  const donation = await Donation.findById(id)
    .select(selectCondition)
    .populate('donor')
    .populate('cause')

  if (!donation) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Donation does not found')
  }

  return donation
}

const deleteDonation = async (
  id: string,
  user: CustomJwtPayload,
  accessToken: string,
  refreshToken: string,
): Promise<void> => {
  // check user of refreshToken and accessToken is same
  const isUserTokenMatch = await User.isUserTokenMatch(
    accessToken,
    refreshToken,
  )

  if (!isUserTokenMatch) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized access')
  }
  //check user role is admin
  if (user?.role !== 'admin' && user?.role !== 'super-admin') {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      `You are ${user?.role}, Only Admin can delate donation data`,
    )
  }

  // check donation is exist
  const donation = await Donation.findById(id)
  if (!donation) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Donation does not found')
  }

  const session = await mongoose.startSession()
  try {
    session.startTransaction()

    //delete donation
    const deletedDonation = await Donation.findByIdAndDelete(donation?._id, {
      session,
    })

    if (!deletedDonation) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete donation')
    }

    //update  raise amount of cause
    const updateGoalAndRaisedAmount = await Cause.findByIdAndUpdate(
      donation?.cause,
      {
        $inc: {
          raisedAmount: -donation?.amount,
        },
      },
      { session },
    )

    if (!updateGoalAndRaisedAmount) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Failed to update goal and raised amount',
      )
    }

    // delete donation reference from donor
    const updateDonor = await Donor.findByIdAndUpdate(
      donation?.donor,
      { $pull: { donation: donation?._id } },
      { session, new: true },
    )

    if (!updateDonor) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update donor')
    }

    await session.commitTransaction()
    session.endSession()
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw error
  }
}

export const donationService = {
  createDonation,
  getAllDonations,
  getSingleDonation,
  deleteDonation,
}
