import { z } from "zod";

export const swipeBodySchema = z.object({
  profileId: z.string().min(1, "profileId is required"),
  direction: z.enum(["LIKE", "PASS"], {
    errorMap: () => ({ message: 'direction must be "LIKE" or "PASS"' }),
  }),
});

export type SwipeBody = z.infer<typeof swipeBodySchema>;
