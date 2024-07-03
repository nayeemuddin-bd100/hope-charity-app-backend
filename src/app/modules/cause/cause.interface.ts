import { Model, Types } from 'mongoose'
import { IAdmin } from '../admin/admin.interface'

export type ICause = {
  title: string
  description: string
  goalAmount: number
  raisedAmount: number
  image: string
  createdBy: Types.ObjectId | IAdmin
  createdAt: Date
  updatedAt: Date
}

export type CauseModel = Model<ICause, Record<string, never>>

export type ICauseFilters = {
  searchTerm?: string
  id?: string
  title?: string
  description?: string
}
