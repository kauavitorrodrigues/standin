import type { AreaBody } from "@standin/contracts";

// What POST and PUT /library/areas send: the PNG at native resolution and
// the name with the stamp.
export type SaveAreaInput = { image: File; data: AreaBody };
