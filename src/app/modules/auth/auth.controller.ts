import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { Secret } from 'jsonwebtoken'
import config from '../../../config'
import ApiError from '../../../errors/ApiError'
import { jwtHelpers } from '../../../helper/jwtHelper'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { ILoginResponse, IRefreshTokenResponse } from './auth.interface'
import { authService } from './auth.service'

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { ...loginData } = req.body

  const result = await authService.loginUser(loginData)

  const { refreshToken, accessToken } = result

  const cookiesOptions = {
    secure: config.env === 'production',
    httpOnly: true,
  }

  res.cookie('refreshToken', refreshToken, cookiesOptions)

  sendResponse<ILoginResponse>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User Login Successfully',
    data: { accessToken },
  })
})

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies

  const result = await authService.refreshToken(refreshToken)

  const cookiesOptions = {
    secure: config.env === 'production',
    httpOnly: true,
  }

  res.cookie('refreshToken', refreshToken, cookiesOptions)

  sendResponse<IRefreshTokenResponse>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User Login Successfully',
    data: result,
  })
})

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const user = req.user
  const { ...passwordData } = req.body

  const refreshToken = req.cookies.refreshToken
  if (!refreshToken) return null
  const decodedRefreshToken = jwtHelpers.verifyToken(
    refreshToken,
    config.jwt.refresh_secret as Secret,
  )

  if (!decodedRefreshToken) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid refresh token')
  }
  await authService.changePassword(user, passwordData, decodedRefreshToken)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Change Password Successfully',
    data: null,
  })
})

export const authController = {
  loginUser,
  refreshToken,
  changePassword,
}
