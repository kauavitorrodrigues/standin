import { z } from "zod";

export const searchPeopleSchema = z.object({
    query: z.string(),
});

export type SearchPeopleValues = z.infer<typeof searchPeopleSchema>;
