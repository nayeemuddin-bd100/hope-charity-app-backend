import express from 'express'
import validateRequest from '../../middleware/validateRequest'
import { donorController } from './donor.controller'
import { donorValidation } from './donor.validation'

const router = express.Router()

router.patch(
  '/:id',
  validateRequest(donorValidation.updateDonorZodSchema),
  donorController.updateDonor,
)
router.delete('/:id', donorController.deleteDonor)
router.get('/:id', donorController.getSingleDonor)
router.get('/', donorController.getAllDonor)

export const donorRoute = router
