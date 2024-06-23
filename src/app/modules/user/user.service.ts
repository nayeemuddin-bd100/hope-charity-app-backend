import { StatusCodes } from 'http-status-codes'
import ApiError from '../../../errors/ApiError'
import { IGenericResponse } from '../../interfaces/common'
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

//TODO: add pagination,sorting
const getAllUsers = async (
  filter: IUserFilters,
): Promise<IGenericResponse<IUser[]> | null> => {
  const { searchTerm, ...filterData } = filter

  //  userSearchableFields = ["name.firstName","name.lastName","email", "role"]
  // andCondition = [
  //   {
  //     $or: [
  //       { email: { $regex: "test@gmail.com", $options: "i" } },
  //       { role: { $regex: "test@gmail.com", $options: "i" } },
  //       { name.firstName: { $regex: "test@gmail.com", $options: "i" } },
  //       { name.lastName: { $regex: "test@gmail.com", $options: "i" } },
  //     ]
  //   }
  // ]
  const andCondition = []
  if (searchTerm) {
    andCondition.push({
      $or: userSearchableFields.map(field => ({
        [field]: {
          $regex: searchTerm,
          $options: 'i',
        },
      })),
    })
  }

  // filtersData = { role: "admin", id: "12345" }
  // andCondition = [
  //   {
  //     $or: [
  //       { name: { $regex: "bob", $options: "i" } },
  //       { email: { $regex: "bob", $options: "i" } }
  //     ]
  //   },
  //   {
  //     $and: [
  //       { role: "admin" },
  //       { id: "12345" }
  //     ]
  //   }
  // ]

  if (Object.keys(filterData).length) {
    andCondition.push({
      $and: Object.entries(filterData).map(([field, value]) => ({
        [field]: value,
      })),
    })
  }

  const whereCondition = andCondition.length > 0 ? { $and: andCondition } : {}

  const users = await User.find(whereCondition)
  const total = await User.countDocuments(whereCondition)
  return {
    meta: {
      page: 1,
      limit: 0,
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
