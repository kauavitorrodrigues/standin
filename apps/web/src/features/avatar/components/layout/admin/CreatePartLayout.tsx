import type { ReactNode } from "react";

type Props = {
    // The form, in the column on the right.
    form: ReactNode;
    // The live preview, in the compact column on the left. It comes first, so
    // on a narrow screen the avatar is above the fields.
    preview: ReactNode;
};

// The two columns of a registration of the avatar admin, centered on the page
// like the creation of a wall style. The avatar needs little room, so the
// preview column is narrow and the fields keep a fixed width beside it.
export const CreatePartLayout = ({ form, preview }: Props) => (
    <div className="mx-auto grid w-full max-w-4xl flex-1 content-center items-start gap-8 py-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,28rem)] lg:justify-center">
        <aside className="bg-card min-w-0 rounded-xl border p-4">
            {preview}
        </aside>
        <div className="min-w-0">{form}</div>
    </div>
);
