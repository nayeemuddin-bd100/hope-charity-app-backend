import express from 'express'
import { adminRoute } from '../modules/admin/admin.route'
import { authRoute } from '../modules/auth/auth.route'
import { causeRoute } from '../modules/cause/cause.route'
import { donorRoute } from '../modules/donor/donor.route'
import { userRoute } from '../modules/user/user.route'
import { volunteerRoute } from '../modules/volunteer/volunteer.route'

const router = express.Router()

const moduleRoute = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/admin',
    route: adminRoute,
  },
  {
    path: '/donor',
    route: donorRoute,
  },
  {
    path: '/volunteer',
    route: volunteerRoute,
  },

  {
    path: '/cause',
    route: causeRoute,
  },
]

moduleRoute.forEach(route => router.use(route.path, route.route))

export default router
