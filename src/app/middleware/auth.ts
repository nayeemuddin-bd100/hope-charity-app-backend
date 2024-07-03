import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { Secret } from 'jsonwebtoken'
import config from '../../config'
import ApiError from '../../errors/ApiError'
import { jwtHelpers } from '../../helper/jwtHelper'

const auth =
  (...requiredRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get Token
      const token = req.headers.authorization

      if (!token) {
        throw new ApiError(
          StatusCodes.UNAUTHORIZED,
          'Authorization token required',
        )
      }

      // verify token
      let verifiedUser = null

      verifiedUser = jwtHelpers.verifyToken(token, config.jwt.secret as Secret)

      req.user = verifiedUser // _id, loginUserEmail,role

      //check user role
      if (requiredRoles.length && !requiredRoles.includes(verifiedUser.role)) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'Unauthorized access')
      }

      next()
    } catch (error) {
      next(error)
    }
  }

export default auth
