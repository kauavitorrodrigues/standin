import type { ReactNode } from "react";
import { useRealtimeEvents } from "@/features/realtime/hooks/useRealtimeEvents";

export const RealtimeProvider = ({ children }: { children: ReactNode }) => {
    useRealtimeEvents();
    return children;
};
