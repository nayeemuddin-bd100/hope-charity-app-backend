import { StatusCodes } from 'http-status-codes'
import { TokenExpiredError } from 'jsonwebtoken'
import { IGenericMsgResponse } from '../app/interfaces/common'
import { IGenericErrorMsg } from '../app/interfaces/error'

const handleTokenExpiredError = (
  err: TokenExpiredError,
): IGenericMsgResponse => {
  const statusCode = StatusCodes.UNAUTHORIZED

  const error: IGenericErrorMsg[] = [
    {
      path: '',
      message: 'Your token has expired. Please login again',
    },
  ]

  return {
    statusCode,
    message: err.message,
    errorMessages: error,
  }
}

export default handleTokenExpiredError
