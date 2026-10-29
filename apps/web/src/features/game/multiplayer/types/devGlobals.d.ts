export {};

declare global {
    interface Window {
        // Dev only, see utils/simulateScenario.ts.
        __simulateScenario?: (name: string) => void;
        // Dev only: when the signaling socket connected and dropped, and its
        // Engine.IO timeouts.
        __connectionReport?: () => import("../lib/ConnectionReporter").ConnectionReport;
    }
}
