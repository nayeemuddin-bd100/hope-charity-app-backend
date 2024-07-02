import { z } from 'zod'

const updateVolunteerZodSchema = z.object({
  body: z
    .object({
      name: z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
      }),
      contactNo: z.string().optional(),
      profileImage: z.string().optional(),
      address: z.string().optional(),
    })
    .strict(),
})

export const volunteerValidation = {
  updateVolunteerZodSchema,
}
