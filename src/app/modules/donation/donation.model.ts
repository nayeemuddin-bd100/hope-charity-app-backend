import { Schema, model } from 'mongoose'
import { DonationModel, IDonation } from './donation.interface'

const donationSchema = new Schema<IDonation, DonationModel>(
  {
    amount: { type: Number, required: true },
    donor: {
      type: Schema.Types.ObjectId,
      ref: 'Donor',
      required: true,
    },
    cause: {
      type: Schema.Types.ObjectId,
      ref: 'Cause',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
)

export const Donation = model<IDonation, DonationModel>(
  'Donation',
  donationSchema,
)
