import { z } from "zod";

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254, "Email address is too long.")
    .email("Enter a valid email address."),

  password: z
    .string()
    .min(8, "Password must contain at least 8 characters.")
    .max(72, "Password must contain at most 72 characters."),
});

export type SignInInput = z.infer<typeof signInSchema>;