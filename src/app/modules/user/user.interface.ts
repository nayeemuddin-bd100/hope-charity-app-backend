import { Model } from 'mongoose'

export type IUser = {
  name: {
    firstName: string
    lastName: string
  }
  email: string
  profileImage?: string
  password: string
  role: 'admin' | 'super-admin' | 'volunteer' | 'donor'
  createdAt: Date
  updatedAt: Date
}

export type UserModel = Model<IUser, Record<string, never>>
