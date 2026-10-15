import { TriangleAlertIcon } from "lucide-react";

type RoomWarningsProps = {
    warnings: readonly string[];
    notice: string | null;
};

// What is wrong with the doors of the room, and why the last change failed.
export const RoomWarnings = ({ warnings, notice }: RoomWarningsProps) => {
    const lines = notice === null ? warnings : [...warnings, notice];
    if (lines.length === 0) return null;

    return (
        <ul role="alert" className="flex flex-col gap-1">
            {lines.map((line) => (
                <li
                    key={line}
                    className="flex items-start gap-1.5 text-xs text-destructive"
                >
                    <TriangleAlertIcon className="mt-0.5 size-3 shrink-0" />
                    {line}
                </li>
            ))}
        </ul>
    );
};
