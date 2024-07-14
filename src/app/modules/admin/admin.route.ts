import express from 'express'
import { USER_ROLE } from '../../enum/user'
import auth from '../../middleware/auth'
import validateRequest from '../../middleware/validateRequest'
import { adminController } from './admin.controller'
import { adminValidation } from './admin.validation'

const router = express.Router()

router.patch(
  '/:id',
  validateRequest(adminValidation.updateAdminZodSchema),
  adminController.updateAdmin,
)
router.delete(
  '/:id',
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
  adminController.deleteAdmin,
)
router.get('/:id', adminController.getSingleAdmin)
router.get('/', adminController.getAllAdmin)

export const adminRoute = router
