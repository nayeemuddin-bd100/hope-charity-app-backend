import express from 'express'
import validateRequest from '../../middleware/validateRequest'
import { adminController } from './admin.controller'
import { adminValidation } from './admin.validation'

const router = express.Router()

router.patch(
  '/:id',
  validateRequest(adminValidation.updateAdminZodSchema),
  adminController.updateAdmin,
)

router.get('/:id', adminController.getSingleAdmin)

router.get('/', adminController.getAllAdmin)

export const adminRoute = router
