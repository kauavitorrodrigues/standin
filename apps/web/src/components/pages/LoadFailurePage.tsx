import { useEffect, useState } from "react";
import { CloudOffIcon, TriangleAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LOAD_FAILURE_MESSAGES } from "@/consts/load-failure-messages";
import { getLoadFailureKind } from "@/utils/getLoadFailureKind";

// Shown when part of the app could not be loaded, like a page whose file did
// not download. With no connection it says so and loads the page again by
// itself as soon as the connection is back. The page is loaded again, and not
// only the route: the browser keeps a file that failed to load as failed until
// the page is reloaded, so trying the route again would fail the same way.
export const LoadFailurePage = () => {
    const [isOnline, setIsOnline] = useState(() => navigator.onLine);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            window.location.reload();
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    const isOffline = getLoadFailureKind(isOnline) === "offline";
    const Icon = isOffline ? CloudOffIcon : TriangleAlertIcon;

    return (
        <main
            data-testid="load-failure-page"
            className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center"
        >
            <Icon className="text-muted-foreground size-10" />
            <h1 className="text-lg font-medium">
                {isOffline
                    ? LOAD_FAILURE_MESSAGES.OFFLINE_TITLE
                    : LOAD_FAILURE_MESSAGES.FAILED_TITLE}
            </h1>
            <p className="text-muted-foreground max-w-sm text-sm">
                {isOffline
                    ? LOAD_FAILURE_MESSAGES.OFFLINE_BODY
                    : LOAD_FAILURE_MESSAGES.FAILED_BODY}
            </p>
            <Button onClick={() => window.location.reload()}>
                {LOAD_FAILURE_MESSAGES.RETRY}
            </Button>
        </main>
    );
};
