import express from 'express'
import { adminRoute } from '../modules/admin/admin.route'
import { userRoute } from '../modules/user/user.route'

const router = express.Router()

const moduleRoute = [
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/admin',
    route: adminRoute,
  },
]

moduleRoute.forEach(route => router.use(route.path, route.route))

export default router
