import type { PublishOutcome } from "../../publish/types/publish-outcome";

// A dry run only says the ops are valid. A real apply answers like a publish,
// so the caller can emit the events after the commit.
export type ApplyOutcome =
    { validated: true } | ({ validated: false } & PublishOutcome);
