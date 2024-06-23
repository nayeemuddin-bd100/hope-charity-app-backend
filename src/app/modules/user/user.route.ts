import express from 'express'
import validateRequest from '../../middleware/validateRequest'
import { userController } from './user.controller'
import { userValidation } from './user.validation'

const router = express.Router()

router.post(
  '/create-user',
  validateRequest(userValidation.createUserZodSchema),
  userController.createStudent,
)

router.get('/:id', userController.getSingleUser)

router.get('/', userController.getAllUsers)

export const userRoute = router
