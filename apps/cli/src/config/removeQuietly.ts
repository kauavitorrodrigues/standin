import fs from "node:fs/promises";

// Deletes a leftover; a leftover that is already gone is not a problem.
export const removeQuietly = async (target: string): Promise<void> => {
    await fs.rm(target, { force: true });
};
