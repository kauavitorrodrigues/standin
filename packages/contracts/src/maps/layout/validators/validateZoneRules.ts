import type { LayoutIssue } from "../issues";
import type { LooseLayout } from "../types/loose-layout";
import { readZones } from "./readZones";
import { validateZone } from "./validateZone";

/** Zone rules that hold at every moment (the spawn rule is checked apart). */
export const validateZoneRules = (layout: unknown): LayoutIssue[] => {
    const seenKeys = new Set<string>();

    return readZones((layout ?? {}) as LooseLayout).flatMap((zone) =>
        validateZone(zone, seenKeys)
    );
};
