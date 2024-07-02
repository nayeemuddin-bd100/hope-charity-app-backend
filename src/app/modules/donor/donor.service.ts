/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes'
import mongoose from 'mongoose'
import ApiError from '../../../errors/ApiError'
import { queryHelper } from '../../../helper/queryHelper'
import { selectHelper } from '../../../helper/selectHelper'
import { userSearchableFields } from '../../constant/userSearchableFields'
import { IGenericResponse, IPaginationOptions } from '../../interfaces/common'
import { IAdminFilters } from '../admin/admin.interface'
import { IUser } from '../user/user.interface'
import { User } from '../user/user.model'
import { IDonor } from './donor.interface'
import { Donor } from './donor.model'

const getAllDonor = async (
  filter: IAdminFilters,
  paginationOptions: IPaginationOptions,
  selectFields?: string,
): Promise<IGenericResponse<IDonor[]> | null> => {
  const queryCondition = await queryHelper(
    filter,
    paginationOptions,
    userSearchableFields,
    selectFields,
  )

  const { whereCondition, sortCondition, selectCondition, skip, limit, page } =
    queryCondition

  const result = await Donor.find(whereCondition)
    .sort(sortCondition)
    .skip(skip)
    .limit(limit)
    .select(selectCondition)
    .lean()

  const total = await Donor.countDocuments(whereCondition)

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  }
}

const getSingleDonor = async (
  id: string,
  selectFields?: string,
): Promise<IDonor | null> => {
  const selectCondition = selectHelper(selectFields)
  const donor = await Donor.findById(id).select(selectCondition)

  if (!donor) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Donor not found')
  }

  return donor
}

const updateDonor = async (
  id: string,
  payload: Partial<IDonor>,
): Promise<IDonor | null> => {
  // check donor is exist
  const isDonorExist = await Donor.findById(id)
  if (!isDonorExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Donor not found')
  }

  const { name, ...donorData } = payload
  const updatedDonorData: Partial<IDonor> = { ...donorData }

  //update nested fields
  if (name && Object.keys(name).length > 0) {
    Object.keys(name).forEach(key => {
      const nameKey = `name.${key}` as keyof Partial<IDonor> // `name.firstName`
      ;(updatedDonorData as any)[nameKey] = name[key as keyof typeof name] // name.firstName => updatedDonorData.name.firstName
    })
  }

  // update donor and user()
  const session = await mongoose.startSession()

  try {
    session.startTransaction()

    //transaction-1
    const result = await Donor.findByIdAndUpdate(id, updatedDonorData, {
      new: true,
      session,
    })
    if (!result) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update donor')
    }

    const userUpdateData: Partial<IUser> = {}
    if (name) {
      userUpdateData.name = result.name
    }

    //transaction-2
    const updateUser = await User.findOneAndUpdate(
      { donor: id },
      userUpdateData,
      { new: true, session },
    )

    if (!updateUser) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Failed to update user while updating donor',
      )
    }

    await session.commitTransaction()
    session.endSession()

    return result
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw error
  }
}

const deleteDonor = async (id: string): Promise<void> => {
  // check donor is exist
  const donor = await Donor.findById(id)
  if (!donor) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Donor not found')
  }

  const session = await mongoose.startSession()
  try {
    session.startTransaction()

    //delete donor
    const donor = await Donor.findByIdAndDelete(id, { session })
    if (!donor) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete donor')
    }
    // delete user
    const user = await User.deleteOne({ donor: id }, { session })
    if (user.deletedCount === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete user')
    }
    await session.commitTransaction()
    session.endSession()
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw error
  }
}

export const donorService = {
  getAllDonor,
  getSingleDonor,
  updateDonor,
  deleteDonor,
}
