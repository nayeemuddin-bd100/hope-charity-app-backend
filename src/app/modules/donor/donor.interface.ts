import { Model, Types } from 'mongoose'
import { IUser } from '../user/user.interface'

export type IDonor = {
  name: {
    firstName: string
    lastName: string
  }
  email: string
  profileImage: string
  contactNo: string
  address: string
  user: Types.ObjectId | IUser
  donation?: Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

export type DonorModel = Model<IDonor, Record<string, never>>

export type IDonorFilters = {
  searchTerm?: string
  id?: string
  email?: string
}
