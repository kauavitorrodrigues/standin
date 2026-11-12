import type { CustomStatus } from "@standin/contracts";
import { createLocalPreference } from "@/lib/createLocalPreference";
import { STATUS_STORAGE_KEYS } from "../consts/availability";
import { parseStoredCustomStatus } from "../utils/customStatus";

// The parts of the status of the local person that more than one component
// reads. The two choices are kept on the device, like the headphones, so they
// survive a reload. Idleness is only the state of this visit.
export const manualAwayPreference = createLocalPreference<boolean>({
    key: STATUS_STORAGE_KEYS.manualAway,
    fallback: false,
    parse: (stored) => stored === true,
});

export const customStatusPreference =
    createLocalPreference<CustomStatus | null>({
        key: STATUS_STORAGE_KEYS.customStatus,
        fallback: null,
        parse: parseStoredCustomStatus,
    });

let isIdle = false;
const idleListeners = new Set<() => void>();

export const getIdle = (): boolean => isIdle;

export const setIdle = (next: boolean): void => {
    if (isIdle === next) return;

    isIdle = next;
    idleListeners.forEach((listener) => listener());
};

// What the idle watcher reports. Five minutes with no input take the person
// away, and the activity that follows does not bring them back: only the
// person does, by returning to the office.
export const handleIdleChange = (isIdle: boolean): void => {
    if (isIdle) setIdle(true);
};

export const subscribeToIdle = (listener: () => void): (() => void) => {
    idleListeners.add(listener);
    return () => idleListeners.delete(listener);
};

// The idle watcher that is running, if any. Speech is reported from where the
// microphone is read, which is not a component of this feature.
let speechListener: ((isSpeaking: boolean) => void) | null = null;

export const setSpeechListener = (
    listener: ((isSpeaking: boolean) => void) | null
): void => {
    speechListener = listener;
};

/** Tells the idle watcher the local microphone started or stopped picking up speech. */
export const reportLocalSpeech = (isSpeaking: boolean): void =>
    speechListener?.(isSpeaking);
