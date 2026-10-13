import type { MetaItem } from "@/types/meta";

// The options of a select, one per key of a meta record, in its order.
export const toMetaOptions = <T extends string>(meta: Record<T, MetaItem>) =>
    (Object.keys(meta) as T[]).map((value) => ({ value, ...meta[value] }));
