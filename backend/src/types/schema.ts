import z from "zod";

export const SignUpSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least of 3 characters" }),
  email: z.string().email({ message: "Email should be Valid" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least of 6 characters" }),
});

export const SignInSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least of 3 characters" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least of 6 characters" }),
});

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
  title: z.string().min(3, { message: "Title must be at least 3 characters long." }),
  order: z.number(),
  subheaders: z.array(
    z.object({
      title: z.string().optional(),
      order: z.number(),
      buttons: z
        .array(
          z.object({
            displayText: z.string(),
            leftClickSubOptions: z.any().optional(),
            rightClickSubOptions: z.any().optional(),
            onLeftClickOutput: z.string().optional(),
            onRightClickOutput: z.string().optional(),
          })
        )
        .optional(),
    })
  ).optional(),
  buttons: z
    .array(
      z.object({
        displayText: z.string().optional(),
        leftClickSubOptions: z.any().optional(),
        rightClickSubOptions: z.any().optional(),
        onLeftClickOutput: z.string().optional(),
        onRightClickOutput: z.string().optional(),
      })
    )
    .optional(),
});

export const CreatePageSchema = z.object({
  title: z.string().optional(),
  headers: z.array(createHeaderSchema).optional(),
});