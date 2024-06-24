//  userSearchableFields = ["name.firstName","name.lastName","email", "role"]
// andCondition = [
//   {
//     $or: [
//       { email: { $regex: "test@gmail.com", $options: "i" } },
//       { role: { $regex: "test@gmail.com", $options: "i" } },
//       { name.firstName: { $regex: "test@gmail.com", $options: "i" } },
//       { name.lastName: { $regex: "test@gmail.com", $options: "i" } },
//     ]
//   }
// ]

//   const andCondition = []
//   if (searchTerm) {
//     andCondition.push({
//       $or: userSearchableFields.map(field => ({
//         [field]: {
//           $regex: searchTerm,
//           $options: 'i',
//         },
//       })),
//     })
//   }

// filtersData = { role: "admin", id: "12345" }
// andCondition = [
//   {
//     $or: [
//       { name: { $regex: "bob", $options: "i" } },
//       { email: { $regex: "bob", $options: "i" } }
//     ]
//   },
//   {
//     $and: [
//       { role: "admin" },
//       { id: "12345" }
//     ]
//   }
// ]

//   if (Object.keys(filterData).length) {
//     andCondition.push({
//       $and: Object.entries(filterData).map(([field, value]) => ({
//         [field]: value,
//       })),
//     })
//   }

export type ISearchTerm = {
  searchTerm?: string
}

type IFilterData = {
  searchTerm?: string
  email?: string
  role?: string
}

const searchCondition = (
  searchTerm: ISearchTerm,
  filterData: IFilterData,
  searchableFields: string[],
) => {
  const andCondition = []
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

  return andCondition
}

export const searchHelper = { searchCondition }
