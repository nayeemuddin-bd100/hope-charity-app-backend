import { SortOrder } from 'mongoose'
import { IPaginationOptions } from '../app/interfaces/common'
import { paginationHelper } from './paginationHelper'
import { selectHelper } from './selectHelper'

export const queryHelper = async (
  filter: Record<string, unknown>,
  paginationOptions: IPaginationOptions,
  searchableFields: string[],
  selectFields?: string,
) => {
  const { searchTerm, ...filterData } = filter
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(paginationOptions)

  const andCondition: Array<Record<string, unknown>> = []
  if (searchTerm) {
    andCondition.push({
      $or: searchableFields.map(field => ({
        [field]: {
          $regex: searchTerm,
          $options: 'i',
        },
      })),
    })
  }

  if (Object.keys(filterData).length) {
    andCondition.push({
      $and: Object.entries(filterData).map(([field, value]) => ({
        [field]: value,
      })),
    })
  }

  const sortCondition: { [key: string]: SortOrder } = {}
  if (sortBy && sortOrder) {
    sortCondition[sortBy] = sortOrder
  }

  const whereCondition = andCondition.length > 0 ? { $and: andCondition } : {}
  const selectCondition = selectHelper(selectFields)

  return {
    whereCondition,
    sortCondition,
    skip,
    limit,
    selectCondition,
    page,
  }
}
