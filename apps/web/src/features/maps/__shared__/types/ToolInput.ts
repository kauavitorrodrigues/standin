// A pointer event as the router reads it, free of Phaser.
export type ToolPointerInput = {
    worldX: number;
    worldY: number;
    button: number;
    leftDown: boolean;
    alt: boolean;
    shift: boolean;
    ctrl: boolean;
};

export type ToolInputHandlers = {
    down: (input: ToolPointerInput) => void;
    move: (input: ToolPointerInput) => void;
    up: (input: ToolPointerInput) => void;
    // The pointer left the canvas.
    leave: () => void;
    // Esc.
    cancel: () => void;
};

// Subscribes the handlers to the pointer and returns the way to unsubscribe.
export type ToolInputSource = (handlers: ToolInputHandlers) => () => void;
