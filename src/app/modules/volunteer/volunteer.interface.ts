import { Model, Types } from 'mongoose'
import { IUser } from '../user/user.interface'

export type IVolunteer = {
  name: {
    firstName: string
    lastName: string
  }
  email: string
  profileImage: string
  contactNo: string
  address: string
  user: Types.ObjectId | IUser
  assignedEvents?: Types.ObjectId[]
  blogs?: Types.ObjectId[]
  //   blogs?: Types.ObjectId[] | IBlog[]

  createdAt: Date
  updatedAt: Date
}

export type VolunteerModel = Model<IVolunteer, Record<string, never>>

export type IVolunteerFilters = {
  searchTerm?: string
  id?: string
  email?: string
}
