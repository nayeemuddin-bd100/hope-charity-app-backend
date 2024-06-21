import express from 'express'
import { userController } from './user.controller'

const router = express.Router()

router.post('/create-user', userController.createStudent)

// router.post(
//   '/create-student',
//   validateRequest(UserValidation.createStudentZodSchema),
//   userController.createStudent,
// )

export const userRoute = router
