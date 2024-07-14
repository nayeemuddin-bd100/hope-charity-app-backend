import express from 'express'
import { USER_ROLE } from '../../enum/user'
import auth from '../../middleware/auth'
import validateRequest from '../../middleware/validateRequest'
import { donorController } from './donor.controller'
import { donorValidation } from './donor.validation'

const router = express.Router()

router.patch(
  '/:id',
  validateRequest(donorValidation.updateDonorZodSchema),
  donorController.updateDonor,
)
router.delete(
  '/:id',
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
  donorController.deleteDonor,
)
router.get('/:id', donorController.getSingleDonor)
router.get('/', donorController.getAllDonor)

export const donorRoute = router
