import { ONBOARDING_TASKS } from "@standin/contracts";
import { DECORATOR_FOCUS_KINDS } from "@/features/decorator/consts/focus-kinds";
import { NO_DECORATOR_FOCUS } from "@/features/decorator/consts/no-focus";
import type { DecoratorFocus } from "@/features/decorator/types/decorator-focus";
import type { OnboardingTaskActions } from "../types/actions";
import type { TaskActionContext } from "../types/taskActionContext";

// The decorator opens on the desk of the person: it is what the task asks
// them to change. Without a desk it opens on nothing.
function decoratorFocusOf(ownDeskId: string | undefined): DecoratorFocus {
    if (!ownDeskId) return NO_DECORATOR_FOCUS;
    return { kind: DECORATOR_FOCUS_KINDS.DESK, id: ownDeskId };
}

// What each task offers in the space. A task the person cannot act on (they
// cannot decorate, say) offers nothing and only says "Entendi".
export function buildTaskActions(
    context: TaskActionContext
): OnboardingTaskActions {
    const actions: OnboardingTaskActions = {
        [ONBOARDING_TASKS.CLAIM_DESK]: context.startDeskGuide,
        [ONBOARDING_TASKS.PERSONALIZE_AVATAR]: context.openAvatarEditor,
    };
    if (context.canDecorate) {
        actions[ONBOARDING_TASKS.CUSTOMIZE_OFFICE] = () =>
            context.openDecorator(decoratorFocusOf(context.ownDeskId));
    }
    return actions;
}
