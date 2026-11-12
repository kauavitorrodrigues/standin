import { AnimatePresence, motion, useReducedMotion } from "motion/react";

type Props = { isAway: boolean };

/**
 * A bluish layer with a light blur over the game while the person is away. It
 * fades and blurs in when they leave and out when they return. It takes the
 * clicks meant for the map, and stops taking them as soon as the exit starts.
 * The keyboard is held by `useAwayInputLock`.
 */
export const AwayLayer = ({ isAway }: Props) => {
    const reduce = useReducedMotion();
    const hidden = { opacity: 0, backdropFilter: "blur(0px)" };
    const shown = { opacity: 1, backdropFilter: "blur(3px)" };

    return (
        <AnimatePresence initial={false}>
            {isAway && (
                <motion.div
                    role="presentation"
                    aria-label="Você está ausente"
                    className="absolute inset-0 z-20 bg-primary/5"
                    initial={hidden}
                    animate={shown}
                    exit={{ ...hidden, pointerEvents: "none" }}
                    transition={{
                        duration: reduce ? 0 : 0.35,
                        ease: "easeOut",
                    }}
                />
            )}
        </AnimatePresence>
    );
};
