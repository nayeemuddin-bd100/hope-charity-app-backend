import bcrypt from 'bcrypt'
import { Secret } from 'jsonwebtoken'
import { Schema, model } from 'mongoose'
import config from '../../../config'
import { jwtHelpers } from '../../../helper/jwtHelper'
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
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ['admin', 'super-admin', 'volunteer', 'donor'],
      default: 'donor',
    },
    admin: { type: Schema.Types.ObjectId, ref: 'Admin' },
    donor: { type: Schema.Types.ObjectId, ref: 'Donor' },
    volunteer: { type: Schema.Types.ObjectId, ref: 'Volunteer' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
)

// static Method
//checking if user exists
userSchema.statics.isUserExist = async function (
  email: string,
): Promise<
  (Pick<IUser, 'email' | 'password' | 'role'> & { _id: string }) | null
> {
  const user = await User.findOne(
    { email },
    { _id: 1, email: 1, password: 1, role: 1 },
  )

  return user as
    | (Pick<IUser, 'email' | 'password' | 'role'> & { _id: string })
    | null
}

// checking password
userSchema.statics.isPasswordMatch = async function (
  givenPassword: string,
  savedPassword: string,
): Promise<boolean> {
  const isPasswordMatched = await bcrypt.compare(givenPassword, savedPassword)

  return isPasswordMatched
}

// checking user of refreshToken and accessToken is same
userSchema.statics.isUserTokenMatch = async function (
  accessToken: string,
  refreshToken: string,
): Promise<boolean> {
  //access token
  const decodedAccessToken = jwtHelpers.verifyToken(
    accessToken,
    config.jwt.secret as Secret,
  )

  //refresh token
  const decodedRefreshToken = jwtHelpers.verifyToken(
    refreshToken,
    config.jwt.refresh_secret as Secret,
  )

  //decoded token response => _id, loginUserEmail,role

  //check user is same
  return decodedAccessToken?._id === decodedRefreshToken?._id
}

// hook
// hash password before saving
userSchema.pre('save', async function (next) {
  this.password = await bcrypt.hash(
    this.password,
    Number(config.bcrypt_salt_round),
  )
  next()
})

export const User = model<IUser, UserModel>('User', userSchema)
