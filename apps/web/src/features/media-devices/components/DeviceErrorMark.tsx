import { XIcon } from "lucide-react";

type Props = { errorLabel: string | null };

// A discreet X in the corner of a device button, for when the device could
// not be captured. The reason is in the button's tooltip.
export const DeviceErrorMark = ({ errorLabel }: Props) => {
    if (!errorLabel) return null;

    return (
        <XIcon
            aria-hidden
            className="pointer-events-none absolute right-0.5 bottom-0.5 size-2.5 text-muted-foreground"
        />
    );
};
