/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes'
import mongoose, { SortOrder } from 'mongoose'
import ApiError from '../../../errors/ApiError'
import { paginationHelper } from '../../../helper/paginationHelper'
import { ISearchTerm, searchHelper } from '../../../helper/searchHelper'
import { IGenericResponse, IPaginationOptions } from '../../interfaces/common'
import { IAdmin } from '../admin/admin.interface'
import { Admin } from '../admin/admin.model'
import { IDonor } from '../donor/donor.interface'
import { Donor } from '../donor/donor.model'
import { IVolunteer } from '../volunteer/volunteer.interface'
import { Volunteer } from '../volunteer/volunteer.model'
import { userSearchableFields } from './user.constant'
import { IUser, IUserData, IUserFilters } from './user.interface'
import { User } from './user.model'

const createUser = async (userData: IUserData): Promise<IUser | null> => {
  // check if user already exists
  const isUserExist = await User.findOne({ email: userData.email })
  if (isUserExist) {
    throw new ApiError(StatusCodes.CONFLICT, 'Email is already exist')
  }

  let newUser = null

  // create user/admin/volunteer/donor using transaction rollback
  const session = await mongoose.startSession()

  try {
    session.startTransaction()

    // create new user (transaction-1)
    const user = await User.create([userData], { session })
    if (!user.length) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user')
    }

    const newUserData: Partial<IAdmin | IVolunteer | IDonor> = {
      name: {
        firstName: userData.name.firstName,
        lastName: userData.name.lastName,
      },
      email: userData.email,
      profileImage: userData.profileImage,
      contactNo: userData.contactNo,
      address: userData.address,
      user: user[0]._id,
    }

    // create new admin/volunteer/donor
    const createParticipant = async (Model: mongoose.Model<any>) => {
      // create new participant (admin/volunteer/donor) (transaction-2)
      const participant = await Model.create([newUserData], { session })

      if (!participant.length) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Failed to create ${userData.role}`,
        )
      }

      // update user with participant reference (transaction-3)
      newUser = await User.findByIdAndUpdate(
        user[0]._id,
        { [userData.role]: participant[0]._id },
        { session, new: true },
      )
    }

    if (userData.role === 'admin') {
      await createParticipant(Admin)
    } else if (userData.role === 'volunteer') {
      await createParticipant(Volunteer)
    } else if (userData.role === 'donor') {
      await createParticipant(Donor)
    } else {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid user role')
    }

    await session.commitTransaction()
    session.endSession()

    return newUser
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw error
  }
}

const getAllUsers = async (
  filter: IUserFilters,
  paginationOptions: IPaginationOptions,
): Promise<IGenericResponse<IUser[]> | null> => {
  const { searchTerm, ...filterData } = filter
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(paginationOptions)

  // add search condition (name,role,email)
  const andCondition = searchHelper.searchCondition(
    searchTerm as ISearchTerm,
    filterData,
    userSearchableFields,
  )

  // sort condition (createdAt,desc)
  const sortCondition: { [key: string]: SortOrder } = {}

  if (sortBy && sortOrder) {
    sortCondition[sortBy] = sortOrder
  }

  const whereCondition = andCondition.length > 0 ? { $and: andCondition } : {}

  const users = await User.find(whereCondition)
    .sort(sortCondition)
    .skip(skip)
    .limit(limit)
  const total = await User.countDocuments(whereCondition)

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: users,
  }
}

const getSingleUser = async (id: string): Promise<IUser | null> => {
  const users = await User.findById(id)

  if (!users) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
  }

  return users
}

export const userService = {
  createUser,
  getAllUsers,
  getSingleUser,
}
