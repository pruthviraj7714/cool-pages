import { z } from 'zod'

export const createButtonSchema = z.object({
  displayText: z
    .string()
    .min(3, { message: "Display text must be at least 3 characters long." }),
  headerId: z.string().optional(),
  subheaderId: z.string().optional(),
  onLeftClickOutput: z.string().optional(),
  onRightClickOutput: z.string().optional(),
  leftClickSubOptions: z.array(z.string()).optional(),
  rightClickSubOptions: z.array(z.string()).optional(),
});

export const createSubHeaderSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters long." }),
  order: z.number(),
  buttons: z.array(createButtonSchema).optional(),
});

export const createHeaderSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters long." }),
  order: z.number(),
  subheaders: z.array(createSubHeaderSchema).optional(),
  buttons: z.array(createButtonSchema).optional(),
});

export const CreatePageSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters long." }),
  headers: z.array(createHeaderSchema).optional(),
});

