import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

type Props = {
    show: boolean;
    children: ReactNode;
    // Half of the gap of the flex parent, in px. A collapsed slot has no width
    // but the parent still puts its gap around it, so the margin takes it back.
    halfGap?: number;
};

// A soft spring with almost no overshoot: the neighbours glide aside and settle.
const SPRING = {
    type: "spring",
    stiffness: 380,
    damping: 32,
    mass: 0.7,
} as const;

// Lets an item of a flex row flow in and out like liquid: the width opens
// first so its neighbours slide aside, while the item itself grows and fades
// in from a slightly smaller size. Use it for any button that comes and goes.
export const PresenceSlot = ({ show, children, halfGap = 2 }: Props) => {
    const reduce = useReducedMotion();
    const hidden = {
        width: 0,
        opacity: 0,
        scale: reduce ? 1 : 0.8,
        marginInline: -halfGap,
    };
    const shown = {
        width: "auto",
        opacity: 1,
        scale: 1,
        marginInline: 0,
    };

    return (
        <AnimatePresence initial={false}>
            {show && (
                <motion.div
                    initial={hidden}
                    animate={shown}
                    exit={hidden}
                    transition={reduce ? { duration: 0 } : SPRING}
                    className="flex shrink-0 items-center justify-center"
                    style={{ transformOrigin: "center" }}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
};
