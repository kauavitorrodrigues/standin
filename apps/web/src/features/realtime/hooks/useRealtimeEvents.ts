import { useChatRealtimeEvents } from "@/features/chat/hooks/useChatRealtimeEvents";
import { useGuestStatusSync } from "@/features/spaces/guests/hooks/useGuestStatusSync";

// Single fan-out entry point: a new feature's socket reaction gets added
// here, not scattered across whatever page happens to render first.
export const useRealtimeEvents = () => {
    useChatRealtimeEvents();
    useGuestStatusSync();
};
