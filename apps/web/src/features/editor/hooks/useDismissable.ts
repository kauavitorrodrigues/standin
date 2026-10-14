import { useState } from "react";

// A notice that is shown until the user dismisses it.
export const useDismissable = () => {
    const [visible, setVisible] = useState(true);

    return { visible, dismiss: () => setVisible(false) };
};
