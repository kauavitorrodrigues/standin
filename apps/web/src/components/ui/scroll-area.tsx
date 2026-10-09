import * as React from "react";
import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react";
import { cn } from "@/lib/utils";
import { useComposedRefs } from "@/hooks/useComposedRefs";

const DATA_TOP_SCROLL = "data-top-scroll";
const DATA_BOTTOM_SCROLL = "data-bottom-scroll";
const DATA_LEFT_SCROLL = "data-left-scroll";
const DATA_RIGHT_SCROLL = "data-right-scroll";
const DATA_TOP_BOTTOM_SCROLL = "data-top-bottom-scroll";
const DATA_LEFT_RIGHT_SCROLL = "data-left-right-scroll";

const FADE_MASK_CLASSNAMES = [
    "data-[top-scroll=true]:[mask-image:linear-gradient(0deg,#000_calc(100%_-_var(--scroll-shadow-size)),transparent)]",
    "data-[bottom-scroll=true]:[mask-image:linear-gradient(180deg,#000_calc(100%_-_var(--scroll-shadow-size)),transparent)]",
    "data-[top-bottom-scroll=true]:[mask-image:linear-gradient(#000,#000,transparent_0,#000_var(--scroll-shadow-size),#000_calc(100%_-_var(--scroll-shadow-size)),transparent)]",
    "data-[left-scroll=true]:[mask-image:linear-gradient(270deg,#000_calc(100%_-_var(--scroll-shadow-size)),transparent)]",
    "data-[right-scroll=true]:[mask-image:linear-gradient(90deg,#000_calc(100%_-_var(--scroll-shadow-size)),transparent)]",
    "data-[left-right-scroll=true]:[mask-image:linear-gradient(to_right,#000,#000,transparent_0,#000_var(--scroll-shadow-size),#000_calc(100%_-_var(--scroll-shadow-size)),transparent)]",
];

function useScrollFade(
    ref: React.RefObject<HTMLDivElement | null>,
    orientation: "vertical" | "horizontal" | "both",
    enabled: boolean
) {
    React.useLayoutEffect(() => {
        if (!enabled) return;
        const container = ref.current;
        if (!container) return;

        const isVertical = orientation === "vertical" || orientation === "both";
        const isHorizontal =
            orientation === "horizontal" || orientation === "both";

        function onScroll() {
            if (!container) return;

            if (isVertical) {
                const { scrollTop, clientHeight, scrollHeight } = container;
                const hasTop = scrollTop > 0;
                const hasBottom = scrollTop + clientHeight < scrollHeight;
                const scrollable = scrollHeight > clientHeight;

                if (hasTop && hasBottom && scrollable) {
                    container.setAttribute(DATA_TOP_BOTTOM_SCROLL, "true");
                    container.removeAttribute(DATA_TOP_SCROLL);
                    container.removeAttribute(DATA_BOTTOM_SCROLL);
                } else {
                    container.removeAttribute(DATA_TOP_BOTTOM_SCROLL);
                    if (hasTop) container.setAttribute(DATA_TOP_SCROLL, "true");
                    else container.removeAttribute(DATA_TOP_SCROLL);
                    if (hasBottom && scrollable)
                        container.setAttribute(DATA_BOTTOM_SCROLL, "true");
                    else container.removeAttribute(DATA_BOTTOM_SCROLL);
                }
            }

            if (isHorizontal) {
                const { scrollLeft, clientWidth, scrollWidth } = container;
                const hasLeft = scrollLeft > 0;
                const hasRight = scrollLeft + clientWidth < scrollWidth;
                const scrollable = scrollWidth > clientWidth;

                if (hasLeft && hasRight && scrollable) {
                    container.setAttribute(DATA_LEFT_RIGHT_SCROLL, "true");
                    container.removeAttribute(DATA_LEFT_SCROLL);
                    container.removeAttribute(DATA_RIGHT_SCROLL);
                } else {
                    container.removeAttribute(DATA_LEFT_RIGHT_SCROLL);
                    if (hasLeft)
                        container.setAttribute(DATA_LEFT_SCROLL, "true");
                    else container.removeAttribute(DATA_LEFT_SCROLL);
                    if (hasRight && scrollable)
                        container.setAttribute(DATA_RIGHT_SCROLL, "true");
                    else container.removeAttribute(DATA_RIGHT_SCROLL);
                }
            }
        }

        onScroll();
        container.addEventListener("scroll", onScroll);
        window.addEventListener("resize", onScroll);

        const content = container.firstElementChild;
        const resizeObserver = content
            ? new ResizeObserver(onScroll)
            : undefined;
        if (content) resizeObserver?.observe(content);

        return () => {
            container.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
            resizeObserver?.disconnect();
        };
    }, [ref, orientation, enabled]);
}

interface ScrollAreaProps extends React.ComponentProps<
    typeof ScrollAreaPrimitive.Root
> {
    viewportRef?: React.Ref<HTMLDivElement>;
    showShadow?: boolean;
    shadowSize?: number;
    orientation?: "vertical" | "horizontal" | "both";
    scrollBarClassName?: string;
    viewportClassName?: string;
}

function ScrollArea({
    className,
    children,
    viewportRef,
    showShadow = true,
    shadowSize = 40,
    orientation = "vertical",
    scrollBarClassName,
    viewportClassName,
    ...props
}: ScrollAreaProps) {
    const internalViewportRef = React.useRef<HTMLDivElement>(null);
    const composedViewportRef = useComposedRefs(
        viewportRef,
        internalViewportRef
    );
    useScrollFade(internalViewportRef, orientation, showShadow);

    return (
        <ScrollAreaPrimitive.Root
            data-slot="scroll-area"
            className={cn("relative", className)}
            {...props}
        >
            <ScrollAreaPrimitive.Viewport
                ref={composedViewportRef}
                data-slot="scroll-area-viewport"
                style={
                    showShadow
                        ? ({
                            "--scroll-shadow-size": `${shadowSize}px`,
                        } as React.CSSProperties)
                        : undefined
                }
                className={cn(
                    "focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1",
                    showShadow && FADE_MASK_CLASSNAMES,
                    viewportClassName
                )}
            >
                {children}
            </ScrollAreaPrimitive.Viewport>

            {(orientation === "vertical" || orientation === "both") && (
                <ScrollBar
                    orientation="vertical"
                    className={scrollBarClassName}
                />
            )}
            {(orientation === "horizontal" || orientation === "both") && (
                <ScrollBar
                    orientation="horizontal"
                    className={scrollBarClassName}
                />
            )}
            <ScrollAreaPrimitive.Corner />
        </ScrollAreaPrimitive.Root>
    );
}

function ScrollBar({
    className,
    orientation = "vertical",
    ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Scrollbar>) {
    return (
        <ScrollAreaPrimitive.Scrollbar
            data-slot="scroll-area-scrollbar"
            orientation={orientation}
            className={cn(
                "flex touch-none p-px transition-colors select-none",
                orientation === "vertical" &&
                    "h-full w-2.5 border-l border-l-transparent",
                orientation === "horizontal" &&
                    "h-2.5 flex-col border-t border-t-transparent",
                className
            )}
            {...props}
        >
            <ScrollAreaPrimitive.Thumb
                data-slot="scroll-area-thumb"
                className="bg-border relative flex-1 rounded-full"
            />
        </ScrollAreaPrimitive.Scrollbar>
    );
}

export { ScrollArea, ScrollBar };