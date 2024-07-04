import { z } from 'zod'

const createCauseZodSchema = z.object({
  body: z
    .object({
      title: z.string({
        required_error: 'Title is required',
      }),
      description: z.string({
        required_error: 'Description is required',
      }),
      goalAmount: z.number({
        required_error: 'Goal amount is required',
      }),
      raisedAmount: z.number({
        required_error: 'Raised amount is required',
      }),
      image: z.string({
        required_error: 'Image is required',
      }),
    })
    .refine(data => data.raisedAmount <= data.goalAmount, {
      message: 'Raised amount cannot be greater than goal amount',
      path: ['raisedAmount'],
    }),
})

const updateCauseZodSchema = z.object({
  body: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      goalAmount: z.number().optional(),
      raisedAmount: z.number().optional(),
      image: z.string().optional(),
    })

    .refine(
      data => {
        const hasGoalAmount = data.goalAmount !== undefined
        const hasRaisedAmount = data.raisedAmount !== undefined
        return (
          (hasGoalAmount && hasRaisedAmount) ||
          (!hasGoalAmount && !hasRaisedAmount)
        )
      },
      {
        message: 'Provide both goal and raised amounts, or neither.',
        path: ['goalAmount', 'raisedAmount'],
      },
    )
    .refine(
      data => {
        if (data.raisedAmount === undefined || data.goalAmount === undefined)
          return true
        return data.raisedAmount <= data.goalAmount
      },
      {
        message: 'Raised amount cannot be greater than goal amount',
        path: ['raisedAmount'],
      },
    ),
})

export const causeValidation = {
  createCauseZodSchema,
  updateCauseZodSchema,
}
