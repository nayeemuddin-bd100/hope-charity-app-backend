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

export const userRoute = router
