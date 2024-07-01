import { Schema, model } from 'mongoose'
import { IVolunteer, VolunteerModel } from './volunteer.interface'

const volunteerSchema = new Schema<IVolunteer, VolunteerModel>(
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
    assignedEvents: [{ type: Schema.Types.ObjectId, ref: 'Event' }],
    blogs: [{ type: Schema.Types.ObjectId, ref: 'Blog' }],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
)

export const Volunteer = model<IVolunteer, VolunteerModel>(
  'Volunteer',
  volunteerSchema,
)
