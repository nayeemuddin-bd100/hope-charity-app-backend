import { Schema, model } from 'mongoose'
import { IUser, UserModel } from './user.interface'

const userSchema = new Schema<IUser, UserModel>(
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
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'super-admin', 'volunteer', 'donor'],
      default: 'donor',
    },
    admin: { type: Schema.Types.ObjectId, ref: 'Admin' },
    // donor: { type: Schema.Types.ObjectId, ref: 'Donor' },
    // volunteer: { type: Schema.Types.ObjectId, ref: 'Volunteer' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
)

export const User = model<IUser, UserModel>('User', userSchema)
