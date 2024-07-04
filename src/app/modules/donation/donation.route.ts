import express from 'express'
import { USER_ROLE } from '../../enum/user'
import auth from '../../middleware/auth'
import validateRequest from '../../middleware/validateRequest'
import { donationController } from './donation.controller'
import { donationValidation } from './donation.validation'

const router = express.Router()

router.post(
  '/donate',
  auth(
    USER_ROLE.SUPER_ADMIN,
    USER_ROLE.ADMIN,
    USER_ROLE.DONOR,
    USER_ROLE.VOLUNTEER,
  ),
  validateRequest(donationValidation.createdDonationZodSchema),
  donationController.createDonation,
)

router.get('/:id', donationController.getSingleDonation)
router.get('/', donationController.getAllDonation)

router.delete(
  '/:id',
  auth(
    USER_ROLE.SUPER_ADMIN,
    USER_ROLE.ADMIN,
    USER_ROLE.DONOR,
    USER_ROLE.VOLUNTEER,
  ),
  donationController.deleteDonation,
)

export const donationRoute = router
