import { z } from 'zod'

const createUserZodSchema = z.object({
  body: z.object({
    name: z.object({
      firstName: z.string({
        required_error: 'First name is required',
      }),
      lastName: z.string({
        required_error: 'Last name is required',
      }),
    }),

    email: z.string({
      required_error: 'Email is required',
    }),
    password: z.string({
      required_error: 'Password is required',
    }),
    role: z.enum(['admin', 'super-admin', 'volunteer', 'donor']).optional(),
    profileImage: z.string().optional(),
  }),
})

export const userValidation = {
  createUserZodSchema,
}
