import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import config from '../../../config'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { CustomJwtPayload } from '../../interfaces/common'
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

  // const cookiesOptions = {
  //   secure: config.env === 'production',
  //   httpOnly: true,
  // }

  // res.cookie('refreshToken', refreshToken, cookiesOptions)

  sendResponse<IRefreshTokenResponse>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User Login Successfully',
    data: result,
  })
})

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const user = req?.user as CustomJwtPayload
  const { ...passwordData } = req.body

  const accessToken = req?.headers?.authorization || ''
  const refreshToken = req.cookies.refreshToken || ''

  await authService.changePassword(
    user,
    passwordData,
    accessToken,
    refreshToken,
  )

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Change Password Successfully',
    data: null,
  })
})

const forgetPassword = catchAsync(async (req: Request, res: Response) => {
  const email = req?.body?.email

  const result = await authService.forgetPassword(email)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Reset link is generated successfully',
    data: result,
  })
})

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const token = req?.headers?.authorization || ''

  const result = await authService.resetPassword(req.body, token)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Password updated successfully',
    data: result,
  })
})

export const authController = {
  loginUser,
  refreshToken,
  changePassword,
  forgetPassword,
  resetPassword,
}
