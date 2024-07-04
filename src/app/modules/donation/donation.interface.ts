import { Model, Types } from 'mongoose'
import { ICause } from '../cause/cause.interface'
import { IDonor } from '../donor/donor.interface'

export type IDonation = {
  amount: number
  donor: Types.ObjectId | IDonor
  cause: Types.ObjectId | ICause
  createdAt: Date
  updatedAt: Date
}

export type DonationModel = Model<IDonation, Record<string, never>>

export type IDonationFilters = {
  searchTerm?: string
  amount?: string
}

export type IDonationData = {
  amount: number
  cause: string
}
