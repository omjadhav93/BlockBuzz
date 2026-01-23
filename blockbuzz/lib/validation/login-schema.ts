import { z } from "zod";

export const loginSchema = z.object({
    email: z
        .string()
        .email({ message: "Enter a valid Email" }),
    password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters long" })
        .max(50, { message: "Password must not exceed 30 characters" })
        .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        .regex(/[0-9]/, { message: "Password must contain at least one number" })
        .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character" })
});

export type LoginInput = z.infer<typeof loginSchema>;
