import { SortOrder } from 'mongoose'

type IOptions = {
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'updatedAt'
  sortOrder?: SortOrder
}

type IResult = {
  page: number
  limit: number
  skip: number
  sortBy: 'createdAt' | 'updatedAt'
  sortOrder: SortOrder
}

const calculatePagination = (options: IOptions): IResult => {
  const page = Number(options.page || 1)
  const limit = Number(options.limit || 10)

  const skip = (page - 1) * limit

  const sortBy = options.sortBy || 'createdAt'
  const sortOrder = options.sortOrder || 'desc'

  return {
    page,
    limit,
    skip,
    sortBy,
    sortOrder,
  }
}

export const paginationHelper = { calculatePagination }
