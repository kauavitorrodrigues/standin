import type { DECORATOR_FOCUS_KINDS } from "@/features/decorator/consts/focus-kinds";

export type DecoratorFocusKind =
    (typeof DECORATOR_FOCUS_KINDS)[keyof typeof DECORATOR_FOCUS_KINDS];

// Where the decorator opens: on a placed object, on a desk (a placed object
// too, told apart so a later entry can treat it on its own) or nowhere.
export type DecoratorFocus = {
    kind: DecoratorFocusKind;
    id?: string;
};
