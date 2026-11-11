import {
    ASSET_ACTIONS,
    OBJECT_BEHAVIORS,
    type CreateAssetData,
} from "@standin/contracts";
import type { CreateAssetFormValues } from "../types/createForm";
import { NO_ACTION, type CreateAssetAction } from "./actionMeta";
import { ASSET_VALIDATION_MESSAGES } from "./validationMessages";

type ActionBehavior = {
    // Whether the piece has seats to mark on the image.
    hasSeats: boolean;
    // The `action`, `actionParams` and `behavior` the API gets for it.
    build: (
        values: CreateAssetFormValues
    ) => Pick<CreateAssetData, "action" | "actionParams" | "behavior">;
    // What the action still needs from the form, by field.
    validate: (
        values: CreateAssetFormValues
    ) => Partial<Record<keyof CreateAssetFormValues, string>>;
};

// What every action of a new asset does, in one place, so the form, the
// payload and the checks never compare the action by hand.
export const ASSET_ACTION_BEHAVIOR: Record<CreateAssetAction, ActionBehavior> =
    {
        [NO_ACTION]: {
            hasSeats: false,
            build: () => ({}),
            validate: () => ({}),
        },
        [ASSET_ACTIONS.SIT]: {
            hasSeats: true,
            build: (values) => ({
                action: ASSET_ACTIONS.SIT,
                actionParams: { seats: values.seats },
            }),
            validate: (values) => {
                if (values.seats.length > 0) return {};
                return { seats: ASSET_VALIDATION_MESSAGES.SEATS_REQUIRED };
            },
        },
        [OBJECT_BEHAVIORS.EMBEDDED_WEBSITE]: {
            hasSeats: false,
            build: () => ({ behavior: OBJECT_BEHAVIORS.EMBEDDED_WEBSITE }),
            validate: () => ({}),
        },
    };
