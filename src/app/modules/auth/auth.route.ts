import express from 'express'
import { USER_ROLE } from '../../enum/user'
import auth from '../../middleware/auth'
import validateRequest from '../../middleware/validateRequest'
import { authController } from './auth.controller'
import { authValidation } from './auth.validation'

const router = express.Router()

router.post(
  '/login',
  validateRequest(authValidation.loginZodSchema),
  authController.loginUser,
)

router.post(
  '/refresh-token',
  validateRequest(authValidation.refreshTokenZodSchema),
  authController.refreshToken,
)

router.patch(
  '/change-password',
  validateRequest(authValidation.changePasswordZodSchema),
  auth(
    USER_ROLE.SUPER_ADMIN,
    USER_ROLE.ADMIN,
    USER_ROLE.DONOR,
    USER_ROLE.VOLUNTEER,
  ),
  authController.changePassword,
)

export const authRoute = router
