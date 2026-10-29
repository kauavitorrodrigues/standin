import { useState } from "react";
import { TriangleAlertIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { WEBGL_MESSAGES } from "@/features/game/consts/webgl-messages";
import { getWebglProbe } from "@/features/game/utils/probeWebgl";

// What the person needs to know about the drawing of the game, over the
// canvas: that it cannot draw at all, which replaces the space, or that it
// draws with the CPU, which only warns and can be closed.
export const WebglNotice = () => {
    const { status } = getWebglProbe();
    const [isDismissed, setIsDismissed] = useState(false);

    if (status === "ok") return null;

    if (status === "unsupported") {
        return (
            <div
                data-testid="webgl-unsupported"
                className="absolute inset-0 flex items-center justify-center p-6"
            >
                <Alert variant="destructive" className="max-w-md">
                    <TriangleAlertIcon />
                    <AlertTitle>{WEBGL_MESSAGES.UNSUPPORTED_TITLE}</AlertTitle>
                    <AlertDescription>
                        <p>{WEBGL_MESSAGES.UNSUPPORTED_BODY}</p>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (isDismissed) return null;

    return (
        <div
            data-testid="webgl-software"
            className="absolute inset-x-0 top-3 z-10 flex justify-center px-4"
        >
            <Alert className="bg-background max-w-md">
                <TriangleAlertIcon />
                <AlertTitle>{WEBGL_MESSAGES.SOFTWARE_TITLE}</AlertTitle>
                <AlertDescription>
                    <p>{WEBGL_MESSAGES.SOFTWARE_BODY}</p>
                    <Button
                        size="xs"
                        variant="outline"
                        onClick={() => setIsDismissed(true)}
                    >
                        {WEBGL_MESSAGES.DISMISS}
                    </Button>
                </AlertDescription>
            </Alert>
        </div>
    );
};
