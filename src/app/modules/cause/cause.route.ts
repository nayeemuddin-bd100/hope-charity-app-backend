import express from 'express'
import { USER_ROLE } from '../../enum/user'
import auth from '../../middleware/auth'
import validateRequest from '../../middleware/validateRequest'
import { causeController } from './cause.controller'
import { causeValidation } from './cause.validation'

const router = express.Router()

router.post(
  '/create-cause',
  validateRequest(causeValidation.createCauseZodSchema),
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
  causeController.createCause,
)

router.get('/:id', causeController.getSingleCause)
router.patch(
  '/:id',
  validateRequest(causeValidation.updateCauseZodSchema),
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
  causeController.updateCause,
)
router.delete(
  '/:id',
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
  causeController.deleteCause,
)

router.get('/', causeController.getAllCauses)

export const causeRoute = router
