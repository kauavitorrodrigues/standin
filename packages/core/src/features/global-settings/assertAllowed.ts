import {
    OrganizationCreationBlockedError,
    SignupClosedError,
    SpaceCreationBlockedError,
} from "@standin/contracts";
import { getGlobalSettings } from "./get";

export const assertSignupOpen = async (): Promise<void> => {
    const { allowSignup } = await getGlobalSettings();
    if (!allowSignup) throw new SignupClosedError();
};

export const assertOrganizationCreationAllowed = async (): Promise<void> => {
    const { allowOrganizationCreation } = await getGlobalSettings();
    if (!allowOrganizationCreation)
        throw new OrganizationCreationBlockedError();
};

export const assertSpaceCreationAllowed = async (): Promise<void> => {
    const { allowSpaceCreation } = await getGlobalSettings();
    if (!allowSpaceCreation) throw new SpaceCreationBlockedError();
};
