/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes'
import mongoose from 'mongoose'
import ApiError from '../../../errors/ApiError'
import { queryHelper } from '../../../helper/queryHelper'
import { selectHelper } from '../../../helper/selectHelper'
import { userSearchableFields } from '../../constant/userSearchableFields'
import { IGenericResponse, IPaginationOptions } from '../../interfaces/common'
import { IUser } from '../user/user.interface'
import { User } from '../user/user.model'
import { IVolunteerFilters } from '../volunteer/volunteer.interface'
import { IVolunteer } from './volunteer.interface'
import { Volunteer } from './volunteer.model'

const getAllVolunteer = async (
  filter: IVolunteerFilters,
  paginationOptions: IPaginationOptions,
  selectFields?: string,
): Promise<IGenericResponse<IVolunteer[]> | null> => {
  const queryCondition = await queryHelper(
    filter,
    paginationOptions,
    userSearchableFields,
    selectFields,
  )

  const { whereCondition, sortCondition, selectCondition, skip, limit, page } =
    queryCondition

  const result = await Volunteer.find(whereCondition)
    .sort(sortCondition)
    .skip(skip)
    .limit(limit)
    .select(selectCondition)
    .lean()

  const total = await Volunteer.countDocuments(whereCondition)

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  }
}

const getSingleVolunteer = async (
  id: string,
  selectFields?: string,
): Promise<IVolunteer | null> => {
  const selectCondition = selectHelper(selectFields)

  const volunteer = await Volunteer.findById(id).select(selectCondition)

  if (!volunteer) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Volunteer not found')
  }

  return volunteer
}

const updateVolunteer = async (
  id: string,
  payload: Partial<IVolunteer>,
): Promise<IVolunteer | null> => {
  // check volunteer is exist
  const isVolunteerExist = await Volunteer.findById(id)
  if (!isVolunteerExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Volunteer not found')
  }

  const { name, ...volunteerData } = payload
  const updatedVolunteerData: Partial<IVolunteer> = { ...volunteerData }

  //update nested fields
  if (name && Object.keys(name).length > 0) {
    Object.keys(name).forEach(key => {
      const nameKey = `name.${key}` as keyof Partial<IVolunteer>
      ;(updatedVolunteerData as any)[nameKey] = name[key as keyof typeof name] // name.firstName => updatedVolunteerData.name.firstName
    })
  }

  // update volunteer and user()
  const session = await mongoose.startSession()

  try {
    session.startTransaction()

    //transaction-1
    const result = await Volunteer.findByIdAndUpdate(id, updatedVolunteerData, {
      new: true,
      session,
    })
    if (!result) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update volunteer')
    }

    const userUpdateData: Partial<IUser> = {}
    if (name) {
      userUpdateData.name = result.name
    }

    //transaction-2
    const updateUser = await User.findOneAndUpdate(
      { volunteer: id },
      userUpdateData,
      { new: true, session },
    )

    if (!updateUser) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Failed to update user while updating volunteer',
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

const deleteVolunteer = async (id: string): Promise<void> => {
  // check volunteer is exist
  const volunteer = await Volunteer.findById(id)
  if (!volunteer) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Volunteer not found')
  }

  const session = await mongoose.startSession()
  try {
    session.startTransaction()

    //delete volunteer
    const volunteer = await Volunteer.findByIdAndDelete(id, { session })
    if (!volunteer) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete volunteer')
    }
    // delete user
    const user = await User.deleteOne({ volunteer: id }, { session })
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

export const volunteerService = {
  getAllVolunteer,
  getSingleVolunteer,
  updateVolunteer,
  deleteVolunteer,
}
