import { ServiceTokenNotFoundError } from "@standin/contracts";
import { ServiceTokenRepository } from "../repository";

// Deletes the row for good, an active token included. The token is looked up
// by hash on every request, so it is refused as unknown right after.
export const removeServiceToken = async (id: string): Promise<void> => {
    const removed = await ServiceTokenRepository.remove(id);
    if (!removed) throw new ServiceTokenNotFoundError();
};
