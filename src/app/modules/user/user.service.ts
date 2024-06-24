import { StatusCodes } from 'http-status-codes'
import { SortOrder } from 'mongoose'
import ApiError from '../../../errors/ApiError'
import { paginationHelper } from '../../../helper/paginationHelper'
import { ISearchTerm, searchHelper } from '../../../helper/searchHelper'
import { IGenericResponse, IPaginationOptions } from '../../interfaces/common'
import { userSearchableFields } from './user.constant'
import { IUser, IUserFilters } from './user.interface'
import { User } from './user.model'

const createUser = async (userData: IUser): Promise<IUser | null> => {
  // check if user already exists
  const isUserExist = await User.findOne({ email: userData.email })
  if (isUserExist) {
    throw new ApiError(StatusCodes.CONFLICT, 'User already exist')
  }

  // create new user
  const user = await User.create(userData)

  return user
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
