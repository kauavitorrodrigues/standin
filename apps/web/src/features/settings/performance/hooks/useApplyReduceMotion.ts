import { useEffect } from "react";
import { usePerformanceSettingsPreference } from "@/features/settings/performance/hooks/usePerformanceSettingsPreference";

// Flags the page for the stylesheet (see index.css), which turns animations
// and transitions off while it is set.
export const useApplyReduceMotion = () => {
    const { reduceMotion } = usePerformanceSettingsPreference();

    useEffect(() => {
        const root = document.documentElement;
        if (reduceMotion) root.dataset.reduceMotion = "true";
        else delete root.dataset.reduceMotion;

        return () => {
            delete root.dataset.reduceMotion;
        };
    }, [reduceMotion]);
};
