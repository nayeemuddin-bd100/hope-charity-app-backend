import express from 'express'
import validateRequest from '../../middleware/validateRequest'
import { volunteerController } from './volunteer.controller'
import { volunteerValidation } from './volunteer.validation'

const router = express.Router()

router.patch(
  '/:id',
  validateRequest(volunteerValidation.updateVolunteerZodSchema),
  volunteerController.updateVolunteer,
)
router.delete('/:id', volunteerController.deleteVolunteer)
router.get('/:id', volunteerController.getSingleVolunteer)
router.get('/', volunteerController.getAllVolunteer)

export const volunteerRoute = router
