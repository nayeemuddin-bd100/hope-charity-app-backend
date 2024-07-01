import { Schema, model } from 'mongoose'
import { AdminModel, IAdmin } from './admin.interface'

const adminSchema = new Schema<IAdmin, AdminModel>(
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
    causes: [{ type: Schema.Types.ObjectId, ref: 'Cause' }],
    events: [{ type: Schema.Types.ObjectId, ref: 'Event' }],
    blogs: [{ type: Schema.Types.ObjectId, ref: 'Blog' }],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
)

export const Admin = model<IAdmin, AdminModel>('Admin', adminSchema)
