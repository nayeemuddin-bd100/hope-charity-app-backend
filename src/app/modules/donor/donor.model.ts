import { Schema, model } from 'mongoose'
import { DonorModel, IDonor } from './donor.interface'

const donorSchema = new Schema<IDonor, DonorModel>(
  {
    name: {
      type: {
        firstName: {
          type: String,
          required: true,
        },
        lastName: {
          type: String,
          required: true,
        },
      },
      required: true,
    },
    email: { type: String, required: true, unique: true },
    profileImage: { type: String, required: true },
    contactNo: { type: String, required: true },
    address: { type: String, required: true },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    donation: [{ type: Schema.Types.ObjectId, ref: 'Donation' }],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
)

export const Donor = model<IDonor, DonorModel>('Donor', donorSchema)
