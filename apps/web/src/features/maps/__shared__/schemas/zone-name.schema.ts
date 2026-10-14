import { z } from "zod";
import { ZONE_MESSAGES } from "@/features/maps/__shared__/consts/messages";

export const zoneNameSchema = z.object({
    label: z.string().trim().min(1, ZONE_MESSAGES.NAME_REQUIRED),
});

export type ZoneNameValues = z.infer<typeof zoneNameSchema>;
