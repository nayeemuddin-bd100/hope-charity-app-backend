import { StatusCodes } from 'http-status-codes'
import { JsonWebTokenError } from 'jsonwebtoken'
import { IGenericMsgResponse } from '../app/interfaces/common'
import { IGenericErrorMsg } from '../app/interfaces/error'

const handleJsonWebTokenError = (
  err: JsonWebTokenError,
): IGenericMsgResponse => {
  const statusCode = StatusCodes.UNAUTHORIZED

  const error: IGenericErrorMsg[] = [
    {
      path: 'authorization',
      message: 'Invalid token. Please Provide a valid token',
    },
  ]

  return {
    statusCode,
    message: err?.message,
    errorMessages: error,
  }
}

export default handleJsonWebTokenError
