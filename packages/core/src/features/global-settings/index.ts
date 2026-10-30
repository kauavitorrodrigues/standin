import {
    assertOrganizationCreationAllowed,
    assertSignupOpen,
    assertSpaceCreationAllowed,
} from "./assertAllowed";
import { getGlobalCapabilities } from "./getCapabilities";
import { getGlobalSettings } from "./get";
import { getPublicGlobalSettings } from "./getPublic";
import { updateGlobalSettings } from "./update";

export const GlobalSettingsService = {
    get: getGlobalSettings,
    getCapabilities: getGlobalCapabilities,
    getPublic: getPublicGlobalSettings,
    update: updateGlobalSettings,
    assertSignupOpen,
    assertOrganizationCreationAllowed,
    assertSpaceCreationAllowed,
};
