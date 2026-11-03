import { useContext } from "react";
import { SettingsSpaceContext } from "../contexts/SettingsSpaceContext";
import { SettingsSpaceMissingError } from "../errors/SettingsSpaceMissingError";

/** The space of the settings dialog. Only the sections of the space call it. */
export const useSettingsSpace = () => {
    const space = useContext(SettingsSpaceContext);
    if (!space) throw new SettingsSpaceMissingError();
    return space;
};
