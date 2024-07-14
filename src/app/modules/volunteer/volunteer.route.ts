import express from 'express'
import { USER_ROLE } from '../../enum/user'
import auth from '../../middleware/auth'
import validateRequest from '../../middleware/validateRequest'
import { volunteerController } from './volunteer.controller'
import { volunteerValidation } from './volunteer.validation'

const router = express.Router()

router.patch(
  '/:id',
  validateRequest(volunteerValidation.updateVolunteerZodSchema),
  volunteerController.updateVolunteer,
)
router.delete(
  '/:id',
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
  volunteerController.deleteVolunteer,
)
router.get('/:id', volunteerController.getSingleVolunteer)
router.get('/', volunteerController.getAllVolunteer)

export const volunteerRoute = router
