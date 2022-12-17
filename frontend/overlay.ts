import { z } from "zod";

export const overlaySchema = z.object({
  key: z.string(),
  description: z.string(),
});

export type Overlay = z.infer<typeof overlaySchema>;
