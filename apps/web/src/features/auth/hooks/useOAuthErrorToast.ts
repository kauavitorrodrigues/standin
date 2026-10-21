import { useEffect, useRef } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { toast } from "@/components/ui/toast";
import { getOAuthErrorMessage } from "../utils/getOAuthErrorMessage";

/**
 * Shows the error the API left in `?error=` after a failed sign in with a
 * provider, then clears it from the address so a refresh does not repeat it.
 * Only the failure is announced.
 */
export function useOAuthErrorToast() {
    const { error } = useSearch({ from: "/" });
    const navigate = useNavigate();
    const handledRef = useRef<string | null>(null);

    useEffect(() => {
        if (!error || handledRef.current === error) return;
        handledRef.current = error;

        toast.add({ title: getOAuthErrorMessage(error), type: "error" });
        navigate({ to: "/", search: {}, replace: true });
    }, [error, navigate]);
}
