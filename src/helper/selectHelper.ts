export const selectHelper = (
  fields: string | undefined,
): Record<string, number> => {
  if (!fields) return {}

  const fieldArray = fields.split(',').map(field => field.trim())
  const selectObject: Record<string, number> = {}

  fieldArray.forEach(field => {
    selectObject[field] = 1
  })

  return selectObject
}
