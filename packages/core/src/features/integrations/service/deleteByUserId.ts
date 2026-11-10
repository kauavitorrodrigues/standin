import type { Transaction } from "@standin/database";
import { IntegrationRepository } from "../repository";

/** For the deletion of an account, inside its transaction: no token stays. */
export const deleteIntegrationsByUserId = async (
    userId: string,
    tx: Transaction
): Promise<void> => {
    await IntegrationRepository.deleteConnectionsOfUser(tx, userId);
};
