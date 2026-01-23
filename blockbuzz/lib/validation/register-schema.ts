import { z } from "zod";

export const registerSchema = z.object({
    name: z
        .string()
        .min(2, { message: "Name must be at least 2 characters long" })
        .max(100, { message: "Name must not exceed 100 characters" }),
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
        .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character" }),
    location: z
        .string()
        .min(2, { message: "City name must be at least 2 characters long" })
        .max(100, { message: "City name must not exceed 100 characters" })
        .optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
