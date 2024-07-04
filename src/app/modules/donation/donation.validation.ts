import { z } from 'zod'

const createdDonationZodSchema = z.object({
  body: z.object({
    amount: z.number({
      required_error: 'Amount is required',
    }),
    cause: z.string({
      required_error: 'Cause ID is required',
    }),
  }),
})

export const donationValidation = {
  createdDonationZodSchema,
}
