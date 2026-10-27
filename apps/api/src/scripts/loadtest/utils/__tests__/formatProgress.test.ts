import { describe, expect, it } from "vitest";
import { formatProgress } from "../formatProgress";

describe("formatProgress", () => {
    it("shows the time, the rate and the memory of the API", () => {
        expect(
            formatProgress({
                elapsedSec: 5.2,
                durationSec: 20,
                messagesPerSec: 106.7,
                bytesPerSec: 20480,
                rssMb: 221.4,
                cpuPercent: 3.46,
            })
        ).toBe("5s/20s  107 msg/s  20.0 KB/s  rss 221 MB  cpu 3.5%");
    });

    it("says n/a when the memory could not be read", () => {
        expect(
            formatProgress({
                elapsedSec: 1,
                durationSec: 20,
                messagesPerSec: 0,
                bytesPerSec: 0,
                rssMb: null,
                cpuPercent: null,
            })
        ).toContain("rss n/a  cpu n/a");
    });
});
