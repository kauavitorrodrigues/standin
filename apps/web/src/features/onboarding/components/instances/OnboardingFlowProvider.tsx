import { useEffect, useMemo, useReducer, useRef, type ReactNode } from "react";
import { OnboardingFlowContext } from "../../contexts/OnboardingFlowContext";
import { ONBOARDING_FLOW_ACTIONS } from "../../consts/flow";
import type { OnboardingFlowControls } from "../../types/flow";
import { INITIAL_FLOW_STATE, flowReducer } from "../../utils/flowReducer";
import { createFlowLifecycle } from "../../utils/flowLifecycle";

// Holds the one flow that is on screen. The progress itself lives in the
// query, this only knows which card is open and what to undo when it ends.
export function OnboardingFlowProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(flowReducer, INITIAL_FLOW_STATE);
    const lifecycleRef = useRef(createFlowLifecycle());

    useEffect(() => {
        const lifecycle = lifecycleRef.current;
        return () => lifecycle.end(true);
    }, []);

    const controls = useMemo<OnboardingFlowControls>(
        () => ({
            active: state.active,
            isActive: (kind) => state.active?.kind === kind,
            open: (flow, options) => {
                lifecycleRef.current.begin(options);
                dispatch({ type: ONBOARDING_FLOW_ACTIONS.OPEN, flow });
            },
            close: () => {
                lifecycleRef.current.end(false);
                dispatch({ type: ONBOARDING_FLOW_ACTIONS.CLOSE });
            },
        }),
        [state.active]
    );

    return (
        <OnboardingFlowContext.Provider value={controls}>
            {children}
        </OnboardingFlowContext.Provider>
    );
}
