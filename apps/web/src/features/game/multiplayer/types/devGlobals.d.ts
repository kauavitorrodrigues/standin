export {};

declare global {
    interface Window {
        // Dev only, see utils/simulateScenario.ts.
        __simulateScenario?: (name: string) => void;
    }
}
