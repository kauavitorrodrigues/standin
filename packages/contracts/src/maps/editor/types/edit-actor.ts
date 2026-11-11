// Who is editing. The scope rules compare it with the owner of a desk.
// `canEdit` says the actor may edit the map itself (an owner or an editor),
// not only decorate it. Missing means no.
export type EditActor = { userId: string; canEdit?: boolean };
