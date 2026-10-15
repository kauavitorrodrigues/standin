import type { Cell } from "@standin/contracts";
import { getHoverCell } from "@/features/editor/utils/getHoverCell";
import { isEditable } from "@/features/editor/utils/isEditable";
import { isPanMode } from "@/features/editor/utils/isPanMode";
import { isPanPointer } from "@/features/editor/utils/isPanPointer";
import type { EditorTool } from "@/features/editor/types/tool";
import type { EditorToolRouterOptions } from "@/features/editor/types/EditorToolRouterOptions";
import type {
    ToolContext,
    ToolController,
} from "@/features/editor/types/ToolController";
import type { ToolPointerInput } from "@/features/editor/types/ToolInput";

// The one entry point of the tools. It reads the pointer, finds the cell,
// and hands the event to the controller of the active tool. It knows no tool
// by name: the registry says which controller each one has. Nothing here goes
// through React.
export class EditorToolRouter {
    private readonly options: EditorToolRouterOptions;
    private readonly unsubscribeInput: () => void;
    private readonly unsubscribeStore: () => void;

    private tool: EditorTool;
    private controller: ToolController | null = null;
    private editable: boolean;
    // A press the router accepted, until the button goes up or it is cancelled.
    private gesturing = false;
    // A press that moves the view. Everything up to its release is ignored.
    private panning = false;
    private hovering = false;
    private lastCell: Cell | null = null;
    private hint: string | null = null;

    constructor(options: EditorToolRouterOptions) {
        this.options = options;
        const state = options.store.getState();
        this.tool = state.tool;
        this.editable = isEditable(state);
        this.activate();

        this.unsubscribeStore = options.store.subscribe(this.handleStore);
        this.unsubscribeInput = options.source({
            down: this.handleDown,
            move: this.handleMove,
            up: this.handleUp,
            leave: this.handleLeave,
            cancel: this.cancel,
        });
    }

    // Esc. Always works, so a preview never stays behind.
    cancel = (): void => {
        this.gesturing = false;
        this.controller?.onCancel?.();
    };

    setHint = (text: string | null): void => {
        if (text === this.hint) return;
        this.hint = text;
        this.options.onHint(text);
    };

    destroy(): void {
        this.unsubscribeInput();
        this.unsubscribeStore();
        this.deactivate();
        this.setHint(null);
    }

    private activate(): void {
        const factory = this.options.registry[this.tool];
        this.controller =
            factory?.({ ...this.options.env, setHint: this.setHint }) ?? null;
        this.controller?.onActivate?.();
    }

    private deactivate(): void {
        this.gesturing = false;
        this.hovering = false;
        this.controller?.onDeactivate?.();
        this.controller = null;
    }

    private handleStore = (): void => {
        const state = this.options.store.getState();

        if (state.tool !== this.tool) {
            this.deactivate();
            this.setHint(null);
            this.tool = state.tool;
            this.activate();
        }

        const editable = isEditable(state);
        const lostEditing = this.editable && !editable;
        this.editable = editable;
        if (lostEditing) this.cancel();
    };

    private getCell(input: ToolPointerInput): Cell | null {
        return getHoverCell({
            worldX: input.worldX,
            worldY: input.worldY,
            columns: this.options.columns,
            rows: this.options.rows,
        });
    }

    private buildContext(cell: Cell, input: ToolPointerInput): ToolContext {
        return {
            cell,
            worldX: input.worldX,
            worldY: input.worldY,
            button: input.button,
            alt: input.alt,
            shift: input.shift,
            ctrl: input.ctrl,
            model: this.options.getModel(),
            dispatch: this.options.dispatch,
            setHint: this.setHint,
        };
    }

    private leaveMap(): void {
        if (!this.hovering) return;
        this.hovering = false;
        this.controller?.onPointerLeave?.();
    }

    private handleDown = (input: ToolPointerInput): void => {
        const spaceHeld = this.options.isSpaceHeld();
        if (isPanPointer({ ...input, spaceHeld, tool: this.tool })) {
            this.panning = true;
            this.leaveMap();
            return;
        }
        if (!this.editable || !this.controller) return;

        const cell = this.getCell(input);
        if (!cell) return;

        this.gesturing = true;
        this.lastCell = cell;
        this.hovering = true;
        this.controller.onPointerDown?.(this.buildContext(cell, input));
    };

    private handleMove = (input: ToolPointerInput): void => {
        if (this.panning) return;

        const cell = this.getCell(input);
        if (!cell) {
            // A gesture goes on when the pointer comes back, so only a
            // ghost with nothing running has to go away.
            if (!this.gesturing) this.leaveMap();
            return;
        }

        const spaceHeld = this.options.isSpaceHeld();
        const panMode = isPanMode({ spaceHeld, tool: this.tool });
        if (!this.gesturing && panMode) {
            this.leaveMap();
            return;
        }
        if (!this.editable || !this.controller) {
            this.leaveMap();
            return;
        }

        this.lastCell = cell;
        this.hovering = true;
        this.controller.onPointerMove?.(this.buildContext(cell, input));
    };

    private handleUp = (input: ToolPointerInput): void => {
        if (this.panning) {
            this.panning = false;
            return;
        }
        if (!this.gesturing) return;

        this.gesturing = false;
        // Released outside the map: the gesture ends on the last cell inside.
        const cell = this.getCell(input) ?? this.lastCell;
        if (!cell || !this.editable) return;
        this.controller?.onPointerUp?.(this.buildContext(cell, input));
    };

    private handleLeave = (): void => {
        if (this.gesturing) return;
        this.leaveMap();
    };
}
