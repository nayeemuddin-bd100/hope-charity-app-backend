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
    profileImage: { type: String },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'super-admin', 'volunteer', 'donor'],
      default: 'donor',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
)

export const User = model<IUser, UserModel>('User', userSchema)
