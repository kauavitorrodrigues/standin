import { TextFormField } from "@/components/fields/TextFormField";
import { FormIssues } from "@/features/assets/components/views/form/FormIssues";
import { useEditProfileForm } from "../../hooks/useEditProfileForm";
import { AvatarColumn } from "../views/AvatarColumn";
import { ProfilePictureColumn } from "../views/ProfilePictureColumn";
import { FormDialogControls } from "@/components/FormDialogControls";

type Props = { onDone: () => void };

export const EditProfileForm = ({ onDone }: Props) => {
    const { form, isSubmitting, issuesMessage, submit } = useEditProfileForm({
        onDone,
    });

    return (
        <form onSubmit={submit} className="flex flex-col gap-5">
            <div className="flex justify-around py-2">
                <ProfilePictureColumn />
                <AvatarColumn />
            </div>
            <FormIssues message={issuesMessage} />
            <TextFormField
                control={form.control}
                name="name"
                label="Nome completo"
                required
                disabled={isSubmitting}
            />
            <FormDialogControls isSubmitting={isSubmitting} />
        </form>
    );
};
