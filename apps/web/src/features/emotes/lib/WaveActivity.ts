import type { WaveRecord } from "@/features/emotes/types/wave";

const EMPTY: WaveRecord = { sentAt: null };

type Listener = () => void;
type ReceivedListener = (senderUserId: string) => void;

/**
 * The waves of this session. For the waves the local person sent, it keeps
 * when, per person, so the card can disable the button during the cooldown. A
 * record is replaced, never changed, so it can be a snapshot for React. The
 * waves they received are not kept, only announced to whoever listens, which
 * shows the toast.
 */
export class WaveActivity {
    private readonly records = new Map<string, WaveRecord>();
    private readonly listeners = new Set<Listener>();
    private readonly receivedListeners = new Set<ReceivedListener>();

    get(userId: string): WaveRecord {
        return this.records.get(userId) ?? EMPTY;
    }

    markSent(userId: string, now: number): void {
        this.records.set(userId, { sentAt: now });
        this.listeners.forEach((listener) => listener());
    }

    markReceived(senderUserId: string): void {
        this.receivedListeners.forEach((listener) => listener(senderUserId));
    }

    subscribe = (listener: Listener): (() => void) => {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    };

    onReceived(listener: ReceivedListener): () => void {
        this.receivedListeners.add(listener);
        return () => {
            this.receivedListeners.delete(listener);
        };
    }
}
