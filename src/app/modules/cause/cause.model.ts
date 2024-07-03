import { Schema, model } from 'mongoose'
import { CauseModel, ICause } from './cause.interface'

const causeSchema = new Schema<ICause, CauseModel>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    goalAmount: { type: Number, required: true },
    raisedAmount: { type: Number, required: true },
    image: { type: String, required: true },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
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

export const Cause = model<ICause, CauseModel>('Cause', causeSchema)
