import { useContext } from "react";
import { SoundboardLibraryContext } from "../contexts/SoundboardLibraryContext";

export const useSoundboardLibrary = () => useContext(SoundboardLibraryContext);
