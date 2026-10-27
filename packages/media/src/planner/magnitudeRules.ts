import type { ProximityMagnitude } from "@standin/contracts";
import type { MagnitudeRule, RulePlayer } from "./types";

// Chain of pure overrides: each rule is
// (playerA, playerB, mag) => mag and runs over the result of the previous one.

const UNCONNECTED: ProximityMagnitude = { audio: 0, video: 0 };

// Same rule as apps/web/src/features/game/utils/canCommunicate.ts: two people
// talk only inside the same private room, or when neither is in one.
export const privateRoomRule: MagnitudeRule = (playerA, playerB, mag) =>
    playerA.roomKey === playerB.roomKey ? mag : UNCONNECTED;

// Headphones on either side cuts the pair, so the person with them neither
// hears nor sees anybody, and nobody hears or sees them.
export const headphonesRule: MagnitudeRule = (playerA, playerB, mag) =>
    playerA.headphones || playerB.headphones ? UNCONNECTED : mag;

// Focus mode only matters for the ambient layer, which is dropped for a person
// in focus when the connection is not strong. This planner has strong
// connections only, so the rule keeps the magnitude. The flag is stored and
// shown to the others.
export const focusModeRule: MagnitudeRule = (_playerA, _playerB, mag) => mag;

// Placeholders for product features that come later. Each one keeps the
// magnitude as it is.
export const lockedClusterRule: MagnitudeRule = (_playerA, _playerB, mag) =>
    mag;
export const teamAreaRule: MagnitudeRule = (_playerA, _playerB, mag) => mag;

export const DEFAULT_MAGNITUDE_RULES: readonly MagnitudeRule[] = [
    privateRoomRule,
    headphonesRule,
    focusModeRule,
    lockedClusterRule,
    teamAreaRule,
];

export const applyMagnitudeRules = (
    rules: readonly MagnitudeRule[],
    playerA: RulePlayer,
    playerB: RulePlayer,
    base: ProximityMagnitude
): ProximityMagnitude =>
    rules.reduce((mag, rule) => rule(playerA, playerB, mag), base);
