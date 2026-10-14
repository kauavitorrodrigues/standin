import { describe, expect, it, vi } from "vitest";
import { EDITOR_TOOLS } from "@/features/editor/consts/tools";
import { PUBLISH_PHASE } from "@/features/editor/consts/publish-phase";
import { EditorToolRouter } from "@/features/editor/lib/EditorToolRouter";
import type { PointerInterceptor } from "@/features/editor/types/PointerInterceptor";
import type {
    ToolInputHandlers,
    ToolPointerInput,
} from "@/features/editor/types/ToolInput";

const input: ToolPointerInput = {
    worldX: 40,
    worldY: 40,
    button: 0,
    leftDown: true,
    alt: false,
    shift: false,
    ctrl: false,
};

const setup = (takesPress: boolean) => {
    let handlers!: ToolInputHandlers;
    const controller = {
        onPointerDown: vi.fn(),
        onPointerMove: vi.fn(),
        onPointerUp: vi.fn(),
        onCancel: vi.fn(),
    };
    const interceptor = {
        press: vi.fn(() => takesPress),
        move: vi.fn(),
        release: vi.fn(),
        isOver: vi.fn(() => false),
        hover: vi.fn(),
        cancel: vi.fn(),
    } satisfies PointerInterceptor;
    const router = new EditorToolRouter({
        registry: { [EDITOR_TOOLS.PAINT]: () => controller },
        source: (next) => {
            handlers = next;
            return () => undefined;
        },
        store: {
            getState: () => ({
                tool: EDITOR_TOOLS.PAINT,
                publishPhase: PUBLISH_PHASE.IDLE,
                locked: false,
            }),
            subscribe: () => () => undefined,
        },
        env: { scene: {} as never, store: {} as never },
        columns: 40,
        rows: 30,
        isSpaceHeld: () => false,
        getModel: () => ({}) as never,
        dispatch: () => ({ ok: true }),
        onHint: () => undefined,
        interceptor,
    });
    return { handlers: () => handlers, controller, interceptor, router };
};

describe("EditorToolRouter interceptor", () => {
    it("keeps the whole gesture away from the tool when it takes the press", () => {
        const { handlers, controller, interceptor } = setup(true);

        handlers().down(input);
        handlers().move(input);
        handlers().up(input);

        expect(interceptor.move).toHaveBeenCalledTimes(1);
        expect(interceptor.release).toHaveBeenCalledTimes(1);
        expect(controller.onPointerDown).not.toHaveBeenCalled();
        expect(controller.onPointerMove).not.toHaveBeenCalled();
        expect(controller.onPointerUp).not.toHaveBeenCalled();
    });

    it("hands the press to the tool when the interceptor lets it go", () => {
        const { handlers, controller, interceptor } = setup(false);

        handlers().down(input);
        handlers().up(input);

        expect(controller.onPointerDown).toHaveBeenCalledTimes(1);
        expect(controller.onPointerUp).toHaveBeenCalledTimes(1);
        expect(interceptor.release).not.toHaveBeenCalled();
    });

    it("tells the interceptor about moves with no press, and about Esc", () => {
        const { handlers, interceptor } = setup(false);

        handlers().move(input);
        handlers().cancel();

        expect(interceptor.hover).toHaveBeenCalledTimes(1);
        expect(interceptor.cancel).toHaveBeenCalledTimes(1);
    });

    it("leaves the tool out of a move that is over the interceptor", () => {
        const { handlers, controller, interceptor } = setup(false);
        interceptor.isOver.mockReturnValue(true);

        handlers().move({ worldX: 40, worldY: 40 } as never);

        expect(interceptor.hover).toHaveBeenCalledTimes(1);
        expect(controller.onPointerMove).not.toHaveBeenCalled();
    });
});
