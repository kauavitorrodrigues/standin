import type { ReactNode } from "react";
import { SoundboardLibraryContext } from "../../contexts/SoundboardLibraryContext";
import type { SoundboardLibrary } from "../../types/library";

type Props = { library: SoundboardLibrary; children: ReactNode };

// Tells everything under it which library it lists and uploads to.
export const SoundboardLibraryProvider = ({ library, children }: Props) => (
    <SoundboardLibraryContext.Provider value={library}>
        {children}
    </SoundboardLibraryContext.Provider>
);
