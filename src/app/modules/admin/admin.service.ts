/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes'
import mongoose from 'mongoose'
import ApiError from '../../../errors/ApiError'
import { queryHelper } from '../../../helper/queryHelper'
import { selectHelper } from '../../../helper/selectHelper'
import { userSearchableFields } from '../../constant/userSearchableFields'
import { IGenericResponse, IPaginationOptions } from '../../interfaces/common'
import { IUser, IUserFilters } from '../user/user.interface'
import { User } from '../user/user.model'
import { IAdmin } from './admin.interface'
import { Admin } from './admin.model'

const getAllAdmin = async (
  filter: IUserFilters,
  paginationOptions: IPaginationOptions,
  selectFields?: string,
): Promise<IGenericResponse<IAdmin[]> | null> => {
  const queryCondition = await queryHelper(
    filter,
    paginationOptions,
    userSearchableFields,
    selectFields,
  )

  const { whereCondition, sortCondition, skip, limit, selectCondition, page } =
    queryCondition

  const result = await Admin.find(whereCondition)
    .sort(sortCondition)
    .skip(skip)
    .limit(limit)
    .select(selectCondition)
    .lean()

  const total = await Admin.countDocuments(whereCondition)

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  }
}

const getSingleAdmin = async (
  id: string,
  selectFields?: string,
): Promise<IAdmin | null> => {
  const selectCondition = selectHelper(selectFields)
  const admin = await Admin.findById(id).select(selectCondition)

  if (!admin) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Admin not found')
  }

  return admin
}

const updateAdmin = async (
  id: string,
  payload: Partial<IAdmin>,
): Promise<IAdmin | null> => {
  // check admin is exist
  const isAdminExist = await Admin.findById(id)
  if (!isAdminExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Admin not found')
  }

  const { name, ...adminData } = payload
  const updatedAdminData: Partial<IAdmin> = { ...adminData }

  //update nested fields
  if (name && Object.keys(name).length > 0) {
    Object.keys(name).forEach(key => {
      // here key is firstName or lastName
      const nameKey = `name.${key}` as keyof Partial<IAdmin> // `name.firstName`
      ;(updatedAdminData as any)[nameKey] = name[key as keyof typeof name] // name.firstName => updatedAdminData.name.firstName
    })
  }

  // update admin and user()
  const session = await mongoose.startSession()

  try {
    session.startTransaction()

    //transaction-1
    const result = await Admin.findByIdAndUpdate(id, updatedAdminData, {
      new: true,
      session,
    })
    if (!result) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update admin')
    }

    const userUpdateData: Partial<IUser> = {}
    if (name) {
      userUpdateData.name = result.name
    }

    //transaction-2
    const updateUser = await User.findOneAndUpdate(
      { admin: id },
      userUpdateData,
      { new: true, session },
    )

    if (!updateUser) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Failed to update user while updating admin',
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

const deleteAdmin = async (id: string): Promise<void> => {
  // check admin is exist
  const admin = await Admin.findById(id)
  if (!admin) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Admin not found')
  }

  const session = await mongoose.startSession()
  try {
    session.startTransaction()

    //delete admin
    const admin = await Admin.findByIdAndDelete(id, { session })
    if (!admin) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete admin')
    }
    // delete user
    const user = await User.deleteOne({ admin: id }, { session })
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

export const adminService = {
  getAllAdmin,
  getSingleAdmin,
  updateAdmin,
  deleteAdmin,
}
