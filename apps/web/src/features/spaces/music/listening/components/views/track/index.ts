import { Cover } from "./Cover";
import { Details } from "./Details";
import { Link } from "./Link";
import { Logo } from "./Logo";
import { Section } from "./Section";

// The pieces of the card of a track. The instance composes them, so each piece
// knows only its own props.
export const TrackCard = { Section, Link, Cover, Details, Logo };
