import { IUser } from './user.interface'
import { User } from './user.model'

// TODO: [DONE] [2024-06-21] Add validation to check if the user already exists
// TODO: [Nayeem] [Next day] complete global error middleware

const createUser = async (userData: IUser): Promise<IUser | null> => {
  // check if user already exists
  const isUserExist = await User.findOne({ email: userData.email })
  if (isUserExist) throw new Error('User already exists')

  // create new user
  const user = await User.create(userData)

  return user
}

export const userService = {
  createUser,
}
