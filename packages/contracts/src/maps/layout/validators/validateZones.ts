import { MAX_ZONES_PER_MAP, TILE_SIZE } from "../../consts/constants";
import {
    LAYOUT_ZONES_LAYER_NAME,
    LAYOUT_ZONE_KINDS,
} from "../../schemas/layout.schema";
import { LAYOUT_ISSUE_MESSAGES as Messages } from "../consts/issue-messages";
import { MIN_SPAWN_ZONES, SPAWN_MIN_DISTANCE_TILES } from "../consts/thresholds";
import {
    LAYOUT_ISSUE_CODES as Code,
    createIssue,
    type LayoutValidationResult,
} from "../issues";
import type { LooseLayout } from "../types/loose-layout";
import { readZones } from "./readZones";
import { validateZoneRules } from "./validateZoneRules";

export const validateZones = (layout: LooseLayout): LayoutValidationResult => {
    const result: LayoutValidationResult = { errors: [], warnings: [] };
    const zones = readZones(layout);

    if (zones.length > MAX_ZONES_PER_MAP) {
        result.errors.push(
            createIssue(
                Code.TOO_MANY_ZONES,
                LAYOUT_ZONES_LAYER_NAME,
                Messages.tooManyZones
            )
        );
    }

    result.errors.push(...validateZoneRules(layout));

    const spawns = zones.filter(
        (zone) => zone.kind === LAYOUT_ZONE_KINDS.SPAWN
    );
    if (spawns.length < MIN_SPAWN_ZONES) {
        result.errors.push(
            createIssue(
                Code.SPAWN_MISSING,
                LAYOUT_ZONES_LAYER_NAME,
                Messages.spawnMissing
            )
        );
    }

    const hasCloseSpawns = spawns.some((spawn, index) =>
        spawns
            .slice(index + 1)
            .some(
                (other) =>
                    Math.hypot(spawn.x - other.x, spawn.y - other.y) <
                    SPAWN_MIN_DISTANCE_TILES * TILE_SIZE
            )
    );
    if (hasCloseSpawns) {
        result.warnings.push(
            createIssue(
                Code.SPAWN_TOO_CLOSE,
                LAYOUT_ZONES_LAYER_NAME,
                Messages.spawnTooClose
            )
        );
    }

    return result;
};
