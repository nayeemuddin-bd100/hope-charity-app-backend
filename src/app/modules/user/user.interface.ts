import { Model, Types } from 'mongoose'
import { IAdmin } from '../admin/admin.interface'

export type IUser = {
  name: {
    firstName: string
    lastName: string
  }
  email: string
  password: string
  role: 'admin' | 'super-admin' | 'volunteer' | 'donor'
  admin?: Types.ObjectId | IAdmin
  // donorId?:Types.ObjectId | IDonor
  // volunteerId?: Types.ObjectId | IDonor
  createdAt: Date
  updatedAt: Date
}

export type UserModel = Model<IUser, Record<string, never>>

export type IUserFilters = {
  searchTerm?: string
  id?: string
  email?: string
  role?: string
}

export type UserData = IUser & Partial<IAdmin>
// export type UserData = IUser & Partial<IAdmin | IDonor | IVolunteer>
