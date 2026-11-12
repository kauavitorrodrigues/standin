import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

type Props = {
    isAway: boolean;
    // The bar of a person who is away.
    away: ReactNode;
    // The controls of a person who is in the office.
    controls: ReactNode;
};

/**
 * Swaps the control bar for the bar of the away person, one after the other:
 * the one leaving slides down and fades, then the other rises into the same
 * place.
 */
export const AwayControlsSwitch = ({ isAway, away, controls }: Props) => {
    const reduce = useReducedMotion();
    const offscreen = { opacity: 0, y: reduce ? 0 : 12 };

    return (
        <AnimatePresence initial={false} mode="wait">
            <motion.div
                key={isAway ? "away" : "controls"}
                initial={offscreen}
                animate={{ opacity: 1, y: 0 }}
                exit={offscreen}
                transition={{ duration: reduce ? 0 : 0.18, ease: "easeOut" }}
            >
                {isAway ? away : controls}
            </motion.div>
        </AnimatePresence>
    );
};
