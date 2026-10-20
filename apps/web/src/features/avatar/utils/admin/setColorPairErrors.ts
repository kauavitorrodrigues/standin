import type { UseFormSetError } from "react-hook-form";
import type { ColorPairIssues } from "./getColorPairIssues";

type ColorPairFields = { colorKey: string; colorHex: string };

// Shows the issues of the color pair on their fields and tells whether there
// was any.
export const setColorPairErrors = (
    setError: UseFormSetError<ColorPairFields>,
    issues: ColorPairIssues
): boolean => {
    if (issues.colorKey) setError("colorKey", { message: issues.colorKey });
    if (issues.colorHex) setError("colorHex", { message: issues.colorHex });
    return issues.colorKey !== undefined || issues.colorHex !== undefined;
};
