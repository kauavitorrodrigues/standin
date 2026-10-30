// A range in milliseconds, end exclusive.
export type TrimRange = { startMs: number; endMs: number };

export type TrimEdge = keyof TrimRange;

export type TrimEdgeConfig = {
    edge: TrimEdge;
    handleLabel: string;
};

export type HandleDragOptions = {
    durationMs: number;
    range: TrimRange;
    onChange: (range: TrimRange) => void;
};

// The part of a keyboard event the handles read.
export type HandleKeyEvent = Pick<
    KeyboardEvent,
    "key" | "shiftKey" | "preventDefault"
>;
