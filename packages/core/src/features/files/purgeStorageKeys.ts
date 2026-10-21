import { StorageProvider } from "@standin/infra";

/**
 * Removes objects from storage after the transaction that soft deleted their
 * rows committed. It runs when the delete already happened, so a failure is
 * logged and never thrown: a thrown error would report a failed request for
 * work that is done, and the row does not come back.
 */
export const purgeStorageKeys = async (keys: string[]): Promise<void> => {
    await Promise.all(
        keys.map(async (key) => {
            try {
                await StorageProvider.delete(key);
            } catch (error) {
                console.error(error);
            }
        })
    );
};
