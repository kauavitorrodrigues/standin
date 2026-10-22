import { Link } from "@tanstack/react-router";
import { DoorOpenIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GuestQueries } from "../../queries";

// The spaces the person entered as a guest, on their home. Nothing at all when
// there are none.
export const GuestSpacesSection = () => {
    const { spaces } = GuestQueries.useGuestSpaces();

    if (spaces.length === 0) return null;

    return (
        <section className="flex flex-col gap-3 px-6 pt-6">
            <h2 className="text-sm font-medium text-muted-foreground">
                Espaços em que você é convidado
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {spaces.map((space) => (
                    <Link
                        key={space.id}
                        to="/spaces/$spaceId"
                        params={{ spaceId: space.id }}
                    >
                        <Card
                            size="sm"
                            className="transition-colors hover:bg-muted/50"
                        >
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DoorOpenIcon className="size-4" />
                                    {space.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-xs text-muted-foreground">
                                Convidado
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </section>
    );
};
