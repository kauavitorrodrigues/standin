import { BackToPartsButton } from "./BackToPartsButton";

// What the page of a new color says when the address has no part. A color is
// added from the part, in the list of parts.
export const NewColorHint = () => (
    <div className="text-muted-foreground flex flex-col items-center gap-4 rounded-xl border border-dashed p-6 text-center text-sm">
        <p>Abra a nova cor a partir de uma peça, na lista de peças.</p>
        <BackToPartsButton />
    </div>
);
