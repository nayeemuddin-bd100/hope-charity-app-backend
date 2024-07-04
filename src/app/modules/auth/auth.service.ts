import { StatusCodes } from 'http-status-codes'
import { Secret } from 'jsonwebtoken'
import config from '../../../config'
import ApiError from '../../../errors/ApiError'
import { jwtHelpers } from '../../../helper/jwtHelper'
import { CustomJwtPayload } from '../../interfaces/common'
import { User } from '../user/user.model'
import {
  IChangePassword,
  ILoginResponse,
  ILoginUser,
  IRefreshTokenResponse,
} from './auth.interface'

const loginUser = async (payload: ILoginUser): Promise<ILoginResponse> => {
  const { email, password } = payload

  // Check user is exist
  const isUserExist = await User.isUserExist(email)

  if (!isUserExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, ' User does not found')
  }

  // Check Password
  const isPasswordMatched = await User.isPasswordMatch(
    password,
    isUserExist.password ?? '',
  )

  if (!isPasswordMatched) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Password is incorrect')
  }

  const { _id, email: loginUserEmail, role } = isUserExist
  // Create access token and refresh toke

  const accessToken = jwtHelpers.createToken(
    { _id, loginUserEmail, role },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string,
  )

  const refreshToken = jwtHelpers.createToken(
    { _id, loginUserEmail, role },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string,
  )

  return {
    accessToken,
    refreshToken,
  }
}

const refreshToken = async (token: string): Promise<IRefreshTokenResponse> => {
  // Verify token
  let verifiedToken = null
  try {
    verifiedToken = jwtHelpers.verifyToken(
      token,
      config.jwt.refresh_secret as Secret,
    )
  } catch (err) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Invalid refresh token')
  }

  // Check user is exist
  const { _id, loginUserEmail, role } = verifiedToken
  const isUserExist = await User.isUserExist(loginUserEmail)
  if (!isUserExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
  }
  // create new access token
  const newAccessToken = jwtHelpers.createToken(
    { _id, loginUserEmail, role },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string,
  )
  return {
    accessToken: newAccessToken,
  }
}

const changePassword = async (
  user: CustomJwtPayload,
  passwordData: IChangePassword,
  accessToken: string,
  refreshToken: string,
): Promise<void> => {
  const { oldPassword, newPassword } = passwordData

  // Check user is exist
  const isUserExist = await User.findById(user?._id).select('+password')
  if (!isUserExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
  }

  // check user of refreshToken and accessToken is same
  const isUserTokenMatch = await User.isUserTokenMatch(
    accessToken,
    refreshToken,
  )
  if (!isUserTokenMatch) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized access')
  }
  // Check old password
  const isPasswordMatched = await User.isPasswordMatch(
    oldPassword,
    isUserExist.password ?? '',
  )
  if (!isPasswordMatched) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Old password is incorrect')
  }
  // Update password
  isUserExist.password = newPassword
  await isUserExist.save()
}

const forgetPassword = async (email: string) => {
  //   Check user is exist
  const isUserExist = await User.isUserExist(email)
  if (!isUserExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, ' User does not found')
  }

  const { _id, email: loginUserEmail, role } = isUserExist

  const resetToken = jwtHelpers.createToken(
    { _id, email: loginUserEmail, role },
    config.jwt.secret as Secret,
    '10m',
  )
  const resetUILink = `${config.reset_ui_base_url}?email=${email}&token=${resetToken}`

  //   will be used in production
  //   const resetUIBody = resetUI(resetUILink)
  //   sendEmail(loginUserEmail, resetUIBody)
  return resetUILink
}

const resetPassword = async (
  payload: { email: string; newPassword: string },
  token: string,
) => {
  // Verify token
  let verifiedToken = null
  try {
    verifiedToken = jwtHelpers.verifyToken(token, config.jwt.secret as Secret)
  } catch (err) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Invalid token')
  }
  const { _id, email: loginUserEmail } = verifiedToken

  // Check user is exist
  const isUserExist = await User.findById(_id).select('+password')
  if (!isUserExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
  }

  // check user is same
  const isSameUser = payload?.email === loginUserEmail
  if (!isSameUser) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized access')
  }

  // Update password
  isUserExist.password = payload?.newPassword
  await isUserExist.save()
}

export const authService = {
  loginUser,
  refreshToken,
  changePassword,
  forgetPassword,
  resetPassword,
}
