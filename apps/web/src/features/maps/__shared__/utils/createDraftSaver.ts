import { DRAFT_SAVE_DELAY_MS } from "@/features/maps/__shared__/consts/draft";

// Debounced writer: calls in a row collapse into one write of the latest
// value, DRAFT_SAVE_DELAY_MS after the last call.
export const createDraftSaver = <T>(
    write: (value: T) => void | Promise<unknown>
) => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let pending: { value: T } | null = null;

    const cancel = () => {
        if (timer !== null) clearTimeout(timer);
        timer = null;
        pending = null;
    };

    // Writes the pending value right away, if there is one.
    const flush = async () => {
        const current = pending;
        cancel();
        if (current === null) return;
        await write(current.value);
    };

    const save = (value: T) => {
        if (timer !== null) clearTimeout(timer);
        pending = { value };
        timer = setTimeout(() => {
            void flush();
        }, DRAFT_SAVE_DELAY_MS);
    };

    return { save, flush, cancel };
};
