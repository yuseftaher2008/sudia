
import { z } from "zod";

export const UpdateUserSchema = z.strictObject({
    fullName: z.string().trim().min(1).max(200).optional(),
    email: z.email().max(320).optional(),
});

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
