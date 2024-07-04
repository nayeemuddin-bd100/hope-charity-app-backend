import { Model, Types } from 'mongoose'
import { IAdmin } from '../admin/admin.interface'
import { IDonor } from '../donor/donor.interface'
import { IVolunteer } from '../volunteer/volunteer.interface'

export type IUser = {
  name: {
    firstName: string
    lastName: string
  }
  email: string
  password: string
  role: 'admin' | 'super-admin' | 'volunteer' | 'donor'
  admin?: Types.ObjectId | IAdmin
  donor?: Types.ObjectId | IDonor
  volunteer?: Types.ObjectId | IVolunteer
  createdAt: Date
  updatedAt: Date
}

// export type UserModel = Model<IUser, Record<string, never>>

//static method with export model
export type UserModel = {
  //  checking if user exists
  isUserExist(
    email: string,
  ): Promise<
    (Pick<IUser, 'email' | 'password' | 'role'> & { _id: string }) | null
  >

  //  checking password
  isPasswordMatch(
    givenPassword: string,
    savedPassword: string,
  ): Promise<boolean>

  //checking user of refreshToken and accessToken is same
  isUserTokenMatch(accessToken: string, refreshToken: string): Promise<boolean>
} & Model<IUser>

export type IUserFilters = {
  searchTerm?: string
  id?: string
  email?: string
  role?: string
}

export type IUserData = IUser & Partial<IAdmin | IDonor | IVolunteer>
