import express from 'express'
import { USER_ROLE } from '../../enum/user'
import auth from '../../middleware/auth'
import validateRequest from '../../middleware/validateRequest'
import { userController } from './user.controller'
import { userValidation } from './user.validation'

const router = express.Router()

router.post(
  '/create-user',
  validateRequest(userValidation.createUserZodSchema),
  userController.createUser,
)

router.get(
  '/me',
  auth(
    USER_ROLE.SUPER_ADMIN,
    USER_ROLE.ADMIN,
    USER_ROLE.DONOR,
    USER_ROLE.VOLUNTEER,
  ),
  userController.getMe,
)

router.get('/:id', userController.getSingleUser)

router.get('/', userController.getAllUsers)

export const userRoute = router
