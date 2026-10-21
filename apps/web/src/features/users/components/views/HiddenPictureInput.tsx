import type { ChangeEventHandler, RefObject } from "react";
import { PROFILE_PICTURE_ACCEPT } from "../../consts/profilePicture";

type Props = {
    inputRef: RefObject<HTMLInputElement | null>;
    disabled: boolean;
    onChange: ChangeEventHandler<HTMLInputElement>;
};

// The file input of a picture. It is never seen: something else opens it.
export const HiddenPictureInput = ({ inputRef, disabled, onChange }: Props) => (
    <input
        ref={inputRef}
        type="file"
        accept={PROFILE_PICTURE_ACCEPT}
        disabled={disabled}
        className="hidden"
        onChange={onChange}
    />
);
