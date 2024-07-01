import { Model, Types } from 'mongoose'
import { IUser } from '../user/user.interface'

export type IAdmin = {
  name: {
    firstName: string
    lastName: string
  }
  email: string
  profileImage: string
  contactNo: string
  address: string
  user: Types.ObjectId | IUser
  causes?: Types.ObjectId[]
  events?: Types.ObjectId[]
  blogs?: Types.ObjectId[]
  //   blogs?: Types.ObjectId[] | IBlog[]

  createdAt: Date
  updatedAt: Date
}

export type AdminModel = Model<IAdmin, Record<string, never>>

export type IAdminFilters = {
  searchTerm?: string
  id?: string
  email?: string
}
