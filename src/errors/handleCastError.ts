import mongoose from 'mongoose'
import { IGenericMsgResponse } from '../app/interfaces/common'
import { IGenericErrorMsg } from '../app/interfaces/error'

const handleCastError = (
  err: mongoose.Error.CastError,
): IGenericMsgResponse => {
  const statusCode = 400

  const error: IGenericErrorMsg[] = [
    {
      path: err?.path,
      message: 'Invalid mongoose id',
    },
  ]

  return {
    statusCode,
    message: 'Validation Error',
    errorMessages: error,
  }
}

export default handleCastError
