import type { DECORATOR_FAILURE_MODES } from "@/features/decorator/consts/failure-modes";

export type DecoratorFailureMode =
    (typeof DECORATOR_FAILURE_MODES)[keyof typeof DECORATOR_FAILURE_MODES];
