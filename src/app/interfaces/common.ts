import { JwtPayload } from 'jsonwebtoken'
import { IGenericErrorMsg } from './error'

export type IGenericResponse<T> = {
  meta: {
    page: number
    limit: number
    total: number
  }
  data: T | null
}

export type IGenericMsgResponse = {
  statusCode: number
  message: string
  errorMessages: IGenericErrorMsg[]
}

export type IPaginationOptions = {
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}

export type CustomJwtPayload = {
  _id: string
  loginUserEmail: string
  role: string
} & JwtPayload
