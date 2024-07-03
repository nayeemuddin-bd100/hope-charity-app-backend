import { z } from 'zod'

const loginZodSchema = z.object({
  body: z.object({
    email: z.string({
      required_error: 'Email is required',
    }),
    password: z.string({
      required_error: 'Password is required',
    }),
  }),
})

const refreshTokenZodSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({
      required_error: 'Token is required',
    }),
  }),
})

const forgetPasswordZodSchema = z.object({
  body: z.object({
    id: z.string({
      required_error: 'User id is required',
    }),
  }),
})

const resetPasswordZodSchema = z.object({
  body: z.object({
    id: z.string({
      required_error: 'User id is required',
    }),
    newPassword: z.string({
      required_error: 'Password is required',
    }),
  }),
})

const changePasswordZodSchema = z.object({
  body: z.object({
    oldPassword: z.string({
      required_error: 'Old password is required',
    }),

    newPassword: z.string({
      required_error: 'New password is required',
    }),
  }),
})

export const authValidation = {
  loginZodSchema,
  refreshTokenZodSchema,
  changePasswordZodSchema,
  forgetPasswordZodSchema,
  resetPasswordZodSchema,
}
