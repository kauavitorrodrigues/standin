import type { ProximityMagnitude } from "@standin/contracts";
import type { AmbientRule, MagnitudeRule, RulePlayer } from "./types";

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

// Away is out of the office, so it cuts the pair the same way headphones do.
export const awayRule: MagnitudeRule = (playerA, playerB, mag) =>
    playerA.away || playerB.away ? UNCONNECTED : mag;

// Focus mode keeps the magnitude of a strong connection. It only drops the
// ambient ring, which focusModeAmbientRule does. The flag is stored and shown
// to the others.
export const focusModeRule: MagnitudeRule = (_playerA, _playerB, mag) => mag;

// Placeholders for product features that come later. Each one keeps the
// magnitude as it is.
export const lockedClusterRule: MagnitudeRule = (_playerA, _playerB, mag) =>
    mag;
export const teamAreaRule: MagnitudeRule = (_playerA, _playerB, mag) => mag;

export const DEFAULT_MAGNITUDE_RULES: readonly MagnitudeRule[] = [
    privateRoomRule,
    headphonesRule,
    awayRule,
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

// The ambient ring is dropped when either side is in focus mode: a person who
// asked not to be disturbed neither overhears nor is overheard.
export const focusModeAmbientRule: AmbientRule = (playerA, playerB) =>
    !playerA.focusMode && !playerB.focusMode;

export const DEFAULT_AMBIENT_RULES: readonly AmbientRule[] = [
    focusModeAmbientRule,
];

export const allowsAmbient = (
    rules: readonly AmbientRule[],
    playerA: RulePlayer,
    playerB: RulePlayer
): boolean => rules.every((rule) => rule(playerA, playerB));
