import { Progress } from "@/components/ui/progress";

type Props = { value: number | null };

export const UploadProgress = ({ value }: Props) => {
    if (value === null) return null;

    return <Progress value={value} />;
};
